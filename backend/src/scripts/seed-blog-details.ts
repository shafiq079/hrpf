import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { ConfigurationError, parseEnv } from "../config/env.js";
import { User, ensureIndexes } from "../domain/models.js";
import { cloudinaryProvider, clamScanner } from "../services/uploads.js";
import {
  applyBlogDetails,
  homepageAssetRoot,
  loadBlogDetailsManifest,
  planBlogDetails,
  blogDetailsFiles,
} from "../seed/blog-details.js";

async function main() {
  const args = process.argv.slice(2);
  if (
    args.length > 1 ||
    args.some((arg) => !["--apply", "--database"].includes(arg))
  )
    throw new ConfigurationError(
      "Use seed:blogs, --database (read-only plan), or --apply.",
    );
  const manifest = await loadBlogDetailsManifest(),
    uploads = await blogDetailsFiles(
      manifest,
      fileURLToPath(homepageAssetRoot),
    );
  console.log(
    JSON.stringify({
      manifest: manifest.version,
      blogs: manifest.blogs.length,
      galleryPhotos: 6,
      sourceBriefs: 3,
      mode: args.includes("--apply") ? "apply" : "plan",
    }),
  );
  if (!args.length) {
    console.log(
      "Blog detail files verified offline. No database or Cloudinary writes.",
    );
    return;
  }
  dotenv.config({
    path: resolve(fileURLToPath(new URL("../../", import.meta.url)), ".env"),
    quiet: true,
  });
  const env = parseEnv(process.env);
  if (!env.MONGODB_URI)
    throw new ConfigurationError(
      "Configure MONGODB_URI privately in backend/.env.",
    );
  if (
    args.includes("--apply") &&
    (env.NODE_ENV !== "development" || env.CLOUDINARY_NAMESPACE !== "hrpf/dev")
  )
    throw new ConfigurationError(
      "Blog enrichment requires NODE_ENV=development and CLOUDINARY_NAMESPACE=hrpf/dev.",
    );
  if (
    args.includes("--apply") &&
    (!env.CLAMAV_HOST ||
      !env.CLOUDINARY_CLOUD_NAME ||
      !env.CLOUDINARY_API_KEY ||
      !env.CLOUDINARY_API_SECRET ||
      !process.env.SEED_ACTOR_EMAIL)
  )
    throw new ConfigurationError(
      "Configure Cloudinary, ClamAV and SEED_ACTOR_EMAIL privately in backend/.env.",
    );
  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
    autoIndex: false,
    autoCreate: false,
    serverSelectionTimeoutMS: 5000,
  });
  try {
    if (!args.includes("--apply")) {
      for (const result of await planBlogDetails(manifest))
        console.log(JSON.stringify(result));
      return;
    }
    const actor = await User.findOne({
      email: process.env.SEED_ACTOR_EMAIL!.trim().toLowerCase(),
      active: true,
      role: { $in: ["super_admin", "admin", "editor"] },
    });
    if (!actor)
      throw new ConfigurationError(
        "SEED_ACTOR_EMAIL must identify an existing active content administrator or editor.",
      );
    await ensureIndexes();
    const results = await applyBlogDetails({
      manifest,
      uploads,
      actorId: actor.id,
      namespace: env.CLOUDINARY_NAMESPACE,
      provider: cloudinaryProvider(env),
      scanner: clamScanner(env),
      report: (result) => console.log(JSON.stringify(result)),
    });
    if (
      results.some((result) =>
        ["source-changed", "version-conflict", "unmanaged-preserved"].includes(
          result.status,
        ),
      )
    )
      process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}
main().catch((error) => {
  console.error(
    error instanceof ConfigurationError
      ? error.message
      : "Blog enrichment stopped. Check private database, Cloudinary and ClamAV configuration; completed blogs are safe to rerun.",
  );
  process.exitCode = 1;
});
