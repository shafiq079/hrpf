import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ConfigurationError, parseEnv } from '../config/env.js';
import { Counter, User, ensureIndexes } from '../domain/models.js';
import { hashPassword } from '../security/crypto.js';
import { newPassword } from '../security/auth.js';
import { z } from 'zod';
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
async function main() {
  const env = parseEnv(process.env);
  if (!env.MONGODB_URI) throw new ConfigurationError('MONGODB_URI is required.');
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME, autoIndex: false, serverSelectionTimeoutMS: 5000 });
  try {
    await ensureIndexes();
    if (process.argv[2] === 'indexes') { console.log('Database indexes ensured.'); return; }
    if (process.argv[2] !== 'admin') throw new ConfigurationError('Choose indexes or admin.');
    const email = z.email().safeParse(process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase());
    const password = newPassword.safeParse(process.env.SEED_ADMIN_PASSWORD);
    if (!email.success || !password.success) throw new ConfigurationError('Configure SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (12–200 characters) privately.');
    const passwordHash = await hashPassword(password.data);
    await mongoose.connection.transaction(async tx => {
      await Counter.findOneAndUpdate({ key: 'security:user-governance' }, { $inc: { sequence: 1 } }, { session: tx, upsert: true });
      if (await User.countDocuments().session(tx)) throw new ConfigurationError('Initial admin creation requires an empty User collection. Existing accounts are preserved.');
      await User.create([{ email: email.data, passwordHash, name: 'HRPF administrator', role: 'super_admin' }], { session: tx });
    });
    console.log('Initial super administrator created. Remove SEED_ADMIN_PASSWORD from private configuration.');
  } finally { await mongoose.disconnect(); }
}
main().catch(error => { console.error(error instanceof ConfigurationError ? error.message : 'Database setup failed. Check private configuration and replica-set support.'); process.exitCode = 1; });
