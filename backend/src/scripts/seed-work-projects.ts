import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ConfigurationError, parseEnv } from '../config/env.js';
import { User, ensureIndexes } from '../domain/models.js';
import { cloudinaryProvider } from '../services/uploads.js';
import { importManifest } from '../seed/importer.js';
import { workAreas } from '../domain/work-areas.js';
import { applyWorkProjectsSeed, loadWorkProjectsManifest, workProjectAssetRoot, workProjectFields, workProjectFiles } from '../seed/work-projects.js';

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some(arg => !['--apply', '--database'].includes(arg))) throw new ConfigurationError('Use seed:work-projects, --database (read-only plan), or --apply.');
  const manifest = await loadWorkProjectsManifest();
  const files = await workProjectFiles(manifest, fileURLToPath(workProjectAssetRoot));
  console.log(JSON.stringify({ manifest: manifest.version, newProjects: manifest.records.length, verifiedPhotos: files.size, projectCovers: manifest.records.filter(record => record.files.some(id => id.startsWith('gallery:'))).length,
    fields: Object.fromEntries(workProjectFields.map(field => [field, manifest.records.filter(record => (record.payload.workAreas as string[]).includes(workAreas.find(area => area.title === field)!.slug)).length])), mode: args.includes('--apply') ? 'apply' : 'offline-plan' }));
  if (!args.length) { console.log('Offline sources verified. No database or Cloudinary writes.'); return; }
  dotenv.config({ path: resolve(fileURLToPath(new URL('../../', import.meta.url)), '.env'), quiet: true });
  const env = parseEnv(process.env);
  if (!env.MONGODB_URI) throw new ConfigurationError('Configure MONGODB_URI privately in backend/.env.');
  if (args.includes('--apply') && (env.NODE_ENV !== 'development' || env.CLOUDINARY_NAMESPACE !== 'hrpf/dev')) throw new ConfigurationError('Work project seed requires NODE_ENV=development and CLOUDINARY_NAMESPACE=hrpf/dev.');
  if (args.includes('--apply') && (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET || !process.env.SEED_ACTOR_EMAIL)) throw new ConfigurationError('Configure Cloudinary and SEED_ACTOR_EMAIL privately in backend/.env.');
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME, autoIndex: false, autoCreate: false, serverSelectionTimeoutMS: 5000 });
  try {
    if (!args.includes('--apply')) { for (const result of await importManifest(manifest, false)) console.log(JSON.stringify(result)); return; }
    const actor = await User.findOne({ email: process.env.SEED_ACTOR_EMAIL!.trim().toLowerCase(), active: true, role: { $in: ['super_admin', 'admin', 'editor'] } });
    if (!actor) throw new ConfigurationError('SEED_ACTOR_EMAIL must identify an existing active content administrator or editor.');
    await ensureIndexes();
    const results = await applyWorkProjectsSeed({ manifest, files, actorId: actor.id, namespace: env.CLOUDINARY_NAMESPACE, provider: cloudinaryProvider(env), report: result => console.log(JSON.stringify(result)), repairReport: result => console.log(JSON.stringify({repair: result})) });
    if (results.some(result => ['conflict', 'source-changed'].includes(result.status))) process.exitCode = 2;
  } finally { await mongoose.disconnect(); }
}
main().catch(error => {
  console.error(error instanceof ConfigurationError ? error.message : 'Work project seed stopped. Existing admin content is preserved. Resolve the private database/provider configuration or source issue and rerun safely.');
  process.exitCode = 1;
});
