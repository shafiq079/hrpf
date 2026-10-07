import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { AuditLog, Complaint, Counter, EmailOutbox, User } from '../domain/models.js';
import { createAuth, type Principal } from '../security/auth.js';
import { can, permit } from '../security/permissions.js';
import { decrypt } from '../security/crypto.js';
import type { Environment } from '../config/env.js';
import { complaintFiles } from '../services/complaint-mail.js';
import { ApiError, unavailable, validate } from './errors.js';
import { objectId } from './contracts.js';

export const complaintStatuses = ['new', 'triaged', 'assigned', 'in_progress', 'needs_info', 'resolved', 'closed'] as const;
const transitions: Record<string, readonly string[]> = {
  new: ['triaged', 'closed'], triaged: ['assigned', 'in_progress', 'needs_info', 'closed'],
  assigned: ['in_progress', 'needs_info', 'closed'], in_progress: ['needs_info', 'resolved', 'closed'],
  needs_info: ['triaged', 'assigned', 'in_progress', 'closed'], resolved: ['closed', 'in_progress'], closed: ['triaged'],
};
export const complaintUpdate = z.object({ version: z.number().int().nonnegative(), status: z.enum(complaintStatuses).optional(), assigneeId: objectId.nullable().optional(), note: z.string().trim().min(1).max(5000) }).strict();
const listView = (row: any) => ({ id: String(row._id), version: row.__v, reference: row.trackingId, name: row.name, category: row.category, province: row.province, district: row.district, status: row.status, assigneeId: row.assigneeId?.toString() ?? null, createdAt: row.createdAt });
export function complaintContentRouter(auth: ReturnType<typeof createAuth>, env: Environment) {
  const router = Router();
  router.use('/complaints', auth.authenticate, permit('complaints'), (_req, res, next) => { res.setHeader('Cache-Control', 'private, no-store'); next(); });
  router.get('/complaints/reviewers', async (req, res) => {
    validate(z.object({}).strict(), req.query);
    const users = await User.find({ active: true, role: { $in: ['super_admin', 'admin', 'case_manager'] } }).select('name').sort({ name: 1 }).limit(100);
    res.json({ data: users.map(row => ({ id: row.id, name: row.name })) });
  });
  router.get('/complaints', async (req, res) => {
    const input = validate(z.object({ page: z.coerce.number().int().min(1).max(1000).default(1), status: z.enum(complaintStatuses).optional(), q: z.string().trim().max(80).optional() }).strict(), req.query);
    const filter: any = {};
    if (input.status) filter.status = input.status;
    if (input.q) filter.trackingId = { $regex: '^' + input.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    const [rows, total] = await Promise.all([Complaint.find(filter).select('trackingId name category province district status assigneeId createdAt __v').sort({ createdAt: -1, _id: -1 }).skip((input.page - 1) * 20).limit(20).lean(), Complaint.countDocuments(filter)]);
    res.json({ data: { rows: rows.map(listView), page: input.page, pages: Math.ceil(total / 20), total } });
  });
  router.get('/complaints/:id', async (req, res) => {
    validate(z.object({}).strict(), req.query);
    if (!env.DATA_ENCRYPTION_KEY) throw unavailable();
    const row = await Complaint.findById(validate(objectId, req.params.id)).select('+encryptedCNIC');
    if (!row) throw new ApiError(404, 'NOT_FOUND', 'Complaint not found.');
    const mail = await EmailOutbox.find({ entityType: 'Complaint', entityId: row.id }).select('template status attempts errorCode sentAt').sort({ createdAt: 1 });
    await AuditLog.create({ actorId: (res.locals.principal as Principal).id, action: 'complaints.read', entityType: 'Complaint', entityId: row.id, requestId: res.locals.requestId, outcome: 'success' });
    res.json({ data: { ...listView(row), fatherName: row.fatherName, email: row.email, phone: row.phone, address: row.address, cnic: decrypt(row.encryptedCNIC, env.DATA_ENCRYPTION_KEY, `complaint:${row.id}`), description: row.description, priorProceedings: row.priorProceedings, priorProceedingsDetails: row.priorProceedingsDetails ?? '', consent: row.consent,
      files: complaintFiles(row).map(({ label, file }) => ({ label, id: String(file.assetId), name: file.originalName || `${label}.${file.format}`, bytes: file.bytes, format: file.format })), notes: row.notes, history: row.history,
      emailDeliveries: mail.map(value => ({ id: value.id, audience: ['complaint-copy', 'acknowledgement'].includes(value.template) ? 'user' : 'admin', status: value.status, attempts: value.attempts, errorCode: value.errorCode, sentAt: value.sentAt })),
    } });
  });
  router.patch('/complaints/:id', auth.csrf, async (req, res) => {
    const id = validate(objectId, req.params.id), input = validate(complaintUpdate, req.body), principal = res.locals.principal as Principal;
    const updated = await mongoose.connection.transaction(async tx => {
      await Counter.findOneAndUpdate({ key: 'security:user-governance' }, { $inc: { sequence: 1 } }, { session: tx, upsert: true });
      const actor = await User.findOne({ _id: principal.id, active: true }).session(tx);
      if (!actor || !can(actor.role, 'complaints')) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission for this action.');
      const row = await Complaint.findOne({ _id: id, __v: input.version }).session(tx);
      if (!row) throw new ApiError(409, 'VERSION_CONFLICT', 'The complaint changed. Reload before updating it.');
      if (row.notes.length >= 1000 || row.history.length >= 1000) throw new ApiError(409, 'REVIEW_LIMIT', 'The review history limit has been reached.');
      if (input.assigneeId) {
        const assignee = await User.findOne({ _id: input.assigneeId, active: true, role: { $in: ['super_admin', 'admin', 'case_manager'] } }).session(tx);
        if (!assignee) throw new ApiError(400, 'INVALID_ASSIGNEE', 'Choose an active complaint reviewer.');
      }
      if (input.status && input.status !== row.status) {
        if (!transitions[row.status]?.includes(input.status)) throw new ApiError(409, 'INVALID_TRANSITION', 'This status change is not available.');
        row.history.push({ from: row.status, to: input.status, actorId: actor._id, at: new Date() });
        row.status = input.status;
      }
      if (input.assigneeId !== undefined) row.assigneeId = input.assigneeId ? new mongoose.Types.ObjectId(input.assigneeId) : null;
      if (row.status === 'assigned' && !row.assigneeId) throw new ApiError(400, 'ASSIGNEE_REQUIRED', 'Select a reviewer before marking this complaint assigned.');
      row.notes.push({ body: input.note, actorId: actor._id, at: new Date() });
      await row.save({ session: tx });
      await AuditLog.create([{ actorId: actor._id, action: 'complaints.review', entityType: 'Complaint', entityId: row.id, requestId: res.locals.requestId, outcome: 'success', changedFields: Object.keys(input).filter(k => k !== 'version') }], { session: tx });
      return row;
    });
    res.json({ data: listView(updated) });
  });
  return router;
}
