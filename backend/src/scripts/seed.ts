import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ConfigurationError, parseEnv } from '../config/env.js';
import { ensureIndexes } from '../domain/models.js';
import { assetCandidates, prepareAssets, verifySources } from '../seed/files.js';
import { loadManifest } from '../seed/manifest.js';
import { importManifest } from '../seed/importer.js';
const backendRoot = fileURLToPath(new URL('../../', import.meta.url));
function counts(values: string[]) {
  return Object.fromEntries([...new Set(values)].sort().map(value => [value, values.filter(item => item === value).length]));
}
async function main() {
  const [command, ...flags] = process.argv.slice(2);
  if (!['check', 'plan', 'prepare', 'import'].includes(command ?? '') || flags.some(flag => flag !== '--apply' && flag !== '--database') || (flags.includes('--apply') && command !== 'import')) throw new ConfigurationError('Choose check, plan, prepare or import; --apply is supported only for import.');
  const manifest = await loadManifest();
  console.log(JSON.stringify({ manifest: manifest.version, records: counts(manifest.records.map(record => record.kind)), fileReferences: manifest.files.length, assetCandidates: assetCandidates(manifest).length, duplicates: manifest.records.filter(record => record.duplicateOf).length, aiRestorations: manifest.records.filter(record => record.payload.treatment === 'AI_RESTORATION').length }));
  if (command === 'check') return;
  const root = resolve(backendRoot, 'seed-assets');
  const files = await verifySources(manifest, root);
  console.log(JSON.stringify({ sourceFiles: counts(files.map(file => file.status)), issues: files.filter(file => file.status !== 'verified') }));
  if (files.some(file => file.status !== 'verified')) throw new ConfigurationError('Restore the exact approved source files in backend/seed-assets. No database or provider writes occurred.');
  if (command === 'plan') return;
  if (command === 'prepare') {
    const total = await prepareAssets(manifest, root, resolve(backendRoot, `tmp/seed-prepared/${manifest.version}`));
    console.log(`Prepared ${total} local candidates. All remain pending review and not uploaded.`);
    return;
  }
  if (!flags.includes('--apply') && !flags.includes('--database')) {
    console.log('Offline dry run complete. Use --database to inspect existing records; --apply to insert missing drafts.');
    return;
  }
  dotenv.config({ path: resolve(backendRoot, '.env'), quiet: true });
  const env = parseEnv(process.env);
  if (!env.MONGODB_URI) throw new ConfigurationError('Configure MONGODB_URI privately.');
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME, autoIndex: false, autoCreate: false, serverSelectionTimeoutMS: 5000 });
  try {
    // A database dry run performs reads only, including no index preparation.
    if (flags.includes('--apply')) await ensureIndexes();
    const results = await importManifest(manifest, flags.includes('--apply'), result => console.log(JSON.stringify(result)));
    console.log(JSON.stringify({ results: counts(results.map(result => result.status)) }));
    if (results.some(result => ['conflict', 'source-changed'].includes(result.status))) process.exitCode = 2;
  } finally { await mongoose.disconnect(); }
}
main().catch(error => {
  console.error(error instanceof ConfigurationError ? error.message : 'Source preparation failed. Existing content is preserved; check source files, unzip availability and private MongoDB replica-set configuration.');
  process.exitCode = 1;
});
