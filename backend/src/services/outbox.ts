import { Queue, Worker } from 'bullmq';
import { createClient } from 'redis';
import nodemailer from 'nodemailer';
import type { Environment } from '../config/env.js';
import { EmailOutbox, User } from '../domain/models.js';
import { decrypt, digest, token } from '../security/crypto.js';
import { unavailable } from '../http/errors.js';
import { cloudinaryProvider, type UploadProvider } from './uploads.js';
import { complaintMail, type ComplaintAttachment } from './complaint-mail.js';
export type Mail = { to: string; subject: string; text: string; html?: string; attachments?: ComplaintAttachment[]; messageId: string };
export type MailSender = (mail: Mail) => Promise<string>;
export function smtpSender(env: Environment): MailSender {
  if (!env.SMTP_HOST || !env.MAIL_FROM) return async () => { throw unavailable(); };
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_SECURE, requireTLS: !env.SMTP_SECURE,
    ...(env.SMTP_USER && env.SMTP_PASS ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } } : {}),
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
    disableFileAccess: true, disableUrlAccess: true,
  });
  return async mail => { const result = await transport.sendMail({ ...mail, from: env.MAIL_FROM }); return String(result.messageId); };
}
export function createOutbox(env: Environment, send: MailSender, provider: UploadProvider = cloudinaryProvider(env)) {
  return {
    async deliver(id: string) {
      const leaseToken = token(), now = new Date();
      const entry = await EmailOutbox.findOneAndUpdate({ _id: id,
        $or: [{ status: { $in: ['pending', 'failed'] }, nextAttemptAt: { $lte: now } }, { status: 'sending', leaseUntil: { $lte: now } }],
        attempts: { $lt: 8 },
      }, { $set: { status: 'sending', leaseToken, leaseUntil: new Date(Date.now() + 180000) }, $inc: { attempts: 1 } }, { returnDocument: 'after' }).select('+recipient +encryptedToken');
      if (!entry) return;
      try {
        let subject = 'HRPF: submission received', text = `HRPF has received your submission. Reference: ${entry.reference}. This confirms receipt only; review is pending.`;
        if (entry.template === 'admin-notification') {
          subject = 'HRPF: new submission for review';
          text = `A new ${entry.entityType} is ready for review. Reference: ${entry.reference}. Sign in to the HRPF administration area${env.FRONTEND_URL ? ` at ${env.FRONTEND_URL}/admin` : ''}.`;
        }
        if (entry.template === 'password-reset') {
          if (!env.DATA_ENCRYPTION_KEY || !entry.encryptedToken || !env.FRONTEND_URL) throw unavailable();
          const value = decrypt(entry.encryptedToken, env.DATA_ENCRYPTION_KEY, 'password-reset');
          const user = await User.findOne({ _id: entry.entityId, active: true, resetHash: digest(value), resetExpiresAt: { $gt: new Date() } });
          if (!user) {
            await EmailOutbox.updateOne({ _id: id, leaseToken }, { $set: { status: 'sent', sentAt: new Date(), errorCode: 'RESET_SUPERSEDED' }, $unset: { leaseUntil: 1, leaseToken: 1, encryptedToken: 1 } });
            return;
          }
          subject = 'HRPF: password reset';
          text = `Reset your HRPF administrator password within 30 minutes: ${env.FRONTEND_URL}/admin/reset-password#token=${encodeURIComponent(value)}\nIf you did not request this, ignore the message.`;
        }
        const host = env.FRONTEND_URL ? new URL(env.FRONTEND_URL).hostname : 'hrpf.local';
        const complete = ['complaint-copy', 'complaint-admin-copy'].includes(entry.template) ? await complaintMail(env, provider, entry) : {};
        const providerId = await send({ to: entry.recipient, subject, text, ...complete, messageId: `<hrpf-${entry.id}@${host}>` });
        await EmailOutbox.updateOne({ _id: id, leaseToken }, { $set: { status: 'sent', sentAt: new Date(), providerId }, $unset: { leaseUntil: 1, leaseToken: 1, errorCode: 1, encryptedToken: 1 } });
      } catch {
        await EmailOutbox.updateOne({ _id: id, leaseToken }, { $set: { status: 'failed', errorCode: 'DELIVERY_UNAVAILABLE', nextAttemptAt: new Date(Date.now() + Math.min(3600000, 1000 * 2 ** entry.attempts)) }, $unset: { leaseUntil: 1, leaseToken: 1 } });
        throw new Error('Email delivery unavailable');
      }
    },
  };
}
export async function startOutboxWorker(env: Environment, send: MailSender, prune: () => Promise<void>, provider: UploadProvider = cloudinaryProvider(env)) {
  const prefix = env.CLOUDINARY_NAMESPACE.replace('/', '-');
  // BullMQ 6's ESM entry requires constructed clients. Node-redis also keeps TLS,
  // credentials and URL parsing consistent with the API's Redis connection.
  const queueRedis = createClient({ url: env.REDIS_URL });
  const workerRedis = createClient({ url: env.REDIS_URL });
  queueRedis.on('error', () => {}); workerRedis.on('error', () => {});
  await Promise.all([queueRedis.connect(), workerRedis.connect()]);
  const queue = new Queue('email-outbox', { connection: queueRedis, prefix });
  const service = createOutbox(env, send, provider);
  const worker = new Worker('email-outbox', async job => service.deliver(String(job.data.id)), { connection: workerRedis, prefix, concurrency: 2 });
  queue.on('error', () => {}); worker.on('error', () => {});
  let closing = false, running = false, lastPrune = 0;
  const drain = async () => {
    if (running || closing) return; running = true;
    try {
      const now = new Date();
      const entries = await EmailOutbox.find({ attempts: { $lt: 8 }, $or: [{ status: { $in: ['pending', 'failed'] }, nextAttemptAt: { $lte: now } }, { status: 'sending', leaseUntil: { $lte: now } }] }).select('_id').limit(100);
      for (const entry of entries) {
        if (closing) break;
        await queue.add('send', { id: entry.id }, { jobId: entry.id, attempts: 8, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: true, removeOnFail: true });
      }
      if (Date.now() - lastPrune > 60000) { await prune(); lastPrune = Date.now(); }
    } catch { /* persisted outbox will be drained after services recover */ }
    finally { running = false; }
  };
  const timer = setInterval(() => { void drain(); }, 5000); void drain();
  return { close: async () => { closing = true; clearInterval(timer); await worker.close(); await queue.close(); if (workerRedis.isOpen) await workerRedis.quit(); if (queueRedis.isOpen) await queueRedis.quit(); } };
}
