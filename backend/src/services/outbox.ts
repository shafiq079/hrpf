import { Queue, Worker } from 'bullmq';
import { createClient } from 'redis';
import nodemailer from 'nodemailer';
import type { Environment } from '../config/env.js';
import { EmailOutbox, User, NewsletterSubscription } from '../domain/models.js';
import { decrypt, digest, token } from '../security/crypto.js';
import { unavailable } from '../http/errors.js';
import { cloudinaryProvider, type UploadProvider } from './uploads.js';
import { complaintMail, type ComplaintAttachment } from './complaint-mail.js';
import { contactMail } from './contact-mail.js';
export type Mail = { to: string; subject: string; text: string; html?: string; replyTo?: string; attachments?: ComplaintAttachment[]; messageId: string };
export type MailSender = (mail: Mail) => Promise<string>;
export function assertMailConfiguration(env: Environment) {
  if (!env.MAIL_FROM || (env.EMAIL_PROVIDER === 'resend' ? !env.RESEND_API_KEY : !env.SMTP_HOST)) {
    throw new Error('Email delivery requires MAIL_FROM and credentials for the selected EMAIL_PROVIDER.');
  }
}
export function mailSender(env: Environment, fetcher: typeof fetch = fetch): MailSender {
  if (env.EMAIL_PROVIDER === 'smtp') return smtpSender(env);
  return async mail => {
    if (!env.RESEND_API_KEY || !env.MAIL_FROM) throw unavailable();
    try {
      const response = await fetcher('https://api.resend.com/emails', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20000),
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json',
          // Stable across retry/restart. Resend retains keys for 24 hours.
          'Idempotency-Key': `hrpf-${digest(mail.messageId)}`,
        },
        body: JSON.stringify({ from: env.MAIL_FROM, to: [mail.to], subject: mail.subject,
          text: mail.text, ...(mail.html ? { html: mail.html } : {}), ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
          headers: { 'Message-ID': mail.messageId },
          ...(mail.attachments?.length ? { attachments: mail.attachments.map(file => ({
            filename: file.filename, content: file.content.toString('base64'),
          })) } : {}),
        }),
      });
      if (!response.ok) { await response.body?.cancel(); throw unavailable(); }
      const result: unknown = await response.json();
      if (!result || typeof result !== 'object' || !('id' in result) || typeof result.id !== 'string' ||
          !/^[a-zA-Z0-9-]{1,100}$/.test(result.id)) throw unavailable();
      return result.id;
    } catch { throw unavailable(); } // Never log provider bodies, credentials or submitted personal data.
  };
}
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
        if (entry.template === 'newsletter-confirmation') {
          if (!env.FRONTEND_URL || !env.DATA_ENCRYPTION_KEY || !entry.encryptedToken) throw unavailable();
          const values = JSON.parse(decrypt(entry.encryptedToken, env.DATA_ENCRYPTION_KEY, `newsletter:${entry.entityId}`)) as { confirm: string; unsubscribe: string };
          const subscription = await NewsletterSubscription.findOne({ _id: entry.entityId, email: entry.recipient, status: 'pending', confirmationHash: digest(values.confirm), confirmationExpiresAt: { $gt: new Date() } });
          if (!subscription) {
            await EmailOutbox.updateOne({ _id: id, leaseToken }, { $set: { status: 'sent', sentAt: new Date(), errorCode: 'NEWSLETTER_SUPERSEDED' }, $unset: { leaseUntil: 1, leaseToken: 1, encryptedToken: 1 } });
            return;
          }
          subject = 'HRPF: confirm your newsletter subscription';
          text = `Confirm that you want HRPF updates within 24 hours:\n${env.FRONTEND_URL}/newsletter#confirm=${values.confirm}\n\nCancel or unsubscribe:\n${env.FRONTEND_URL}/newsletter#unsubscribe=${values.unsubscribe}\n\nIf you did not request this, ignore the email. You will not be subscribed without confirmation.`;
        }
        const host = env.FRONTEND_URL ? new URL(env.FRONTEND_URL).hostname : 'hrpf.local';
        const complete = ['complaint-copy', 'complaint-admin-copy'].includes(entry.template) ? await complaintMail(env, provider, entry) : entry.entityType === 'ContactMessage' ? await contactMail(entry) : {};
        const providerId = await send({ to: entry.recipient, subject, text, ...complete, messageId: `<hrpf-${entry.id}@${host}>` });
        await EmailOutbox.updateOne({ _id: id, leaseToken }, { $set: { status: 'sent', sentAt: new Date(), providerId }, $unset: { leaseUntil: 1, leaseToken: 1, errorCode: 1, encryptedToken: 1 } });
      } catch {
        await EmailOutbox.updateOne({ _id: id, leaseToken }, { $set: { status: 'failed', errorCode: 'DELIVERY_UNAVAILABLE', nextAttemptAt: new Date(Date.now() + Math.min(3600000, 1000 * 2 ** entry.attempts)) }, $unset: { leaseUntil: 1, leaseToken: 1 } });
        throw new Error('Email delivery unavailable');
      }
    },
  };
}
// A small deployment can consume the durable Mongo outbox inside the API process.
// No Redis queue or separate always-on worker is needed for this delivery mode.
// Render free can suspend it; pending records resume when the API wakes up.
export function startEmbeddedOutbox(env: Environment, send: MailSender, prune: () => Promise<void>,
  ready: () => boolean, provider: UploadProvider = cloudinaryProvider(env)) {
  const service = createOutbox(env, send, provider);
  let closing = false, active: Promise<void> | undefined, lastPrune = 0;
  const drain = async () => {
    if (active || closing || !ready()) return;
    active = (async () => {
      try {
        const now = new Date();
        const entries = await EmailOutbox.find({ attempts: { $lt: 8 }, $or: [
          { status: { $in: ['pending', 'failed'] }, nextAttemptAt: { $lte: now } },
          { status: 'sending', leaseUntil: { $lte: now } },
        ] }).select('_id').sort({ createdAt: 1, _id: 1 }).limit(20);
        // One attachment-bearing email at a time bounds memory on a 512 MB service.
        for (const entry of entries) {
          if (closing || !ready()) break;
          try { await service.deliver(entry.id); } catch { /* stored failure/backoff is authoritative */ }
        }
        if (!closing && ready() && Date.now() - lastPrune > 60000) {
          await prune(); lastPrune = Date.now();
        }
      } catch { /* next poll retries after dependencies recover */ }
    })();
    try { await active; } finally { active = undefined; }
  };
  const timer = setInterval(() => { void drain(); }, 5000); void drain();
  return { drain, close: async () => { closing = true; clearInterval(timer); await active; } };
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
