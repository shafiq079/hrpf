import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ConfigurationError, parseEnv } from '../config/env.js';
import { ensureIndexes, User } from '../domain/models.js';
import { loadVideoManifest, planVideoSeed, applyVideoSeed } from '../seed/videos.js';

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some(arg => !['--apply', '--database'].includes(arg))) throw new ConfigurationError('Use seed:videos, --database (read-only), or --apply.');
  const manifest = await loadVideoManifest();
  console.log(JSON.stringify({ videos: manifest.videos.length, tvInterviews: manifest.videos.filter(v => v.category === 'tv-interviews').length, mediaCoverage: manifest.videos.filter(v => v.category === 'media-coverage').length, mode: args[0] ?? 'offline-plan' }));
  if (!args.length) { console.log('Offline manifest verified. No database, YouTube or Cloudinary requests.'); return; }
  dotenv.config({ path: resolve(fileURLToPath(new URL('../../', import.meta.url)), '.env'), quiet: true });
  const env = parseEnv(process.env);
  if (!env.MONGODB_URI) throw new ConfigurationError('Configure MONGODB_URI privately in backend/.env.');
  if (args.includes('--apply') && (env.NODE_ENV !== 'development' || env.CLOUDINARY_NAMESPACE !== 'hrpf/dev')) throw new ConfigurationError('Use the development database with NODE_ENV=development and CLOUDINARY_NAMESPACE=hrpf/dev. No Cloudinary credentials are needed.');
  if (args.includes('--apply') && !process.env.SEED_ACTOR_EMAIL) throw new ConfigurationError('Configure SEED_ACTOR_EMAIL privately in backend/.env.');
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME, autoIndex: false, autoCreate: false, serverSelectionTimeoutMS: 5000 });
  try {
    if (args.includes('--database')) {
      for (const result of await planVideoSeed(manifest)) console.log(JSON.stringify(result));
      return;
    }
    const actor = await User.findOne({ email: process.env.SEED_ACTOR_EMAIL!.trim().toLowerCase(), active: true, role: { $in: ['super_admin', 'admin'] } });
    if (!actor) throw new ConfigurationError('SEED_ACTOR_EMAIL must identify an existing active administrator.');
    await ensureIndexes();
    const results = await applyVideoSeed(manifest, actor.id, undefined, result => console.log(JSON.stringify(result)));
    console.log(JSON.stringify({ created: results.filter(r => r.status === 'created').length, preserved: results.filter(r => r.status === 'preserved').length, failed: results.filter(r => r.status === 'failed').length }));
    if (results.some(r => r.status === 'failed')) { console.error('Some videos could not be imported. Check video availability and YouTube connectivity, then rerun; existing records are preserved.'); process.exitCode = 2; }
  } finally { await mongoose.disconnect(); }
}
main().catch(error => {
  console.error(error instanceof ConfigurationError ? error.message : 'Video seed stopped. Check your private database configuration and rerun safely.');
  process.exitCode = 1;
});
