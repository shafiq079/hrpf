import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { ConfigurationError, parseEnv } from "../config/env.js";
import { User, ensureIndexes } from "../domain/models.js";
import { cloudinaryProvider, clamScanner } from "../services/uploads.js";
import {
  applyBoardSeed,
  boardAssetRoot,
  boardFiles,
  loadBoardManifest,
  planBoardSeed,
} from "../seed/board.js";
let phase = "verification";
async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => !["--apply", "--database"].includes(arg)))
    throw new ConfigurationError(
      "Use seed:board, --database (read-only plan), or --apply.",
    );
  const manifest = await loadBoardManifest();
  const files = await boardFiles(manifest, fileURLToPath(boardAssetRoot));
  console.log(
    JSON.stringify({
      manifest: manifest.version,
      profiles: 7,
      verifiedPublicCopies: files.size,
      mode: args.includes("--apply") ? "apply" : "plan",
    }),
  );
  if (!args.length) {
    console.log("Offline plan verified. No database or Cloudinary writes.");
    return;
  }
  phase = "configuration";
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
      "Board seed requires NODE_ENV=development and CLOUDINARY_NAMESPACE=hrpf/dev.",
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
  phase = "database";
  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
    autoIndex: false,
    autoCreate: false,
    serverSelectionTimeoutMS: 5000,
  });
  try {
    if (!args.includes("--apply")) {
      const results = await planBoardSeed(manifest);
      for (const result of results) console.log(JSON.stringify(result));
      summary(results);
      if (
        results.some((result) =>
          ["conflict", "source-changed"].includes(result.status),
        )
      )
        process.exitCode = 2;
      return;
    }
    const actor = await User.findOne({
      email: process.env.SEED_ACTOR_EMAIL!.trim().toLowerCase(),
      active: true,
      role: {
        $in: ["super_admin", "admin"],
      },
    });
    if (!actor)
      throw new ConfigurationError(
        "SEED_ACTOR_EMAIL must identify an existing active content administrator.",
      );
    await ensureIndexes();
    const results = await applyBoardSeed({
      manifest,
      files,
      actorId: actor.id,
      namespace: env.CLOUDINARY_NAMESPACE,
      provider: cloudinaryProvider(env),
      scanner: clamScanner(env),
      phase: (value) => {
        if (value === phase) return;
        phase = value;
        console.log(
          JSON.stringify({
            phase,
          }),
        );
      },
      report: (result) => console.log(JSON.stringify(result)),
    });
    summary(results);
    if (
      results.some((result) =>
        ["conflict", "source-changed"].includes(result.status),
      )
    )
      process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}
function summary(results: Awaited<ReturnType<typeof planBoardSeed>>) {
  const statuses: Record<string, number> = {};
  for (const result of results)
    statuses[result.status] = (statuses[result.status] ?? 0) + 1;
  console.log(
    JSON.stringify({ phase: "summary", processed: results.length, statuses }),
  );
}
main().catch((error) => {
  console.error(
    error instanceof ConfigurationError
      ? error.message
      : `Board seed stopped during ${phase}. Existing admin content is preserved. Check the source files or corresponding private service configuration and rerun safely.`,
  );
  process.exitCode = 1;
});
