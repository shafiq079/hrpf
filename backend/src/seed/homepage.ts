import { bumpPublicRevision } from '../services/public-cache.js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import { Asset, AuditLog, Counter, SourceImport, User } from '../domain/models.js';
import { can } from '../security/permissions.js';
import { digest } from '../security/crypto.js';
import { inspectUpload, type UploadProvider } from '../services/uploads.js';
import { verifySources } from './files.js';
import { importRecord, type SeedResult } from './importer.js';
import { recordChecksum, seedId, validateManifest, type Manifest, type SeedRecord } from './manifest.js';

export async function loadHomepageManifest() {
  return validateManifest(JSON.parse(await readFile(new URL('../../seed/homepage-manifest.json', import.meta.url), 'utf8')));
}
export const homepageAssetRoot = new URL('../../seed/home-assets/', import.meta.url);
export function imageMime(path: string) { return path.endsWith('.png') ? 'image/png' : /\.jpe?g$/.test(path) ? 'image/jpeg' : 'image/webp'; }
export async function homepageFiles(manifest: Manifest, root: string) {
  const checks = await verifySources(manifest, root);
  if (checks.some(file => file.status !== 'verified')) throw new Error('Homepage source verification failed.');
  // Cache and recheck all cover bytes before writes; never load arbitrary paths.
  const files = new Map<string, Buffer>();
  for (const source of manifest.files.filter(file => file.id.startsWith('gallery:'))) {
    const bytes = await readFile(resolve(root, source.path));
    if (bytes.length !== source.bytes || digest(bytes) !== source.sha256) throw new Error('Homepage image verification failed.');
    await inspectUpload({ bytes, filename: source.path, mime: imageMime(source.path) });
    files.set(source.id, bytes);
  }
  return files;
}
async function actorAllowed(actorId: string, session?: mongoose.ClientSession) {
  const actor = await User.findOne({ _id: actorId, active: true }).session(session ?? null);
  if (!actor || !can(actor.role, 'content')) throw new Error('An active content administrator or editor is required.');
}
async function publishable(manifest: Manifest, record: SeedRecord, session?: mongoose.ClientSession) {
  const checkpoint = await SourceImport.findOne({ key: record.key, checksum: recordChecksum(manifest, record) }).session(session ?? null);
  if (!checkpoint || checkpoint.entityId.toString() !== seedId(record.key).toString()) return null;
  const row = await mongoose.model(record.kind).findOne({ _id: checkpoint.entityId, __v: 0, status: 'draft', reviewStatus: 'pending' }).session(session ?? null);
  // An admin edit, withdrawal or deletion must never be republished by a rerun.
  if (!row || row.cover || row.publishedAt || row.updatedAt.getTime() !== row.createdAt.getTime()) return null;
  return row;
}
export type HomepageResult = SeedResult | { key: string; status: 'published' | 'admin-preserved' };
export async function publishHomepageRecord(manifest: Manifest, record: SeedRecord, actorId: string, assetId: string | undefined, publicationAction: 'homepage.seed-published' | 'work-project.seed-published' = 'homepage.seed-published') {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      await bumpPublicRevision(session);
      await Counter.findOneAndUpdate({ key: 'security:user-governance' }, { $inc: { sequence: 1 } }, { session, upsert: true });
      await actorAllowed(actorId, session);
      const row = await publishable(manifest, record, session);
      if (!row) return { key: record.key, status: 'admin-preserved' } as const;
      const source = manifest.files.find(file => record.files.includes(file.id) && file.id.startsWith('gallery:'));
      if (source) {
        if (!assetId) throw new Error('A verified cover is required.');
        const asset = await Asset.findOne({ _id: assetId, ownerId: actorId, entityType: record.kind, entityId: row._id, sha256: source.sha256, bytes: source.bytes,
          scanStatus: { $in: ['clean', 'type_checked'] }, deliveryType: 'authenticated', resourceType: 'image', format: source.path.split('.').at(-1)!, purpose: 'content', claimStatus: 'staged', visibility: 'restricted', stagingExpiresAt: { $gt: new Date() } }).session(session);
        if (!asset) throw new Error('A clean owned homepage cover is required.');
        asset.claimStatus = 'claimed'; asset.visibility = 'public'; asset.set('stagingExpiresAt', undefined);
        await asset.save({ session });
        row.cover = { assetId: asset._id, publicId: asset.publicId, resourceType: asset.resourceType, deliveryType: asset.deliveryType, format: asset.format, bytes: asset.bytes, width: asset.width, height: asset.height, version: asset.version, sha256: asset.sha256 };
      } else if (publicationAction !== 'work-project.seed-published' || assetId) throw new Error('A homepage cover is required.');
      row.status = 'published'; row.reviewStatus = 'approved'; row.publishedAt = new Date(); row.__v = 1;
      await row.validate();
      const result = await mongoose.model(record.kind).replaceOne({ _id: row._id, __v: 0, status: 'draft' }, row.toObject(), { session });
      if (!result.matchedCount) throw new Error('Homepage record changed concurrently.');
      await AuditLog.create([{ actorId, action: publicationAction, entityType: record.kind, entityId: row.id, outcome: 'success', changedFields: ['publication', 'cover'] }], { session });
      return { key: record.key, status: 'published' } as const;
    });
  } finally { await session.endSession(); }
}
export async function applyHomepageSeed(options: { manifest: Manifest; files: Map<string, Buffer>; actorId: string; namespace: string; provider: UploadProvider; report?: (result: HomepageResult) => void; publicationAction?: 'homepage.seed-published' | 'work-project.seed-published' }) {
  const { manifest, files, actorId, namespace, provider } = options;
  if (namespace !== 'hrpf/dev') throw new Error('Homepage setup is limited to hrpf/dev.');
  if (manifest.records.some(record => !['Project', 'BlogPost'].includes(record.kind))) throw new Error('Only homepage projects and news may be imported.');
  await actorAllowed(actorId);
  // Verify and inspect the complete batch before the first DB/provider write.
  for (const record of manifest.records) {
    const source = manifest.files.find(file => record.files.includes(file.id) && file.id.startsWith('gallery:'));
    const bytes = source && files.get(source.id);
    if (!source && options.publicationAction === 'work-project.seed-published') continue;
    if (!source || !bytes || bytes.length !== source.bytes || digest(bytes) !== source.sha256) throw new Error('A verified cover is missing.');
    await inspectUpload({ bytes, filename: source.path, mime: imageMime(source.path) });

  }
  const results: HomepageResult[] = [];
  for (const record of manifest.records) {
    await actorAllowed(actorId);
    const imported = await importRecord(manifest, record, true);
    if (!['created', 'preserved'].includes(imported.status)) { results.push(imported); options.report?.(imported); continue; }
    if (!await publishable(manifest, record)) { const result = { key: record.key, status: 'admin-preserved' } as const; results.push(result); options.report?.(result); continue; }
    await actorAllowed(actorId);
    const source = manifest.files.find(file => record.files.includes(file.id) && file.id.startsWith('gallery:'));
    if (!source && options.publicationAction === 'work-project.seed-published') {
      const result = await publishHomepageRecord(manifest, record, actorId, undefined, options.publicationAction);
      results.push(result); options.report?.(result); continue;
    }
    if (!source) throw new Error('A homepage cover is required.');
    const bytes = files.get(source.id);
    if (!bytes || digest(bytes) !== source.sha256) throw new Error('A verified cover is missing.');
    // Recover a staged cover after an interruption, instead of uploading again.
    let asset = await Asset.findOne({ ownerId: actorId, entityType: record.kind, entityId: seedId(record.key), sha256: source.sha256, scanStatus: { $in: ['clean', 'type_checked'] }, claimStatus: 'staged', stagingExpiresAt: { $gt: new Date() } });
    if (!asset) {
      const stored = await provider.store({ bytes, filename: source.path, mime: imageMime(source.path) }, `${namespace}/content`, source.path.split('.').at(-1)!);
      try { asset = await Asset.create({ ...stored, sha256: source.sha256, ownerId: actorId, purpose: 'content', visibility: 'restricted', scanStatus: 'type_checked', entityType: record.kind, entityId: seedId(record.key), stagingExpiresAt: new Date(Date.now() + 86400000) }); }
      catch (error) { await provider.remove(stored).catch(() => {}); throw error; }
    }
    const result = await publishHomepageRecord(manifest, record, actorId, asset.id, options.publicationAction);
    results.push(result); options.report?.(result);
  }
  return results;
}
