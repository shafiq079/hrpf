import { ipKeyGenerator } from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { digest } from '../security/crypto.js';
import { ApiError, unavailable } from '../http/errors.js';
export interface RedisClient {
  readonly isReady: boolean;
  eval(script: string, options: { keys: string[]; arguments: string[] }): Promise<unknown>;
  set(key: string, value: string, options: { EX: number }): Promise<unknown>;
  exists(key: string): Promise<number>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
}
const script = `local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return {n,redis.call('PTTL',KEYS[1])}`;
const cacheScript = `redis.call('SET',KEYS[1],ARGV[1],'EX',ARGV[2]); redis.call('ZADD',KEYS[2],ARGV[3],KEYS[1]);
local old=redis.call('ZRANGEBYSCORE',KEYS[2],'-inf',ARGV[4]); for _,k in ipairs(old) do redis.call('DEL',k); redis.call('ZREM',KEYS[2],k); end;
local extra=redis.call('ZCARD',KEYS[2])-256; if extra>0 then local victims=redis.call('ZRANGE',KEYS[2],0,extra-1); for _,k in ipairs(victims) do redis.call('DEL',k); redis.call('ZREM',KEYS[2],k); end; end;
redis.call('EXPIRE',KEYS[2],3600); return 1`;
export function createRedisServices(redis: RedisClient, namespace: string) {
  const key = (kind: string, value: string) => `${namespace}:${kind}:${digest(value)}`;
  const pending = new Map<string, Promise<unknown>>();
  const limit = (kind: string, maximum: number, windowMs: number, identify?: (body: unknown) => string): RequestHandler => async (req, res, next) => {
    if (!redis.isReady) throw unavailable();
    const identifiers = [`ip:${ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? 'unknown')}`];
    if (identify) identifiers.push(`account:${identify(req.body)}`);
    for (const identifier of identifiers) {
      let result;
      try { result = await redis.eval(script, { keys: [key(`limit:${kind}`, identifier)], arguments: [String(windowMs)] }) as [number, number]; }
      catch { throw unavailable(); }
      if (Number(result[0]) > maximum) {
        res.setHeader('Retry-After', Math.max(1, Math.ceil(Number(result[1]) / 1000)));
        throw new ApiError(429, 'RATE_LIMITED', 'Too many requests. Try again later.');
      }
    }
    next();
  };
  return {
    limit,
    async putTicket(hash: string, ttl: number) {
      if (!redis.isReady) throw unavailable();
      try { await redis.set(key('ticket', hash), '1', { EX: ttl }); } catch { throw unavailable(); }
    },
    async hasTicket(hash: string) {
      if (!redis.isReady) throw unavailable();
      try { return await redis.exists(key('ticket', hash)) === 1; } catch { throw unavailable(); }
    },
    async publicCache<T>(cacheKey: string, ttl: number, load: () => Promise<T>, valid: (value: T) => boolean = () => true): Promise<T> {
      // Only explicitly projected public reads may call this helper. Never cache auth/PII.
      try { const cached = redis.isReady ? await redis.get(key('public', cacheKey)) : null; if (cached) { const value = JSON.parse(cached) as T; if (valid(value)) return value; } } catch { /* read-through */ }
      const existing = pending.get(cacheKey); if (existing) return existing as Promise<T>;
      const work = (async () => {
        const result = await load(), body = JSON.stringify(result), now = Date.now();
        // Bound cache memory: 256 entries, at most 256 KiB each, at most one hour.
        try { if (redis.isReady && Buffer.byteLength(body) <= 256 * 1024) await redis.eval(cacheScript, { keys: [key('public', cacheKey), `${namespace}:public-index`], arguments: [body, String(Math.min(3600, Math.max(1, ttl))), String(now), String(now - 3600000)] }); } catch { /* Mongo remains authoritative */ }
        return result;
      })();
      if (pending.size < 256) pending.set(cacheKey, work);
      try { return await work; } finally { if (pending.get(cacheKey) === work) pending.delete(cacheKey); }
    },
    async invalidatePublic(cacheKey: string) { if (redis.isReady) await redis.del(key('public', cacheKey)); },
  };
}
export type RedisServices = ReturnType<typeof createRedisServices>;
