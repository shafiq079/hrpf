import { Router } from 'express';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Asset, AuditLog, Counter, EmailOutbox, User, roles } from '../domain/models.js';
import { createAuth, newPassword, type Principal } from '../security/auth.js';
import { can, permit } from '../security/permissions.js';
import { hashPassword } from '../security/crypto.js';
import { ApiError, validate } from './errors.js';
import { adminUploadQuery, objectId } from './contracts.js';
import type { UploadService } from '../services/uploads.js';
export function adminRouter(auth: ReturnType<typeof createAuth>, uploads: UploadService) {
  const router = Router();
  router.use(auth.authenticate);
  const safeUser = (value: { id: string; name: string; email: string; role: string; active: boolean; __v: number }) => ({ id: value.id, name: value.name, email: value.email, role: value.role, active: value.active, version: value.__v });
  router.get('/users', permit('users'), async (req, res) => {
    validate(z.object({}).strict(), req.query);
    const users = await User.find().sort({ createdAt: -1 }).limit(100);
    res.json({ data: users.map(safeUser) });
  });
  router.post('/users', auth.csrf, permit('users'), async (req, res) => {
    const input = validate(z.object({ name: z.string().trim().min(1).max(150), email: z.email().max(254).transform(v => v.trim().toLowerCase()), role: z.enum(roles), password: newPassword }).strict(), req.body);
    const passwordHash = await hashPassword(input.password);
    const user = await mongoose.connection.transaction(async tx => {
      await Counter.findOneAndUpdate({ key: 'security:user-governance' }, { $inc: { sequence: 1 } }, { session: tx, upsert: true });
      const actor = await User.findOne({ _id: (res.locals.principal as Principal).id, active: true, role: 'super_admin' }).session(tx);
      if (!actor) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission for this action.');
      const created = await User.create([{ name: input.name, email: input.email, role: input.role, passwordHash }], { session: tx });
      await AuditLog.create([{ actorId: (res.locals.principal as Principal).id, action: 'users.create', entityType: 'User', entityId: created[0]!.id, requestId: res.locals.requestId, outcome: 'success', changedFields: ['name', 'email', 'role'] }], { session: tx });
      return created[0]!;
    });
    res.status(201).json({ data: safeUser(user) });
  });
  router.patch('/users/:id', auth.csrf, permit('users'), async (req, res) => {
    const id = validate(objectId, req.params.id);
    const input = validate(z.object({ version: z.number().int().nonnegative(), name: z.string().trim().min(1).max(150).optional(), role: z.enum(roles).optional(), active: z.boolean().optional() }).strict().refine(v => v.name !== undefined || v.role !== undefined || v.active !== undefined), req.body);
    const updated = await mongoose.connection.transaction(async tx => {
      // A shared write serializes governance changes; counting alone allows concurrent removal of both super admins.
      await Counter.findOneAndUpdate({ key: 'security:user-governance' }, { $inc: { sequence: 1 } }, { session: tx, upsert: true });
      const principal = res.locals.principal as Principal;
      const actor = await User.findOne({ _id: principal.id, active: true, role: 'super_admin' }).session(tx);
      if (!actor) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission for this action.');
      const user = await User.findOne({ _id: id, __v: input.version }).session(tx);
      if (!user) throw new ApiError(409, 'VERSION_CONFLICT', 'The user changed. Reload and try again.');
      if (user.role === 'super_admin' && user.active && (input.active === false || (input.role && input.role !== 'super_admin'))) {
        if (await User.countDocuments({ role: 'super_admin', active: true }).session(tx) <= 1) throw new ApiError(409, 'LAST_SUPER_ADMIN', 'Keep at least one active super administrator.');
      }
      if (input.name !== undefined) user.name = input.name;
      if (input.role !== undefined) user.role = input.role;
      if (input.active !== undefined) user.active = input.active;
      user.authVersion += 1; await user.save({ session: tx });
      await AuditLog.create([{ actorId: actor._id, action: 'users.update', entityType: 'User', entityId: user.id, requestId: res.locals.requestId, outcome: 'success', changedFields: Object.keys(input).filter(k => k !== 'version') }], { session: tx });
      return user;
    });
    res.json({ data: safeUser(updated) });
  });
  router.get('/audit', permit('audit'), async (req, res) => {
    validate(z.object({}).strict(), req.query);
    const entries = await AuditLog.find().select('actorId action entityType entityId requestId outcome changedFields createdAt').sort({ createdAt: -1 }).limit(100).lean();
    res.json({ data: entries });
  });
  router.get('/outbox', permit('outbox'), async (req, res) => {
    validate(z.object({}).strict(), req.query);
    const entries = await EmailOutbox.find().select('template entityType entityId status attempts nextAttemptAt errorCode createdAt').sort({ createdAt: -1 }).limit(100).lean();
    res.json({ data: entries });
  });
  router.post('/outbox/:id/retry', auth.csrf, permit('outbox'), async (req, res) => {
    const id = validate(objectId, req.params.id);
    validate(z.object({}).strict(), req.body);
    await mongoose.connection.transaction(async tx => {
      const entry = await EmailOutbox.findOneAndUpdate({ _id: id, status: 'failed' }, { $set: { status: 'pending', attempts: 0, nextAttemptAt: new Date() }, $unset: { errorCode: 1 } }, { session: tx });
      if (!entry) throw new ApiError(409, 'OUTBOX_NOT_RETRYABLE', 'Only failed email entries can be retried.');
      await AuditLog.create([{ actorId: (res.locals.principal as Principal).id, action: 'outbox.retry', entityType: 'EmailOutbox', entityId: entry.id, outcome: 'success', requestId: res.locals.requestId }], { session: tx });
    });
    res.json({ data: { status: 'retry_queued' } });
  });
  router.post('/assets', auth.csrf, async (req, res) => {
    const { purpose } = validate(adminUploadQuery, req.query), principal = res.locals.principal as Principal;
    if (!can(principal.role, purpose === 'certificate' ? 'certificates' : 'content')) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission for this upload.');
    res.status(201).json({ data: await uploads.admin(req, principal.id, purpose) });
  });
  router.get('/assets/:id/content', async (req, res) => {
    const id = validate(objectId, req.params.id), principal = res.locals.principal as Principal;
    const asset = await Asset.findOne({ _id: id, scanStatus: 'clean', claimStatus: { $ne: 'deleting' } });
    if (!asset) throw new ApiError(404, 'NOT_FOUND', 'File not found.');
    const permission = ['complaint', 'membership'].includes(asset.purpose) ? 'restrictedAssets' : asset.purpose === 'certificate' ? 'certificates' : 'content';
    if (!can(principal.role, permission)) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to view this file.');
    await AuditLog.create({ actorId: principal.id, action: 'assets.read', entityType: 'Asset', entityId: asset.id, requestId: res.locals.requestId, outcome: 'success' });
    const source = await uploads.provider.read(asset);
    if (!source.body) throw new ApiError(503, 'SERVICE_UNAVAILABLE', 'The file is temporarily unavailable.');
    res.setHeader('Content-Type', asset.format === 'pdf' ? 'application/pdf' : `image/${asset.format === 'jpg' ? 'jpeg' : asset.format}`);
    res.setHeader('Content-Disposition', `attachment; filename="document.${asset.format}"`);
    res.setHeader('Content-Length', asset.bytes); res.setHeader('Cache-Control', 'private, no-store');
    await pipeline(Readable.fromWeb(source.body as never), res);
  });
  router.delete('/assets/:id', auth.csrf, async (req, res) => {
    const id = validate(objectId, req.params.id), principal = res.locals.principal as Principal;
    const asset = await Asset.findOneAndUpdate({ _id: id, ownerId: principal.id, claimStatus: 'staged' }, { $set: { claimStatus: 'deleting', stagingExpiresAt: new Date(0) } });
    if (!asset) throw new ApiError(409, 'ASSET_IN_USE', 'Only your own unused staged assets can be deleted.');
    res.json({ data: { status: 'deletion_queued' } });
  });
  return router;
}
