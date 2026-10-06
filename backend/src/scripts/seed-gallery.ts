import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ConfigurationError, parseEnv } from '../config/env.js';
import { User, ensureIndexes } from '../domain/models.js';
import { cloudinaryProvider, clamScanner } from '../services/uploads.js';
import { applyGallerySeed, galleryAssetRoot, galleryFiles, loadGalleryManifest, planGallerySeed } from '../seed/gallery.js';
let phase = 'configuration';
async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--apply', '--database'].includes(arg))) throw new ConfigurationError('Use seed:gallery, --database (read-only plan), or --apply.');
  const manifest = await loadGalleryManifest();
  const files = await galleryFiles(manifest, fileURLToPath(galleryAssetRoot));
  console.log(JSON.stringify({
    manifest: manifest.version,
    images: 4,
    interviews: 0,
    verifiedImages: files.size,
    mode: args.includes('--apply') ? 'apply' : 'plan'
  }));
  if (!args.length) {
    console.log('Offline plan verified. No database or Cloudinary writes.');
    return;
  }
  dotenv.config({
    path: resolve(fileURLToPath(new URL('../../', import.meta.url)), '.env'),
    quiet: true
  });
  const env = parseEnv(process.env);
  if (!env.MONGODB_URI) throw new ConfigurationError('Configure MONGODB_URI privately in backend/.env.');
  if (args.includes('--apply') && (env.NODE_ENV !== 'development' || env.CLOUDINARY_NAMESPACE !== 'hrpf/dev')) throw new ConfigurationError('Gallery seed requires NODE_ENV=development and CLOUDINARY_NAMESPACE=hrpf/dev.');
  if (args.includes('--apply') && (!env.CLAMAV_HOST || !env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET || !process.env.SEED_ACTOR_EMAIL)) throw new ConfigurationError('Configure Cloudinary, ClamAV and SEED_ACTOR_EMAIL privately in backend/.env.');
  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
    autoIndex: false,
    autoCreate: false,
    serverSelectionTimeoutMS: 5000
  });
  try {
    if (!args.includes('--apply')) {
      for (const result of await planGallerySeed(manifest)) console.log(JSON.stringify(result));
      return;
    }
    const actor = await User.findOne({
      email: process.env.SEED_ACTOR_EMAIL!.trim().toLowerCase(),
      active: true,
      role: {
        $in: ['super_admin', 'admin', 'editor']
      }
    });
    if (!actor) throw new ConfigurationError('SEED_ACTOR_EMAIL must identify an existing active content administrator or editor.');
    await ensureIndexes();
    const results = await applyGallerySeed({
      manifest,
      files,
      actorId: actor.id,
      namespace: env.CLOUDINARY_NAMESPACE,
      provider: cloudinaryProvider(env),
      scanner: clamScanner(env),
      phase: value => {
        phase = value;
        console.log(JSON.stringify({
          phase
        }));
      },
      report: result => console.log(JSON.stringify(result))
    });
    if (results.some(result => ['conflict', 'source-changed'].includes(result.status))) process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}
main().catch(error => {
  console.error(error instanceof ConfigurationError ? error.message : `Gallery seed stopped during ${phase}. Existing admin content is preserved. Check the corresponding private service configuration and rerun safely.`);
  process.exitCode = 1;
});
