import { z } from 'zod';
import { isIP } from 'node:net';

export class ConfigurationError extends Error {}

const origin = z.string().refine(value => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password &&
      url.pathname === '/' && !url.search && !url.hash;
  } catch { return false; }
}, 'Must be an exact HTTP(S) origin');
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  FRONTEND_URL: origin.optional(),
  CORS_ORIGINS: z.array(origin).default([]),
  REDIS_URL: z.string().refine(value => {
    try { return ['redis:', 'rediss:'].includes(new URL(value).protocol); }
    catch { return false; }
  }, 'Must use redis or rediss').default('redis://127.0.0.1:6379'),
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//).optional(),
  MONGODB_DB_NAME: z.string().regex(/^[A-Za-z0-9_-]+$/).default('hrpf_dev'),
  JWT_ACCESS_SECRET: z.string().min(43).optional(),
  JWT_REFRESH_SECRET: z.string().min(43).optional(),
  DATA_ENCRYPTION_KEY: z.string().regex(/^[a-fA-F0-9]{64}$/).optional(),
  CNIC_HASH_KEY: z.string().min(43).optional(),
  TRUST_PROXY_CIDRS: z.array(z.string().refine(value => { const [address, bits] = value.split('/'); const kind = isIP(address ?? ''); return !!kind && (bits === undefined || (/^\d+$/.test(bits) && Number(bits) <= (kind === 4 ? 32 : 128))); })).default([]),
  CLOUDINARY_CLOUD_NAME: z.string().regex(/^[a-z0-9_-]+$/).optional(),
  CLOUDINARY_API_KEY: z.string().optional(), CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_NAMESPACE: z.enum(['hrpf/dev', 'hrpf/prod']).default('hrpf/dev'),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  TURNSTILE_HOSTNAMES: z.array(z.string().regex(/^[a-zA-Z0-9.-]+$/)).default([]),
  EMAIL_PROVIDER: z.enum(['smtp', 'resend']).default('smtp'),
  EMAIL_DELIVERY_MODE: z.enum(['worker', 'embedded']).default('worker'),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(), SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().optional(), SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  MAIL_FROM: z.email().optional(), ADMIN_NOTIFY_EMAILS: z.array(z.email()).default([]),

});
export function parseEnv(input: NodeJS.ProcessEnv) {
  const normalized = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value?.trim() || undefined]));
  const result = schema.safeParse({
    ...normalized,
    TRUST_PROXY_CIDRS: input.TRUST_PROXY_CIDRS?.split(',').map(v => v.trim()).filter(Boolean) ?? [],
    TURNSTILE_HOSTNAMES: input.TURNSTILE_HOSTNAMES?.split(',').map(v => v.trim()).filter(Boolean) ?? [],
    ADMIN_NOTIFY_EMAILS: input.ADMIN_NOTIFY_EMAILS?.split(',').map(v => v.trim()).filter(Boolean) ?? [],
    FRONTEND_URL: input.FRONTEND_URL?.trim() || undefined,
    MONGODB_URI: input.MONGODB_URI?.trim() || undefined,
    MONGODB_DB_NAME: input.MONGODB_DB_NAME?.trim() || undefined,
    CORS_ORIGINS: input.CORS_ORIGINS?.split(',').map(item => item.trim()).filter(Boolean) ?? [],
  });
  if (!result.success) {
    const keys = [...new Set(result.error.issues.map(issue => issue.path[0]))].join(', ');
    throw new ConfigurationError(`Invalid environment variable(s): ${keys}. Values have been omitted.`);
  }
  const env = result.data;
  if (env.NODE_ENV === 'production' && (!env.MONGODB_URI || !env.FRONTEND_URL)) {
    throw new ConfigurationError('Production requires MONGODB_URI and FRONTEND_URL. Values have been omitted.');
  }
  if (env.JWT_ACCESS_SECRET && env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    throw new ConfigurationError('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be distinct.');
  }
  const origins = new Set(env.CORS_ORIGINS.map(value => new URL(value).origin));
  if (env.FRONTEND_URL) origins.add(new URL(env.FRONTEND_URL).origin);
  if (env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
    if (input.CODESPACE_NAME) {
      const domain = input.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';
      const checked = origin.safeParse(`https://${input.CODESPACE_NAME}-3000.${domain}`);
      if (!checked.success) throw new ConfigurationError('Invalid Codespaces origin configuration.');
      origins.add(new URL(checked.data).origin);
    }
  }
  if (env.NODE_ENV === 'production' && [...origins].some(value => !value.startsWith('https://'))) {
    throw new ConfigurationError('Production frontend origins must use HTTPS.');
  }
  if (env.NODE_ENV === 'production' && env.CLOUDINARY_NAMESPACE !== 'hrpf/prod') {
    throw new ConfigurationError('Production requires CLOUDINARY_NAMESPACE=hrpf/prod.');
  }
  return { ...env, allowedOrigins: [...origins] };
}
export type Environment = ReturnType<typeof parseEnv>;
