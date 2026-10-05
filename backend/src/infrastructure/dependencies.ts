import mongoose from 'mongoose';
import { createClient } from 'redis';
import type { Environment } from '../config/env.js';

export type DependencyStatus = { mongo: boolean; redis: boolean };
export type Readiness = () => Promise<DependencyStatus>;
export function createDependencies(env: Environment) {
  mongoose.set('strictQuery', true);
  mongoose.set('sanitizeFilter', true);
  mongoose.set('bufferCommands', false);
  const redis = createClient({
    url: env.REDIS_URL,
    socket: { connectTimeout: 3000, reconnectStrategy: retries => Math.min(250 * (retries + 1), 3000) },
    disableOfflineQueue: true,
  });
  // Driver errors can contain credentials; never log them.
  redis.on('error', () => {});
  mongoose.connection.on('error', () => {});
  let stopping = false;
  let mongoRetry: ReturnType<typeof setTimeout> | undefined;
  async function connectMongo() {
    if (stopping || !env.MONGODB_URI) return;
    try {
      await mongoose.connect(env.MONGODB_URI, {
        dbName: env.MONGODB_DB_NAME, serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000, socketTimeoutMS: 3000, autoIndex: false,
      });
    } catch {
      if (!stopping) mongoRetry = setTimeout(() => { void connectMongo(); }, 5000);
    }
  }
  function start() {
    void connectMongo();
    void redis.connect().catch(() => {});
  }
  const readiness: Readiness = async () => {
    const deadline = <T>(operation: Promise<T>) => new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Dependency timeout')), 2000);
      operation.then(value => { clearTimeout(timer); resolve(value); }, error => {
        clearTimeout(timer); reject(error);
      });
    });
    const checks = await Promise.allSettled([
      mongoose.connection.readyState === 1 && mongoose.connection.db
        ? deadline(mongoose.connection.db.admin().ping()) : Promise.reject(new Error('Mongo unavailable')),
      redis.isReady ? deadline(redis.ping()) : Promise.reject(new Error('Redis unavailable')),
    ]);
    return { mongo: checks[0]?.status === 'fulfilled', redis: checks[1]?.status === 'fulfilled' };
  };
  async function close() {
    stopping = true;
    if (mongoRetry) clearTimeout(mongoRetry);
    if (redis.isOpen) redis.destroy();
    await mongoose.disconnect();
  }
  return { start, readiness, close };
}
