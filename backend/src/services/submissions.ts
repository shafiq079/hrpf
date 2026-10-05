import mongoose, { Types, type ClientSession } from 'mongoose';
import type { Environment } from '../config/env.js';
import { Asset, Complaint, ContactMessage, Counter, EmailOutbox, FormTicket, MembershipApplication } from '../domain/models.js';
import { complaintInput, contactInput, membershipInput } from '../http/contracts.js';
import { ApiError, unavailable, validate } from '../http/errors.js';
import { digest, encrypt, keyedHash } from '../security/crypto.js';
import { requireMembershipPolicy, type FormsService, type FormPurpose } from './forms.js';
import { MB } from './uploads.js';
async function nextReference(kind: 'C' | 'A', tx: ClientSession) {
  const year = new Date().getUTCFullYear();
  const counter = await Counter.findOneAndUpdate({ key: `${kind}:${year}` }, { $inc: { sequence: 1 } }, { upsert: true, returnDocument: 'after', session: tx });
  return `HRPF-${kind}-${year}-${String(counter.sequence).padStart(6, '0')}`;
}
function payloadHash(input: Record<string, unknown>) {
  const { ticket: _ticket, submissionKey: _key, ...rest } = input;
  return digest(JSON.stringify(rest));
}
export function createSubmissions(env: Environment, forms: FormsService) {
  async function claimTicket(value: string, expected: FormPurpose, key: string, tx: ClientSession) {
    const result = await FormTicket.findOneAndUpdate({ tokenHash: digest(value), purpose: expected, expiresAt: { $gt: new Date() }, consumedAt: null }, { $set: { consumedAt: new Date(), submissionKey: key } }, { session: tx });
    if (!result) throw new ApiError(403, 'INVALID_FORM_TICKET', 'The form session has already been used or expired.');
  }
  async function claimAssets(ids: string[], ticket: string, expected: 'complaint' | 'membership', entityId: Types.ObjectId, tx: ClientSession) {
    const values = [];
    for (const id of ids) {
      const asset = await Asset.findOneAndUpdate({ _id: id, ticketHash: digest(ticket), purpose: expected, scanStatus: 'clean', deliveryType: 'authenticated', visibility: 'restricted', claimStatus: 'staged', stagingExpiresAt: { $gt: new Date() } }, { $set: { claimStatus: 'claimed', entityType: expected, entityId }, $unset: { stagingExpiresAt: 1 } }, { session: tx, returnDocument: 'after' });
      if (!asset) throw new ApiError(400, 'INVALID_ASSET', 'A required file is missing or belongs to another form session.');
      values.push({ assetId: asset._id, publicId: asset.publicId, resourceType: asset.resourceType, deliveryType: asset.deliveryType, format: asset.format, bytes: asset.bytes,
        ...(asset.width ? { width: asset.width } : {}), ...(asset.height ? { height: asset.height } : {}), ...(asset.version ? { version: asset.version } : {}), sha256: asset.sha256 });
    }
    if (values.reduce((sum, v) => sum + v.bytes, 0) > 25 * MB) throw new ApiError(400, 'UPLOAD_LIMIT', 'The combined upload size is too large.');
    return values;
  }
  async function emails(entityType: string, entityId: string, recipient: string, reference: string, tx: ClientSession) {
    await EmailOutbox.create([{ dedupeKey: `${entityType}:${entityId}:ack`, template: 'acknowledgement', entityType, entityId, recipient, reference }], { session: tx });
    for (const address of env.ADMIN_NOTIFY_EMAILS) await EmailOutbox.create([{ dedupeKey: `${entityType}:${entityId}:admin:${digest(address)}`, template: 'admin-notification', entityType, entityId, recipient: address, reference }], { session: tx });
  }
  async function checkRetry(value: string, expected: FormPurpose, key: string, hash: string, existing: { payloadHash: string } | null) {
    const ticket = await forms.check(value, expected, true);
    if (ticket.consumedAt && ticket.submissionKey !== key) throw new ApiError(403, 'INVALID_FORM_TICKET', 'The form session has already been used.');
    if (existing && (!ticket.consumedAt || ticket.submissionKey !== key)) throw new ApiError(403, 'INVALID_FORM_TICKET', 'Use the original form session to retry this submission.');
    if (existing && existing.payloadHash !== hash) throw new ApiError(409, 'IDEMPOTENCY_CONFLICT', 'This submission key was used for different form data.');
  }
  return {
    async complaint(body: unknown) {
      const input = validate(complaintInput, body), hash = payloadHash(input);
      if (!env.DATA_ENCRYPTION_KEY || !env.CNIC_HASH_KEY) throw unavailable();
      const existing = await Complaint.findOne({ submissionKey: input.submissionKey });
      await checkRetry(input.ticket, 'complaint', input.submissionKey, hash, existing);
      if (existing) return { reference: existing.trackingId, status: 'received' };
      try {
        return await mongoose.connection.transaction(async tx => {
          await claimTicket(input.ticket, 'complaint', input.submissionKey, tx);
          const id = new Types.ObjectId(), reference = await nextReference('C', tx);
          const assets = await claimAssets([input.cnicImageId, input.complaintDocumentId, ...input.decisionDocumentIds, ...input.attachmentIds], input.ticket, 'complaint', id, tx);
          if (!['jpg', 'png', 'webp'].includes(assets[0]!.format)) throw new ApiError(400, 'INVALID_ASSET', 'CNIC proof must be an image.');
          const { ticket: _ticket, cnic, cnicImageId: _cnic, complaintDocumentId: _doc, decisionDocumentIds: _dec, attachmentIds: _att, consent: _consent, consentVersion, ...data } = input;
          await new Complaint({ ...data, _id: id, trackingId: reference, payloadHash: hash,
            encryptedCNIC: encrypt(cnic, env.DATA_ENCRYPTION_KEY!, `complaint:${id}`), cnicHash: keyedHash(cnic, env.CNIC_HASH_KEY!),
            cnicImage: assets[0], complaintDocument: assets[1], decisionDocuments: assets.slice(2, 2 + input.decisionDocumentIds.length), attachments: assets.slice(2 + input.decisionDocumentIds.length),
            consent: { version: consentVersion, acceptedAt: new Date() } }).save({ session: tx });
          await emails('Complaint', id.toString(), input.email, reference, tx);
          return { reference, status: 'received' };
        });
      } catch (error) {
        const retry = await Complaint.findOne({ submissionKey: input.submissionKey });
        if (retry?.payloadHash === hash) { await checkRetry(input.ticket, 'complaint', input.submissionKey, hash, retry); return { reference: retry.trackingId, status: 'received' }; }
        throw error;
      }
    },
    async membership(body: unknown) {
      const input = validate(membershipInput, body), hash = payloadHash(input);
      const policy = await requireMembershipPolicy(input.membershipType);
      const existing = await MembershipApplication.findOne({ submissionKey: input.submissionKey });
      await checkRetry(input.ticket, 'membership', input.submissionKey, hash, existing);
      if (existing) return { reference: existing.reference, status: 'received' };
      const fee = policy.types.find(v => v.key === input.membershipType)!;
      try {
        return await mongoose.connection.transaction(async tx => {
          await claimTicket(input.ticket, 'membership', input.submissionKey, tx);
          const id = new Types.ObjectId(), reference = await nextReference('A', tx);
          const assets = await claimAssets([input.paymentProofId], input.ticket, 'membership', id, tx);
          const { ticket: _ticket, paymentProofId: _proof, consent: _consent, consentVersion, ...data } = input;
          await new MembershipApplication({ ...data, _id: id, reference, payloadHash: hash, paymentProof: assets[0],
            feeSnapshot: { amountPaisa: fee.amountPaisa, currency: policy.currency, policyVersion: policy.version, validityMonths: fee.validityMonths }, consent: { version: consentVersion, acceptedAt: new Date() } }).save({ session: tx });
          await emails('MembershipApplication', id.toString(), input.email, reference, tx);
          return { reference, status: 'received' };
        });
      } catch (error) {
        const retry = await MembershipApplication.findOne({ submissionKey: input.submissionKey });
        if (retry?.payloadHash === hash) { await checkRetry(input.ticket, 'membership', input.submissionKey, hash, retry); return { reference: retry.reference, status: 'received' }; }
        throw error;
      }
    },
    async contact(body: unknown) {
      const input = validate(contactInput, body), hash = payloadHash(input);
      const existing = await ContactMessage.findOne({ submissionKey: input.submissionKey });
      await checkRetry(input.ticket, 'contact', input.submissionKey, hash, existing);
      if (existing) return { status: 'received' };
      try {
        await mongoose.connection.transaction(async tx => {
          await claimTicket(input.ticket, 'contact', input.submissionKey, tx);
          const { ticket: _ticket, consent: _consent, consentVersion, ...data } = input;
          const id = new Types.ObjectId();
          await new ContactMessage({ ...data, _id: id, payloadHash: hash, consent: { version: consentVersion, acceptedAt: new Date() } }).save({ session: tx });
          await emails('ContactMessage', id.toString(), input.email, id.toString(), tx);
        });
      } catch (error) { const retry = await ContactMessage.findOne({ submissionKey: input.submissionKey }); if (retry?.payloadHash !== hash) throw error; await checkRetry(input.ticket, 'contact', input.submissionKey, hash, retry); }
      return { status: 'received' };
    },
  };
}
