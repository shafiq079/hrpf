import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import mongoose from "mongoose";
import { z } from "zod";
import {
  Asset,
  AuditLog,
  Counter,
  BlogPost,
  SourceImport,
  User,
} from "../domain/models.js";
import { blogDetailsInput } from "../http/blog-details.js";
import { can } from "../security/permissions.js";
import { digest } from "../security/crypto.js";
import { bindContentMedia } from "../services/project-media.js";
import {
  inspectUpload,
  type Scanner,
  type UploadProvider,
  type Upload,
} from "../services/uploads.js";
import { verifySources } from "./files.js";
import { homepageAssetRoot } from "./homepage.js";
import {
  recordChecksum,
  seedId,
  sourceFileSchema,
  type Manifest,
  type SeedRecord,
} from "./manifest.js";

const entrySchema = z
  .object({
    key: z.enum([
      "home-news:school-accountability-mianwal-ranjha",
      "home-news:canal-water-pollution-advocacy",
      "home-news:human-trafficking-awareness",
    ]),
    details: blogDetailsInput,
    tags: z.array(z.string().trim().min(1).max(50)).max(12),
    coverAlt: z.string().trim().min(1).max(300),
    gallery: z
      .array(
        z
          .object({
            fileId: z.string(),
            alt: z.string().trim().min(1).max(300),
            caption: z.string().max(500),
          })
          .strict(),
      )
      .length(2),
    documents: z
      .array(
        z
          .object({
            fileId: z.string(),
            label: z.string().trim().min(1).max(150),
          })
          .strict(),
      )
      .length(1),
  })
  .strict();
const manifestSchema = z
  .object({
    version: z.literal("blog-details-v1"),
    files: z.array(sourceFileSchema),
    blogs: z.array(entrySchema).length(3),
  })
  .strict();
export type BlogDetailsManifest = z.infer<typeof manifestSchema>;
type Entry = BlogDetailsManifest["blogs"][number];
export type BlogDetailsResult = {
  key: string;
  status:
    | "would-enrich"
    | "enriched"
    | "already-enriched"
    | "admin-preserved"
    | "deleted-preserved"
    | "unmanaged-preserved"
    | "source-changed"
    | "version-conflict";
};

export async function loadBlogDetailsManifest() {
  const manifest = manifestSchema.parse(
    JSON.parse(
      await readFile(
        new URL("../../seed/blog-details-manifest.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  const ids = new Set(manifest.files.map((file) => file.id));
  if (
    ids.size !== manifest.files.length ||
    new Set(manifest.blogs.map((entry) => entry.key)).size !== 3
  )
    throw new Error("Duplicate blog enrichment identity.");
  for (const entry of manifest.blogs) {
    for (const photo of entry.gallery)
      if (
        !ids.has(photo.fileId) ||
        !manifest.files
          .find((file) => file.id === photo.fileId)!
          .path.endsWith(".webp")
      )
        throw new Error("A verified gallery image is required.");
    for (const document of entry.documents)
      if (
        !ids.has(document.fileId) ||
        !manifest.files
          .find((file) => file.id === document.fileId)!
          .path.endsWith(".pdf")
      )
        throw new Error("A verified blog PDF is required.");
  }
  return manifest;
}
export async function blogDetailsFiles(
  manifest: BlogDetailsManifest,
  root: string,
) {
  const checks = await verifySources(
    {
      version: manifest.version,
      files: manifest.files,
      records: [],
    } as Manifest,
    root,
  );
  if (checks.some((file) => file.status !== "verified"))
    throw new Error("Blog enrichment source verification failed.");
  const uploads = new Map<string, Upload>();
  for (const id of new Set(
    manifest.blogs.flatMap((entry) =>
      [...entry.gallery, ...entry.documents].map((item) => item.fileId),
    ),
  )) {
    const file = manifest.files.find((file) => file.id === id)!;
    const bytes = await readFile(resolve(root, file.path));
    const upload = {
      bytes,
      filename: file.path,
      mime: file.path.endsWith(".pdf") ? "application/pdf" : "image/webp",
    };
    if (bytes.length !== file.bytes || digest(bytes) !== file.sha256)
      throw new Error("Blog enrichment bytes changed.");
    await inspectUpload(upload);
    uploads.set(id, upload);
  }
  return uploads;
}
function record(manifest: BlogDetailsManifest, entry: Entry): SeedRecord {
  return {
    kind: "BlogPost",
    key: `blog-details:${entry.key}`,
    payload: entry,
    files: [
      "homepage:sources",
      ...entry.gallery.map((item) => item.fileId),
      ...entry.documents.map((item) => item.fileId),
    ],
    reviewTasks: [],
  };
}
async function actorAllowed(actorId: string, session?: mongoose.ClientSession) {
  const actor = await User.findOne({ _id: actorId, active: true }).session(
    session ?? null,
  );
  if (!actor || !can(actor.role, "content"))
    throw new Error("An active content administrator or editor is required.");
}
async function state(
  manifest: BlogDetailsManifest,
  entry: Entry,
  session?: mongoose.ClientSession,
) {
  const checkpoint = await SourceImport.findOne({
    key: record(manifest, entry).key,
  }).session(session ?? null);
  const row = await BlogPost.findById(seedId(entry.key)).session(
    session ?? null,
  );
  if (checkpoint)
    return {
      row,
      status: !row
        ? "deleted-preserved"
        : checkpoint.checksum ===
            recordChecksum(
              { version: manifest.version, files: manifest.files, records: [] },
              record(manifest, entry),
            )
          ? "already-enriched"
          : "source-changed",
    } as const;
  const original = await SourceImport.findOne({
    key: entry.key,
    entityType: "BlogPost",
    entityId: seedId(entry.key),
  }).session(session ?? null);
  if (!original) return { row, status: "unmanaged-preserved" } as const;
  if (!row) return { row, status: "deleted-preserved" } as const;
  const details = row.toObject().details ?? {};
  const populated = Object.values(details).some((value) =>
    Array.isArray(value)
      ? value.length > 0
      : typeof value === "string" && value.trim().length > 0,
  );
  if (
    row.__v !== 1 ||
    row.tags.length > 0 ||
    !!row.coverAlt ||
    row.status !== "published" ||
    row.reviewStatus !== "approved" ||
    populated ||
    row.gallery.length ||
    row.documents.length
  )
    return { row, status: "admin-preserved" } as const;
  return { row, status: "would-enrich" } as const;
}
export async function planBlogDetails(manifest: BlogDetailsManifest) {
  const results: BlogDetailsResult[] = [];
  for (const entry of manifest.blogs)
    results.push({
      key: entry.key,
      status: (await state(manifest, entry)).status,
    });
  return results;
}
// Explicit development-only enrichment of the three original published seed rows.
// Does not create missing rows, republish withdrawals, change projects, or overwrite
// existing rich admin content. Each blog commits all files and details together.
export async function applyBlogDetails(options: {
  manifest: BlogDetailsManifest;
  uploads: Map<string, Upload>;
  actorId: string;
  namespace: string;
  provider: UploadProvider;
  scanner: Scanner;
  report?: (result: BlogDetailsResult) => void;
}) {
  const { manifest, uploads, actorId, namespace, provider, scanner } = options;
  if (namespace !== "hrpf/dev")
    throw new Error("Blog enrichment is limited to hrpf/dev.");
  await actorAllowed(actorId);
  for (const [id, upload] of uploads) {
    const source = manifest.files.find((file) => file.id === id);
    if (
      !source ||
      upload.bytes.length !== source.bytes ||
      digest(upload.bytes) !== source.sha256
    )
      throw new Error("Blog enrichment bytes changed.");
    await inspectUpload(upload);
    if ((await scanner(upload.bytes)) !== "clean")
      throw new Error("A blog file failed the security scan.");
  }
  for (const entry of manifest.blogs)
    for (const item of [...entry.gallery, ...entry.documents])
      if (!uploads.has(item.fileId)) throw new Error("A blog file is missing.");
  const results: BlogDetailsResult[] = [];
  for (const entry of manifest.blogs) {
    const initial = await state(manifest, entry);
    if (initial.status !== "would-enrich" || !initial.row) {
      const result = { key: entry.key, status: initial.status };
      results.push(result);
      options.report?.(result);
      continue;
    }
    const expectedVersion = initial.row.__v,
      assetIds = new Map<string, string>();
    for (const item of [...entry.gallery, ...entry.documents]) {
      await actorAllowed(actorId);
      const upload = uploads.get(item.fileId)!,
        source = manifest.files.find((file) => file.id === item.fileId)!;
      let asset = await Asset.findOne({
        ownerId: actorId,
        entityType: "BlogPost",
        entityId: initial.row._id,
        sha256: source.sha256,
        purpose: "content",
        scanStatus: "clean",
        claimStatus: "staged",
        stagingExpiresAt: { $gt: new Date() },
      });
      if (!asset) {
        const type = await inspectUpload(upload),
          stored = await provider.store(
            upload,
            `${namespace}/content`,
            type.ext,
          );
        try {
          asset = await Asset.create({
            ...stored,
            sha256: source.sha256,
            ownerId: actorId,
            purpose: "content",
            scanStatus: "clean",
            visibility: "restricted",
            entityType: "BlogPost",
            entityId: initial.row._id,
            stagingExpiresAt: new Date(Date.now() + 86400000),
          });
        } catch (error) {
          await provider.remove(stored).catch(() => {});
          throw error;
        }
      }
      assetIds.set(item.fileId, asset.id);
    }
    const session = await mongoose.startSession();
    let result: BlogDetailsResult;
    try {
      result = await session.withTransaction(async () => {
        await Counter.findOneAndUpdate(
          { key: "security:user-governance" },
          { $inc: { sequence: 1 } },
          { session, upsert: true },
        );
        await actorAllowed(actorId, session);
        const current = await state(manifest, entry, session),
          row = current.row;
        if (current.status !== "would-enrich" || !row)
          return { key: entry.key, status: current.status };
        if (row.__v !== expectedVersion)
          return { key: entry.key, status: "version-conflict" } as const;
        row.set("details", entry.details);
        row.set("tags", entry.tags);
        if (!row.coverAlt) row.coverAlt = entry.coverAlt;
        await bindContentMedia(
          row,
          {
            gallery: entry.gallery.map((item) => ({
              assetId: assetIds.get(item.fileId)!,
              alt: item.alt,
              caption: item.caption,
            })),
            documents: entry.documents.map((item) => ({
              assetId: assetIds.get(item.fileId)!,
              label: item.label,
            })),
          },
          actorId,
          session,
          "public",
          "BlogPost",
        );
        row.__v += 1;
        await row.validate();
        const saved = await BlogPost.replaceOne(
          {
            _id: row._id,
            __v: expectedVersion,
            status: "published",
            reviewStatus: "approved",
          },
          row.toObject(),
          { session },
        );
        if (!saved.matchedCount) throw new Error("Blog changed concurrently.");
        const seedRecord = record(manifest, entry);
        await SourceImport.create(
          [
            {
              key: seedRecord.key,
              manifestVersion: manifest.version,
              checksum: recordChecksum(
                {
                  version: manifest.version,
                  files: manifest.files,
                  records: [],
                },
                seedRecord,
              ),
              entityType: "BlogPost",
              entityId: row._id,
              references: seedRecord.files.map((id) => {
                const { id: _id, ...source } = manifest.files.find(
                  (file) => file.id === id,
                )!;
                return source;
              }),
              reviewTasks: [],
            },
          ],
          { session },
        );
        await AuditLog.create(
          [
            {
              actorId,
              action: "blog-details.seed-published",
              entityType: "BlogPost",
              entityId: row.id,
              outcome: "success",
              changedFields: [
                "details",
                "tags",
                "gallery",
                "documents",
                "coverAlt",
              ],
            },
          ],
          { session },
        );
        return { key: entry.key, status: "enriched" } as const;
      });
    } finally {
      await session.endSession();
    }
    results.push(result);
    options.report?.(result);
  }
  return results;
}
export { homepageAssetRoot };
