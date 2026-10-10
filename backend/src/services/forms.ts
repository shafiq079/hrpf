import { z } from 'zod';
import type { Environment } from '../config/env.js';
import { FormTicket, Setting } from '../domain/models.js';
import { ApiError, unavailable, validate } from '../http/errors.js';
import { digest, token } from '../security/crypto.js';
import type { RedisServices } from '../infrastructure/redis-services.js';
export const purpose = z.enum(['complaint', 'membership', 'membership_registration', 'contact', 'newsletter']);
export type FormPurpose = z.infer<typeof purpose>;
export const membershipPolicy = z.object({
  enabled: z.boolean(), version: z.string().min(1).max(50), currency: z.literal('PKR'),
  types: z.array(z.object({ key: z.string().min(1).max(100), amountPaisa: z.number().int().positive(), validityMonths: z.number().int().min(1).max(120) }).strict()).min(1).max(20),
}).strict();
export async function requireMembershipPolicy(type?: string) {
  const stored = await Setting.findOne({ key: 'membershipPolicy' }).lean();
  const result = membershipPolicy.safeParse(stored?.value);
  if (!result.success || !result.data.enabled) throw new ApiError(503, 'MEMBERSHIP_DISABLED', 'Membership applications are not available until the membership policy is configured.');
  if (type && !result.data.types.some(v => v.key === type)) throw new ApiError(400, 'INVALID_MEMBERSHIP_TYPE', 'Choose an available membership type.');
  return result.data;
}
export type BotVerifier = (value: string, purpose: FormPurpose) => Promise<boolean>;
export function turnstileVerifier(env: Environment): BotVerifier {
  return async (value, expectedAction) => {
    if (!env.TURNSTILE_SECRET_KEY || !env.TURNSTILE_HOSTNAMES.length) throw unavailable();
    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: value }), signal: AbortSignal.timeout(8000),
      });
      const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
      return response.ok && result.success === true && result.action === expectedAction && !!result.hostname && env.TURNSTILE_HOSTNAMES.includes(result.hostname);
    } catch { throw unavailable(); }
  };
}
export function createForms(redis: RedisServices, verifyBot: BotVerifier) {
  return {
    async issue(body: unknown) {
      const input = validate(z.object({ purpose, botToken: z.string().min(1).max(2048) }).strict(), body);
      if (input.purpose === 'membership') await requireMembershipPolicy();
      if (!await verifyBot(input.botToken, input.purpose)) throw new ApiError(403, 'BOT_VERIFICATION_FAILED', 'Complete the verification and try again.');
      const value = token(), hash = digest(value), ttl = 900;
      await redis.putTicket(hash, ttl);
      await FormTicket.create({ tokenHash: hash, purpose: input.purpose, expiresAt: new Date(Date.now() + ttl * 1000) });
      return { ticket: value, purpose: input.purpose, expiresIn: ttl };
    },
    async check(value: string, expected: FormPurpose, allowConsumed = false) {
      const hash = digest(value);
      const cached = await redis.hasTicket(hash);
      const ticket = await FormTicket.findOne({ tokenHash: hash, purpose: expected, expiresAt: { $gt: new Date() }, ...(!allowConsumed ? { consumedAt: null } : {}) });
      if (!ticket) throw new ApiError(403, 'INVALID_FORM_TICKET', 'The form session is invalid or expired.');
      // Mongo is authoritative. Rehydrate the TTL mirror after a Redis restart.
      if (!cached) await redis.putTicket(hash, Math.max(1, Math.ceil((ticket.expiresAt.getTime() - Date.now()) / 1000)));
      return ticket;
    },
  };
}
export type FormsService = ReturnType<typeof createForms>;
