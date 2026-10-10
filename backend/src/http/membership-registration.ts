import { Router } from 'express';
import mongoose, { Types } from 'mongoose';
import { z } from 'zod';
import type { Environment } from '../config/env.js';
import { Asset, AuditLog, Counter, EmailOutbox, FormTicket, MembershipRegistration, User } from '../domain/models.js';
import { paymentMethods, registrationAmount, registrationInput, registrationReview, registrationStatuses, registrationVersion } from '../domain/membership-registration.js';
import type { RedisServices } from '../infrastructure/redis-services.js';
import type { createAuth, Principal } from '../security/auth.js';
import { can, permit } from '../security/permissions.js';
import { digest } from '../security/crypto.js';
import type { FormsService } from '../services/forms.js';
import { assertMailConfiguration } from '../services/outbox.js';
import { objectId } from './contracts.js';
import { ApiError, unavailable, validate } from './errors.js';
const purpose = 'membership_registration' as const;
const listView = (r: any) => ({ id: String(r._id), version: r.__v, reference: r.reference, name: r.answers.name, email: r.answers.email, status: r.status, paymentStatus: r.paymentStatus, amountPKR: r.feeSnapshot.amountPKR, createdAt: r.createdAt });
function configuration(env: Environment) {
  try { assertMailConfiguration(env); } catch { throw unavailable(); }
  if (!env.ADMIN_NOTIFY_EMAILS.length) throw new ApiError(503, 'MEMBERSHIP_NOT_CONFIGURED', 'Membership applications are being updated. Please contact HRPF.');
}
export function membershipRegistrationRouter(auth: ReturnType<typeof createAuth>, env: Environment, forms: FormsService, redis: RedisServices) {
  const router = Router();
  router.get('/membership-registration/config', (_req, res) => {
    let available = true; try { configuration(env); } catch { available = false; }
    res.setHeader('Cache-Control', 'no-store');
    res.json({ data: { available, formVersion: registrationVersion, paymentMethods: paymentMethods } });
  });
  router.post('/membership-registrations', redis.limit('membership-registration', 10, 15 * 60000), async (req, res) => {
    const input = validate(registrationInput, req.body), { ticket: _ticket, submissionKey: _key, ...submitted } = input;
    const hash = digest(JSON.stringify(submitted));
    async function retry() {
      const existing = await MembershipRegistration.findOne({ submissionKey: input.submissionKey });
      if (!existing) return null;
      const t = await FormTicket.findOne({ tokenHash: digest(input.ticket), purpose, consumedAt: { $ne: null }, submissionKey: input.submissionKey });
      if (!t) throw new ApiError(403, 'INVALID_FORM_TICKET', 'Use the original form session to retry.');
      if (existing.payloadHash !== hash) throw new ApiError(409, 'IDEMPOTENCY_CONFLICT', 'This submission key was used for different answers.');
      return { reference: existing.reference, status: 'received' };
    }
    const found = await retry(); if (found) { res.status(201).json({ data: found }); return; }
    configuration(env);
    if (!paymentMethods.some(method => method === input.answers.paymentMethod)) throw new ApiError(400, 'INVALID_PAYMENT_METHOD', 'Choose an available payment method.');
    await forms.check(input.ticket, purpose);
    try {
      const saved = await mongoose.connection.transaction(async tx => {
        const t = await FormTicket.findOneAndUpdate({ tokenHash: digest(input.ticket), purpose, consumedAt: null, expiresAt: { $gt: new Date() } }, { $set: { consumedAt: new Date(), submissionKey: input.submissionKey } }, { session: tx });
        if (!t) throw new ApiError(403, 'INVALID_FORM_TICKET', 'The form session has been used or expired.');
        const id = new Types.ObjectId(), year = new Date().getUTCFullYear();
        const counter = await Counter.findOneAndUpdate({ key: `VR:${year}` }, { $inc: { sequence: 1 } }, { upsert: true, returnDocument: 'after', session: tx });
        const reference = `HRPF-VR-${year}-${String(counter.sequence).padStart(6, '0')}`;
        const ids = [...input.cnicImageIds, input.photoId, input.paymentProofId, ...input.policeCertificateIds];
        const assets = [];
        for (let index = 0; index < ids.length; index++) {
          const a = await Asset.findOneAndUpdate({ _id: ids[index], ticketHash: digest(input.ticket), purpose, scanStatus: { $in: ['clean', 'type_checked'] }, visibility: 'restricted', deliveryType: 'authenticated', claimStatus: 'staged', stagingExpiresAt: { $gt: new Date() } }, { $set: { claimStatus: 'claimed', entityType: purpose, entityId: id }, $unset: { stagingExpiresAt: 1 } }, { session: tx, returnDocument: 'after' });
          if (!a || a.bytes > 10 * 1024 * 1024) throw new ApiError(400, 'INVALID_ASSET', 'An attachment is missing, too large, or belongs to another form.');
          if (index < input.cnicImageIds.length + 2 && !['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tif', 'tiff'].includes(a.format)) throw new ApiError(400, 'INVALID_ASSET', 'CNIC, photograph and payment evidence must be images.');
          assets.push({ assetId: a._id, publicId: a.publicId, resourceType: a.resourceType, deliveryType: a.deliveryType, format: a.format, bytes: a.bytes, originalName: a.originalName, version: a.version, sha256: a.sha256 });
        }
        const split = input.cnicImageIds.length;
        await new MembershipRegistration({ _id: id, reference, submissionKey: input.submissionKey, payloadHash: hash, formVersion: input.formVersion, answers: input.answers, cnicImages: assets.slice(0, split), photo: assets[split], paymentProof: assets[split + 1], policeCertificates: assets.slice(split + 2), feeSnapshot: { amountPKR: registrationAmount(input.answers.fees), currency: 'PKR', version: registrationVersion } }).save({ session: tx });
        for (const email of [{ dedupeKey: `registration:${id}:receipt`, template: 'membership-receipt', entityType: 'MembershipRegistration', entityId: id.toString(), recipient: input.answers.email, reference }, ...[...new Set(env.ADMIN_NOTIFY_EMAILS)].map(address => ({ dedupeKey: `registration:${id}:admin:${digest(address)}`, template: 'admin-notification', entityType: 'MembershipRegistration', entityId: id.toString(), recipient: address, reference }))]) await new EmailOutbox(email).save({ session: tx });
        return { reference, status: 'received' };
      });
      res.status(201).json({ data: saved });
    } catch (error) { const saved = await retry(); if (!saved) throw error; res.status(201).json({ data: saved }); }
  });
  router.use('/admin/membership-registrations', auth.authenticate, permit('membershipRegistrations'), (_req, res, next) => { res.setHeader('Cache-Control', 'private, no-store'); next(); });
  router.get('/admin/membership-registrations', async (req, res) => {
    const query = validate(z.object({ page: z.coerce.number().int().min(1).max(1000).default(1), status: z.enum(registrationStatuses).optional(), q: z.string().trim().max(80).optional() }).strict(), req.query);
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.q) filter.reference = { $regex: '^' + query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    const [rows, total] = await Promise.all([MembershipRegistration.find(filter).select('answers.name answers.email reference status paymentStatus feeSnapshot createdAt __v').sort({ createdAt: -1, _id: -1 }).skip((query.page - 1) * 20).limit(20).lean(), MembershipRegistration.countDocuments(filter)]);
    res.json({ data: { rows: rows.map(listView), page: query.page, total, pages: Math.ceil(total / 20) } });
  });
  router.get('/admin/membership-registrations/:id', async (req, res) => {
    validate(z.object({}).strict(), req.query);
    const row = await MembershipRegistration.findById(validate(objectId, req.params.id));
    if (!row) throw new ApiError(404, 'NOT_FOUND', 'Application not found.');
    const files = [...row.cnicImages.map(file => ({ label: 'CNIC front / back', file })), { label: 'Recent photograph', file: row.photo }, { label: 'Payment screenshot', file: row.paymentProof }, ...row.policeCertificates.map(file => ({ label: 'Police character certificate', file }))].map(({ label, file }) => ({ label, id: String(file.assetId), name: file.originalName || `document.${file.format}`, format: file.format, bytes: file.bytes }));
    const [mail, reviewers] = await Promise.all([EmailOutbox.find({ entityType: 'MembershipRegistration', entityId: row.id }).select('template status attempts errorCode sentAt createdAt').sort({ createdAt: 1 }), User.find({ _id: { $in: row.notes.map(n => n.actorId) } }).select('name')]);
    await AuditLog.create({ actorId: (res.locals.principal as Principal).id, action: 'membership.read', entityType: 'MembershipRegistration', entityId: row.id, requestId: res.locals.requestId, outcome: 'success' });
    res.json({ data: { ...listView(row), formVersion: row.formVersion, answers: row.answers, files, feeSnapshot: row.feeSnapshot, notes: row.notes.map(n => ({ body: n.body, at: n.at, reviewer: reviewers.find(u => u.id === String(n.actorId))?.name || 'HRPF administrator' })), history: row.history, reviewedAt: row.reviewedAt, emailDeliveries: mail.map(m => ({ id: m.id, audience: m.template === 'admin-notification' ? 'admin' : 'applicant', status: m.status, attempts: m.attempts, sentAt: m.sentAt, errorCode: m.errorCode })) } });
  });
  router.patch('/admin/membership-registrations/:id', auth.csrf, async (req, res) => {
    const id = validate(objectId, req.params.id), input = validate(registrationReview, req.body), principal = res.locals.principal as Principal;
    const row = await mongoose.connection.transaction(async tx => {
      await Counter.findOneAndUpdate({ key: 'security:user-governance' }, { $inc: { sequence: 1 } }, { session: tx, upsert: true });
      const actor = await User.findOne({ _id: principal.id, active: true }).session(tx);
      if (!actor || !can(actor.role, 'membershipRegistrations')) throw new ApiError(403, 'FORBIDDEN', 'You cannot review membership applications.');
      const row = await MembershipRegistration.findOne({ _id: id, __v: input.version }).session(tx);
      if (!row) throw new ApiError(409, 'VERSION_CONFLICT', 'The application changed. Reload it before updating.');
      if (row.notes.length >= 1000 || row.history.length >= 1000) throw new ApiError(409, 'REVIEW_LIMIT', 'The application review history limit has been reached.');
      if (input.status === 'approved' && (input.paymentStatus !== 'verified' || row.answers.certification !== 'Yes')) throw new ApiError(409, 'APPROVAL_BLOCKED', 'Approval requires verified payment and a Yes declaration.');
      const changed = input.status !== row.status;
      if (changed && !input.applicantMessage) throw new ApiError(400, 'MESSAGE_REQUIRED', 'Enter a message for the applicant when changing the application status.');
      row.history.push({ from: row.status, to: input.status, paymentFrom: row.paymentStatus, paymentTo: input.paymentStatus, actorId: actor._id });
      row.notes.push({ body: input.note, actorId: actor._id });
      row.status = input.status; row.paymentStatus = input.paymentStatus; row.reviewerId = actor._id; row.reviewedAt = new Date();
      await row.save({ session: tx });
      if (changed) await EmailOutbox.create([{ dedupeKey: `registration:${id}:status:${row.__v}`, template: 'membership-status', entityType: 'MembershipRegistration', entityId: id, recipient: row.answers.email, reference: row.reference, notificationStatus: input.status, notificationReason: input.applicantMessage }], { session: tx });
      await AuditLog.create([{ actorId: actor._id, action: 'membership.review', entityType: 'MembershipRegistration', entityId: id, outcome: 'success', requestId: res.locals.requestId, changedFields: ['status', 'paymentStatus', 'notes'] }], { session: tx });
      return row;
    });
    res.json({ data: listView(row) });
  });
  return router;
}
