import { bumpPublicRevision } from '../services/public-cache.js';
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import mongoose from "mongoose";
import { z } from "zod";
import {
  Asset,
  AuditLog,
  Counter,
  Project,
  SourceImport,
  User,
} from "../domain/models.js";
import { projectDetailsInput } from "../http/project-details.js";
import { can } from "../security/permissions.js";
import { digest } from "../security/crypto.js";
import { bindProjectMedia } from "../services/project-media.js";
import {
  inspectUpload,
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
      "home-project:shelter-dignity-advocacy",
      "home-project:mianwal-ranjha-sanitation",
      "home-project:childhood-vaccination-access",
    ]),
    details: projectDetailsInput,
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
    version: z.literal("project-details-v1"),
    files: z.array(sourceFileSchema),
    projects: z.array(entrySchema).length(3),
  })
  .strict();
export type ProjectDetailsManifest = z.infer<typeof manifestSchema>;
type Entry = ProjectDetailsManifest["projects"][number];
export type ProjectDetailsResult = {
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

export async function loadProjectDetailsManifest() {
  const manifest = manifestSchema.parse(
    JSON.parse(
      await readFile(
        new URL("../../seed/project-details-manifest.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  const ids = new Set(manifest.files.map((file) => file.id));
  if (
    ids.size !== manifest.files.length ||
    new Set(manifest.projects.map((entry) => entry.key)).size !== 3
  )
    throw new Error("Duplicate project enrichment identity.");
  for (const entry of manifest.projects) {
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
        throw new Error("A verified project PDF is required.");
  }
  return manifest;
}
export async function projectDetailsFiles(
  manifest: ProjectDetailsManifest,
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
    throw new Error("Project enrichment source verification failed.");
  const uploads = new Map<string, Upload>();
  for (const id of new Set(
    manifest.projects.flatMap((entry) =>
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
      throw new Error("Project enrichment bytes changed.");
    await inspectUpload(upload);
    uploads.set(id, upload);
  }
  return uploads;
}
function record(manifest: ProjectDetailsManifest, entry: Entry): SeedRecord {
  return {
    kind: "Project",
    key: `project-details:${entry.key}`,
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
  manifest: ProjectDetailsManifest,
  entry: Entry,
  session?: mongoose.ClientSession,
) {
  const checkpoint = await SourceImport.findOne({
    key: record(manifest, entry).key,
  }).session(session ?? null);
  const row = await Project.findById(seedId(entry.key)).session(
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
    entityType: "Project",
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
    row.status !== "published" ||
    row.reviewStatus !== "approved" ||
    populated ||
    row.gallery.length ||
    row.documents.length
  )
    return { row, status: "admin-preserved" } as const;
  return { row, status: "would-enrich" } as const;
}
export async function planProjectDetails(manifest: ProjectDetailsManifest) {
  const results: ProjectDetailsResult[] = [];
  for (const entry of manifest.projects)
    results.push({
      key: entry.key,
      status: (await state(manifest, entry)).status,
    });
  return results;
}
// Explicit development-only enrichment of the three original published seed rows.
// Does not create missing rows, republish withdrawals, change news, or overwrite
// existing rich admin content. Each project commits all files and details together.
export async function applyProjectDetails(options: {
  manifest: ProjectDetailsManifest;
  uploads: Map<string, Upload>;
  actorId: string;
  namespace: string;
  provider: UploadProvider;
  report?: (result: ProjectDetailsResult) => void;
}) {
  const { manifest, uploads, actorId, namespace, provider } = options;
  if (namespace !== "hrpf/dev")
    throw new Error("Project enrichment is limited to hrpf/dev.");
  await actorAllowed(actorId);
  for (const [id, upload] of uploads) {
    const source = manifest.files.find((file) => file.id === id);
    if (
      !source ||
      upload.bytes.length !== source.bytes ||
      digest(upload.bytes) !== source.sha256
    )
      throw new Error("Project enrichment bytes changed.");
    await inspectUpload(upload);

  }
  for (const entry of manifest.projects)
    for (const item of [...entry.gallery, ...entry.documents])
      if (!uploads.has(item.fileId))
        throw new Error("A project file is missing.");
  const results: ProjectDetailsResult[] = [];
  for (const entry of manifest.projects) {
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
        entityType: "Project",
        entityId: initial.row._id,
        sha256: source.sha256,
        purpose: "content",
        scanStatus: { $in: ['clean', 'type_checked'] },
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
            scanStatus: 'type_checked',
            visibility: "restricted",
            entityType: "Project",
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
    let result: ProjectDetailsResult;
    try {
      result = await session.withTransaction(async () => {
        await bumpPublicRevision(session);
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
        if (!row.coverAlt) row.coverAlt = entry.coverAlt;
        await bindProjectMedia(
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
        );
        row.__v += 1;
        await row.validate();
        const saved = await Project.replaceOne(
          {
            _id: row._id,
            __v: expectedVersion,
            status: "published",
            reviewStatus: "approved",
          },
          row.toObject(),
          { session },
        );
        if (!saved.matchedCount)
          throw new Error("Project changed concurrently.");
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
              entityType: "Project",
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
              action: "project-details.seed-published",
              entityType: "Project",
              entityId: row.id,
              outcome: "success",
              changedFields: ["details", "gallery", "documents", "coverAlt"],
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
