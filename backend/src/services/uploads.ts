import Busboy from 'busboy';
import { extname } from 'node:path';
import { createConnection } from 'node:net';
import { Readable } from 'node:stream';
import type { Request } from 'express';
import { fileTypeFromBuffer } from 'file-type';
import { v2 as cloudinary } from 'cloudinary';
import type { Environment } from '../config/env.js';
import { Asset, FormTicket } from '../domain/models.js';
import { ApiError, unavailable } from '../http/errors.js';
import { digest, token } from '../security/crypto.js';
import type { FormsService } from './forms.js';
import { z } from 'zod';
import { validate } from '../http/errors.js';
export const MB = 1024 * 1024;
// Leaves room for MIME/base64 expansion in ordinary email transports.
export const COMPLAINT_MAX_BYTES = 15 * MB;
export function safeFilename(value: string) {
  return value.split(/[\\/]/).at(-1)!.replace(/[\u0000-\u001f\u007f<>"']/g, '_').slice(0, 200) || 'document';
}
export type Upload = { bytes: Buffer; filename: string; mime: string };
export type StoredUpload = { publicId: string; resourceType: 'image' | 'raw'; deliveryType: 'authenticated'; format: string; bytes: number; version: number; width?: number; height?: number };
export type UploadProvider = { store: (upload: Upload, folder: string, format: string, preserveOriginal?: boolean) => Promise<StoredUpload>; remove: (asset: { publicId: string; resourceType: 'image' | 'raw' }) => Promise<void>; read: (asset: { publicId: string; resourceType: 'image' | 'raw' }) => Promise<Response> };
export type Scanner = (bytes: Buffer) => Promise<'clean' | 'infected'>;
export async function readUpload(req: Request): Promise<Upload> {
  return new Promise((resolve, reject) => {
    let parser;
    try { parser = Busboy({ headers: req.headers, limits: { files: 1, fields: 0, fileSize: 10 * MB, parts: 2, headerPairs: 30 } }); }
    catch { reject(new ApiError(400, 'INVALID_UPLOAD', 'Use multipart/form-data with one file.')); return; }
    let upload: Upload | undefined, failure: Error | undefined;
    parser.on('file', (field, stream, info) => {
      if (field !== 'file') failure = new ApiError(400, 'INVALID_UPLOAD', 'The file field must be named file.');
      const chunks: Buffer[] = [];
      stream.on('limit', () => { failure = new ApiError(413, 'FILE_TOO_LARGE', 'PDFs are limited to 10 MB and images to 5 MB.'); });
      stream.on('data', (chunk: Buffer) => { chunks.push(chunk); });
      stream.on('end', () => { upload = { bytes: Buffer.concat(chunks), filename: info.filename, mime: info.mimeType }; });
      stream.on('error', () => { failure = new ApiError(400, 'INVALID_UPLOAD', 'The upload could not be read.'); });
    });
    for (const event of ['filesLimit', 'fieldsLimit', 'partsLimit']) parser.on(event, () => { failure = new ApiError(400, 'INVALID_UPLOAD', 'Send one file and no additional fields.'); });
    parser.on('error', () => reject(new ApiError(400, 'INVALID_UPLOAD', 'The upload could not be read.')));
    parser.on('close', () => failure ? reject(failure) : upload ? resolve(upload) : reject(new ApiError(400, 'INVALID_UPLOAD', 'A file is required.')));
    req.once('aborted', () => { parser.destroy(); reject(new ApiError(400, 'INVALID_UPLOAD', 'The upload was interrupted.')); });
    req.pipe(parser);
  });
}
export async function inspectUpload(upload: Upload) {
  const detected = await fileTypeFromBuffer(upload.bytes).catch(() => undefined);
  const extension = extname(upload.filename).slice(1).toLowerCase();
  const allowed: Record<string, string[]> = { 'image/jpeg': ['jpg', 'jpeg'], 'image/png': ['png'], 'image/webp': ['webp'], 'application/pdf': ['pdf'] };
  if (!detected || detected.mime !== upload.mime || !allowed[detected.mime]?.includes(extension) || upload.bytes.length === 0) throw new ApiError(400, 'UNSUPPORTED_FILE', 'File contents, type and extension must match a JPG, PNG, WebP or PDF.');
  if (upload.bytes.length > (detected.mime === 'application/pdf' ? 10 : 5) * MB) throw new ApiError(413, 'FILE_TOO_LARGE', 'PDFs are limited to 10 MB and images to 5 MB.');
  return detected;
}
export function clamScanner(env: Environment): Scanner {
  return bytes => new Promise((resolve, reject) => {
    if (!env.CLAMAV_HOST) { reject(unavailable()); return; }
    const socket = createConnection({ host: env.CLAMAV_HOST, port: env.CLAMAV_PORT });
    let reply = ''; const timer = setTimeout(() => { socket.destroy(); reject(unavailable()); }, 15000);
    const close = () => { clearTimeout(timer); socket.destroy(); };
    socket.once('error', () => { close(); reject(unavailable()); });
    socket.on('data', (data: Buffer) => {
      reply += data.toString('utf8');
      if (reply.length > 1024) { close(); reject(unavailable()); return; }
      if (reply.includes('\0') || reply.includes('\n')) {
        close();
        if (/stream: OK/.test(reply)) resolve('clean'); else if (/ FOUND/.test(reply)) resolve('infected'); else reject(unavailable());
      }
    });
    socket.once('end', () => { close(); reject(unavailable()); });
    socket.once('connect', async () => {
      try {
        socket.write('zINSTREAM\0');
        for (let i = 0; i < bytes.length; i += 65536) {
          const chunk = bytes.subarray(i, i + 65536), length = Buffer.alloc(4); length.writeUInt32BE(chunk.length);
          if (!socket.write(Buffer.concat([length, chunk]))) await new Promise<void>((done, fail) => { socket.once('drain', done); socket.once('error', fail); });
        }
        socket.write(Buffer.alloc(4));
      } catch { close(); reject(unavailable()); }
    });
  });
}
export function cloudinaryProvider(env: Environment): UploadProvider {
  const check = () => {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) throw unavailable();
    cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET, secure: true });
  };
  return {
    store: async (upload, folder, format, preserveOriginal = false) => {
      check();
      // Complaint evidence must remain byte-identical, including image files.
      // Raw assets are stored as-is rather than through image transformations.
      const resourceType = preserveOriginal || upload.mime === 'application/pdf' ? 'raw' : 'image';
      const publicId = `${folder}/${token()}${resourceType === 'raw' ? `.${format}` : ''}`;
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ public_id: publicId, resource_type: resourceType, type: 'authenticated', overwrite: false, timeout: 20000 }, (error, result) => {
          if (error || !result) { reject(unavailable()); return; }
          resolve({ publicId: result.public_id, resourceType, deliveryType: 'authenticated', format, bytes: result.bytes, version: result.version,
            ...(result.width ? { width: result.width } : {}), ...(result.height ? { height: result.height } : {}) });
        });
        stream.on('error', () => reject(unavailable()));
        Readable.from(upload.bytes).pipe(stream);
      });
    },
    remove: async asset => { check(); await cloudinary.uploader.destroy(asset.publicId, { resource_type: asset.resourceType, type: 'authenticated', invalidate: true }); },
    read: async asset => {
      check();
      // Signed provider URL is server-to-server only; never redirect or return it.
      const url = cloudinary.url(asset.publicId, { resource_type: asset.resourceType, type: 'authenticated', sign_url: true, secure: true });
      const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'error' });
      if (!response.ok) throw unavailable();
      return response;
    },
  };
}
export function createUploads(env: Environment, forms: FormsService, provider: UploadProvider, scanner: Scanner) {
  return {
    async form(req: Request, value: string, expected: 'complaint' | 'membership') {
      const ticket = await forms.check(value, expected);
      const upload = await readUpload(req), type = await inspectUpload(upload);
      const uploadKey = validate(z.string().uuid().optional(), req.get('X-Upload-Key'));
      const hash = digest(upload.bytes);
      const reused = async () => {
        if (!uploadKey) return null;
        const row = await Asset.findOne({ ticketHash: digest(value), uploadKey, purpose: expected, claimStatus: 'staged', scanStatus: 'clean', stagingExpiresAt: { $gt: new Date() } });
        if (row && row.sha256 !== hash) throw new ApiError(409, 'IDEMPOTENCY_CONFLICT', 'This upload key was used for a different file.');
        return row ? { assetId: row.id, format: row.format, bytes: row.bytes, scanStatus: row.scanStatus } : null;
      };
      const cached = await reused(); if (cached) return cached;
      const maxFiles = expected === 'complaint' ? 5 : 1, maxBytes = expected === 'complaint' ? COMPLAINT_MAX_BYTES : 10 * MB;
      // Reserve quota atomically before invoking external services; failed uploads release it.
      const reserved = await FormTicket.findOneAndUpdate({ _id: ticket._id, consumedAt: null, expiresAt: { $gt: new Date() }, uploadCount: { $lt: maxFiles }, uploadBytes: { $lte: maxBytes - upload.bytes.length } }, { $inc: { uploadCount: 1, uploadBytes: upload.bytes.length } });
      if (!reserved) throw new ApiError(400, 'UPLOAD_LIMIT', 'The form upload limit has been reached.');
      try {
        if (await scanner(upload.bytes) !== 'clean') throw new ApiError(400, 'UNSAFE_FILE', 'The file was rejected by the security scan.');
        const stored = await provider.store(upload, `${env.CLOUDINARY_NAMESPACE}/${expected === 'complaint' ? 'complaints/attachments' : 'membership/payment-proofs'}`, type.ext, expected === 'complaint');
        try {
          const asset = await Asset.create({ ...stored, originalName: safeFilename(upload.filename), sha256: hash, ...(uploadKey ? { uploadKey } : {}), ticketHash: digest(value), purpose: expected, visibility: 'restricted', scanStatus: 'clean', stagingExpiresAt: ticket.expiresAt });
          return { assetId: asset.id, format: asset.format, bytes: asset.bytes, scanStatus: asset.scanStatus };
        } catch (error) { await provider.remove(stored).catch(() => {}); throw error; }
      } catch (error) {
        await FormTicket.updateOne({ _id: ticket._id }, { $inc: { uploadCount: -1, uploadBytes: -upload.bytes.length } });
        const completed = await reused(); if (completed) return completed;
        throw error;
      }
    },
    async admin(req: Request, userId: string, purpose: 'content' | 'certificate') {
      const upload = await readUpload(req), type = await inspectUpload(upload);
      if (await scanner(upload.bytes) !== 'clean') throw new ApiError(400, 'UNSAFE_FILE', 'The file was rejected by the security scan.');
      const stored = await provider.store(upload, `${env.CLOUDINARY_NAMESPACE}/${purpose}`, type.ext);
      try {
        const asset = await Asset.create({ ...stored, sha256: digest(upload.bytes), ownerId: userId, purpose, visibility: 'restricted', scanStatus: 'clean', stagingExpiresAt: new Date(Date.now() + 86400000) });
        return { assetId: asset.id, format: asset.format, bytes: asset.bytes, scanStatus: asset.scanStatus };
      } catch (error) { await provider.remove(stored).catch(() => {}); throw error; }
    },
    async prune() {
      const expired = await Asset.find({ claimStatus: { $in: ['staged', 'deleting'] }, stagingExpiresAt: { $lt: new Date() } }).limit(100);
      for (const asset of expired) {
        const claimed = await Asset.findOneAndUpdate({ _id: asset._id, claimStatus: { $in: ['staged', 'deleting'] } }, { $set: { claimStatus: 'deleting' } });
        if (!claimed) continue;
        await provider.remove(claimed); await Asset.deleteOne({ _id: claimed._id, claimStatus: 'deleting' });
      }
    },
    provider,
  };
}
export type UploadService = ReturnType<typeof createUploads>;
