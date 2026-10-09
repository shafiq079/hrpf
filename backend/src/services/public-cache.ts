import type mongoose from 'mongoose';
import { Counter } from '../domain/models.js';
import type { RedisServices } from '../infrastructure/redis-services.js';

const revisionKey = 'public:content-revision';
/** Commit the revision with the content write, never through a best-effort Redis delete. */
export async function bumpPublicRevision(session: mongoose.ClientSession) {
  await Counter.findOneAndUpdate({ key: revisionKey }, { $inc: { sequence: 1 } }, { session, upsert: true });
}
type Envelope = { expiresAt: number; payload: unknown };
export function createPublicReadCache(redis: RedisServices, ttl: number) {
  const revision = async () => (await Counter.findOne({ key: revisionKey }).select('sequence').lean())?.sequence ?? 0;
  return async (path: string, query: unknown, models: mongoose.Model<any>[], load: () => Promise<unknown>, report?: (status: 'HIT' | 'MISS' | 'BYPASS') => void) => {
    let loaded = false;
    const fresh = async (): Promise<Envelope> => {
      loaded = true;
      // A scheduled release changes eligibility without an editor write. Never cache across it.
      const now = Date.now();
      const boundaries = await Promise.all(models.map(model => model.findOne({ publishedAt: { $gt: new Date(now) } }).sort({ publishedAt: 1 }).select('publishedAt').lean()));
      const expiresAt = Math.min(now + ttl * 1000, ...boundaries.map(row => row?.publishedAt?.getTime() ?? Infinity));
      return { expiresAt, payload: await load() };
    };
    for (let attempt = 0; attempt < 2; attempt++) {
      const before = await revision();
      const result = await redis.publicCache<Envelope>(JSON.stringify([1, before, path, query]), ttl, fresh,
        value => !!value && Number.isFinite(value.expiresAt) && value.expiresAt > Date.now() && 'payload' in value);
      // A concurrent write must not make an old cache entry current again.
      if (before === await revision() && result.expiresAt > Date.now()) { report?.(loaded ? 'MISS' : 'HIT'); return result.payload; }
    }
    // High write activity bypasses caching instead of blocking public readers.
    report?.('BYPASS'); return load();
  };
}
