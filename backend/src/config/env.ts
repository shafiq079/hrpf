import { z } from 'zod';

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
});
export function parseEnv(input: NodeJS.ProcessEnv) {
  const result = schema.safeParse({
    ...input,
    FRONTEND_URL: input.FRONTEND_URL?.trim() || undefined,
    MONGODB_URI: input.MONGODB_URI?.trim() || undefined,
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
  return { ...env, allowedOrigins: [...origins] };
}
export type Environment = ReturnType<typeof parseEnv>;
