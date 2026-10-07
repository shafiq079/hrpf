import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ConfigurationError, parseEnv } from '../config/env.js';
import { User, ensureIndexes } from '../domain/models.js';
import { cloudinaryProvider } from '../services/uploads.js';
import { importManifest } from '../seed/importer.js';
import { applyHomepageSeed, homepageAssetRoot, homepageFiles, loadHomepageManifest } from '../seed/homepage.js';
async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--apply', '--database'].includes(arg))) throw new ConfigurationError('Use seed:home, --database (read-only plan), or --apply.');
  const manifest = await loadHomepageManifest();
  const files = await homepageFiles(manifest, fileURLToPath(homepageAssetRoot));
  console.log(JSON.stringify({ manifest: manifest.version, projects: 3, news: 3, verifiedCovers: files.size, mode: args.includes('--apply') ? 'apply' : 'plan' }));
  if (!args.length) { console.log('Offline plan verified. No database or Cloudinary writes.'); return; }
  dotenv.config({ path: resolve(fileURLToPath(new URL('../../', import.meta.url)), '.env'), quiet: true });
  const env = parseEnv(process.env);
  if (!env.MONGODB_URI) throw new ConfigurationError('Configure MONGODB_URI privately in backend/.env.');
  if (args.includes('--apply') && (env.NODE_ENV !== 'development' || env.CLOUDINARY_NAMESPACE !== 'hrpf/dev')) throw new ConfigurationError('Homepage seed requires NODE_ENV=development and CLOUDINARY_NAMESPACE=hrpf/dev.');
  if (args.includes('--apply') && (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET || !process.env.SEED_ACTOR_EMAIL)) throw new ConfigurationError('Configure Cloudinary and SEED_ACTOR_EMAIL privately in backend/.env.');
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME, autoIndex: false, autoCreate: false, serverSelectionTimeoutMS: 5000 });
  try {
    if (!args.includes('--apply')) { for (const result of await importManifest(manifest, false)) console.log(JSON.stringify(result)); return; }
    const actor = await User.findOne({ email: process.env.SEED_ACTOR_EMAIL!.trim().toLowerCase(), active: true, role: { $in: ['super_admin', 'admin', 'editor'] } });
    if (!actor) throw new ConfigurationError('SEED_ACTOR_EMAIL must identify an existing active content administrator or editor.');
    await ensureIndexes();
    const results = await applyHomepageSeed({ manifest, files, actorId: actor.id, namespace: env.CLOUDINARY_NAMESPACE, provider: cloudinaryProvider(env), report: result => console.log(JSON.stringify(result)) });
    if (results.some(result => ['conflict', 'source-changed'].includes(result.status))) process.exitCode = 2;
  } finally { await mongoose.disconnect(); }
}
main().catch(error => {
  console.error(error instanceof ConfigurationError ? error.message : 'Homepage seed stopped. Existing admin content is preserved. Check private database and Cloudinary configuration; rerun safely after resolving the issue.');
  process.exitCode = 1;
});
