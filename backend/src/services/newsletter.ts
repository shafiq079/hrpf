import mongoose from 'mongoose';
import { z } from 'zod';
import type { Environment } from '../config/env.js';
import { EmailOutbox, FormTicket, NewsletterSubscription } from '../domain/models.js';
import { ApiError, unavailable, validate } from '../http/errors.js';
import { digest, encrypt, token } from '../security/crypto.js';
import type { FormsService } from './forms.js';

export const newsletterInput = z.object({ email: z.string().trim().email().max(254).transform(v => v.toLowerCase()), consent: z.literal(true), consentVersion: z.literal('newsletter-v1'), ticket: z.string().min(43).max(100), submissionKey: z.uuid() }).strict();
export const newsletterAction = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/), action: z.enum(['confirm', 'unsubscribe']) }).strict();
const accepted = { status: 'accepted' as const };
export function createNewsletter(env: Environment, forms: FormsService) {
  return {
    async subscribe(body: unknown) {
      const input = validate(newsletterInput, body);
      if (!env.FRONTEND_URL || !env.DATA_ENCRYPTION_KEY || !env.MAIL_FROM || (env.EMAIL_PROVIDER === 'resend' ? !env.RESEND_API_KEY : !env.SMTP_HOST)) throw unavailable();
      const hash = digest(JSON.stringify([input.email, input.consentVersion]));
      const retry = await FormTicket.findOne({ tokenHash: digest(input.ticket), purpose: 'newsletter', consumedAt: { $exists: true }, submissionKey: input.submissionKey });
      if (retry) {
        if (retry.payloadHash !== hash) throw new ApiError(409, 'IDEMPOTENCY_CONFLICT', 'This submission key was used for different data.');
        return accepted;
      }
      await forms.check(input.ticket, 'newsletter');
      try {
        await mongoose.connection.transaction(async tx => {
          const claimed = await FormTicket.findOneAndUpdate({ tokenHash: digest(input.ticket), purpose: 'newsletter', expiresAt: { $gt: new Date() }, consumedAt: null }, { $set: { consumedAt: new Date(), submissionKey: input.submissionKey, payloadHash: hash } }, { session: tx });
          if (!claimed) throw new ApiError(403, 'INVALID_FORM_TICKET', 'The form session has already been used or expired.');
          const row = await NewsletterSubscription.findOne({ email: input.email }).session(tx);
          // Do not reveal subscription state or send repeated confirmation mail.
          if (row?.status === 'active' || (row?.status === 'pending' && row.requestedAt && row.requestedAt.getTime() > Date.now() - 3600000)) return;
          const confirm = token(), unsubscribe = token(), now = new Date();
          const data = { status: 'pending', confirmationHash: digest(confirm), confirmationExpiresAt: new Date(Date.now() + 86400000), unsubscribeHash: digest(unsubscribe), requestedAt: now, consent: { version: input.consentVersion, acceptedAt: now } };
          const subscription = await NewsletterSubscription.findOneAndUpdate({ email: input.email }, { $set: data, $unset: { confirmedAt: 1, unsubscribedAt: 1 } }, { upsert: true, returnDocument: 'after', session: tx });
          await EmailOutbox.create([{ dedupeKey: `newsletter:${input.submissionKey}`, template: 'newsletter-confirmation', entityType: 'NewsletterSubscription', entityId: subscription.id, recipient: input.email, encryptedToken: encrypt(JSON.stringify({ confirm, unsubscribe }), env.DATA_ENCRYPTION_KEY!, `newsletter:${subscription.id}`) }], { session: tx });
        });
      } catch (error) {
        const saved = await FormTicket.findOne({ tokenHash: digest(input.ticket), purpose: 'newsletter', consumedAt: { $exists: true }, submissionKey: input.submissionKey, payloadHash: hash });
        if (!saved) throw error;
      }
      return accepted;
    },
    async action(body: unknown) {
      const input = validate(newsletterAction, body);
      if (input.action === 'unsubscribe') {
        const row = await NewsletterSubscription.findOneAndUpdate({ unsubscribeHash: digest(input.token) }, { $set: { status: 'unsubscribed', unsubscribedAt: new Date() }, $unset: { confirmationHash: 1, confirmationExpiresAt: 1 } });
        if (!row) throw new ApiError(400, 'INVALID_NEWSLETTER_LINK', 'This newsletter link is invalid.');
        return { status: 'unsubscribed' as const };
      }
      const row = await NewsletterSubscription.findOneAndUpdate({ confirmationHash: digest(input.token), confirmationExpiresAt: { $gt: new Date() }, status: 'pending' }, { $set: { status: 'active', confirmedAt: new Date() } });
      if (!row && !await NewsletterSubscription.exists({ confirmationHash: digest(input.token), status: 'active' })) throw new ApiError(400, 'INVALID_NEWSLETTER_LINK', 'This confirmation link is invalid or expired. Subscribe again to request a new link.');
      return { status: 'confirmed' as const };
    },
  };
}
