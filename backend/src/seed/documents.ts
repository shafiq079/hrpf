import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import mongoose from "mongoose";
import { z } from "zod";
import {
  Asset,
  AuditLog,
  Counter,
  SourceImport,
  User,
} from "../domain/models.js";
import { can } from "../security/permissions.js";
import { digest } from "../security/crypto.js";
import {
  inspectUpload,
  type UploadProvider,
} from "../services/uploads.js";
import { bindDocumentFile } from "../services/document-media.js";
import { reportInput, certificateInput } from "../http/document-content.js";
import { verifySources } from "./files.js";
import { importRecord, type SeedResult } from "./importer.js";
import {
  loadManifest,
  sourceFileSchema,
  recordChecksum,
  seedId,
  seedModels,
  type Manifest,
  type SeedRecord,
} from "./manifest.js";

export const documentAssetRoot = new URL(
  "../../seed/document-assets/",
  import.meta.url,
);
const releaseSchema = z
  .object({
    version: z.literal("document-public-v1"),
    releases: z
      .array(
        z
          .object({
            key: z.string(),
            file: sourceFileSchema,
            fields: z.record(z.string(), z.unknown()),
          })
          .strict(),
      )
      .length(7),
  })
  .strict();
export type DocumentManifest = Awaited<ReturnType<typeof loadDocumentManifest>>;
export async function loadDocumentManifest() {
  const original = await loadManifest();
  const records = original.records.filter(
    (r) => r.kind === "Report" || r.kind === "Certificate",
  );
  const source: Manifest = {
    ...original,
    records,
    files: original.files.filter((f) =>
      records.some((r) => r.files.includes(f.id)),
    ),
  };
  const release = releaseSchema.parse(
    JSON.parse(
      await readFile(
        new URL("../../seed/document-releases.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  if (
    new Set(release.releases.map((r) => r.key)).size !== 7 ||
    release.releases.some((r) => !records.some((s) => s.key === r.key))
  )
    throw new Error("Invalid document release mapping.");
  const releases = release.releases.map((r) => {
    const record = records.find((s) => s.key === r.key)!;
    const fields = (
      record.kind === "Report" ? reportInput : certificateInput
    ).parse(r.fields);
    return { ...r, fields };
  });
  return { source, version: release.version, releases };
}
export async function documentFiles(manifest: DocumentManifest, root: string) {
  const files = manifest.releases.map((r) => r.file);
  if (
    (await verifySources({ ...manifest.source, files }, root)).some(
      (f) => f.status !== "verified",
    )
  )
    throw new Error("Public document verification failed.");
  const result = new Map<string, Buffer>();
  for (const file of files) {
    const bytes = await readFile(resolve(root, file.path));
    await inspectUpload({
      bytes,
      filename: file.path,
      mime: file.path.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
    });
    result.set(file.id, bytes);
  }
  return result;
}
const checkpointKey = (r: SeedRecord) => `document-public:${r.key}`;
function checksum(manifest: DocumentManifest, record: SeedRecord) {
  return digest(
    Buffer.from(
      JSON.stringify({
        source: recordChecksum(manifest.source, record),
        release: manifest.releases.find((r) => r.key === record.key),
      }),
    ),
  );
}
const modelFor = (record: SeedRecord) =>
  seedModels[record.kind] as mongoose.Model<any>;
async function actorAllowed(actorId: string, session?: mongoose.ClientSession) {
  const actor = await User.findOne({ _id: actorId, active: true }).session(
    session ?? null,
  );
  if (!actor || !can(actor.role, "content") || !can(actor.role, "certificates"))
    throw new Error(
      "An active administrator is required for report and certificate imports.",
    );
}
async function candidate(
  manifest: DocumentManifest,
  record: SeedRecord,
  session?: mongoose.ClientSession,
) {
  const imported = await SourceImport.findOne({
    key: record.key,
    checksum: recordChecksum(manifest.source, record),
    entityType: record.kind,
    entityId: seedId(record.key),
  }).session(session ?? null);
  if (!imported) return null;
  const field = record.kind === "Report" ? "publicPdf" : "publicFile";
  const row = await modelFor(record)
    .findOne({
      _id: imported.entityId,
      __v: 0,
      releaseReview: "pending",
      publishedAt: null,
      [field]: null,
    })
    .session(session ?? null);
  return row && row.createdAt.getTime() === row.updatedAt.getTime()
    ? row
    : null;
}
export type DocumentSeedResult =
  | SeedResult
  | {
      key: string;
      status:
        | "published"
        | "admin-preserved"
        | "seeded-preserved"
        | "would-publish";
    };
async function checkpoint(
  manifest: DocumentManifest,
  record: SeedRecord,
): Promise<DocumentSeedResult | undefined> {
  const prior = await SourceImport.findOne({ key: checkpointKey(record) });
  if (!prior) return;
  if (
    prior.entityType !== record.kind ||
    prior.entityId.toString() !== seedId(record.key).toString()
  )
    return { key: record.key, status: "conflict" };
  return {
    key: record.key,
    status: !(await modelFor(record).exists({ _id: prior.entityId }))
      ? "deleted-preserved"
      : prior.checksum === checksum(manifest, record)
        ? "seeded-preserved"
        : "source-changed",
  };
}
export async function planDocumentSeed(
  manifest: DocumentManifest,
): Promise<DocumentSeedResult[]> {
  const results: DocumentSeedResult[] = [];
  for (const record of manifest.source.records) {
    const prior = await checkpoint(manifest, record);
    if (prior) {
      results.push(prior);
      continue;
    }
    const imported = await importRecord(manifest.source, record, false);
    results.push(
      imported.status === "preserved"
        ? {
            key: record.key,
            status: (await candidate(manifest, record))
              ? "would-publish"
              : "admin-preserved",
          }
        : imported,
    );
  }
  return results;
}
export async function applyDocumentSeed(options: {
  manifest: DocumentManifest;
  files: Map<string, Buffer>;
  actorId: string;
  namespace: string;
  provider: UploadProvider;
  report?: (result: DocumentSeedResult) => void;
  phase?: (phase: string) => void;
}) {
  const { manifest, files, actorId, namespace, provider } = options;
  if (namespace !== "hrpf/dev")
    throw new Error("Document setup is limited to hrpf/dev.");
  await actorAllowed(actorId);
  options.phase?.("validate");
  // Inspect every release before any external storage or content writes.
  for (const release of manifest.releases) {
    const bytes = files.get(release.file.id);
    if (
      !bytes ||
      bytes.length !== release.file.bytes ||
      digest(bytes) !== release.file.sha256
    )
      throw new Error("A verified public copy is missing.");
    await inspectUpload({
      bytes,
      filename: release.file.path,
      mime: release.file.path.endsWith(".pdf")
        ? "application/pdf"
        : "image/jpeg",
    });
  }
  const results: DocumentSeedResult[] = [];
  for (const record of manifest.source.records) {
    options.phase?.("database");
    await actorAllowed(actorId);
    let result = await checkpoint(manifest, record);
    if (!result) {
      const imported = await importRecord(manifest.source, record, true);
      if (!["created", "preserved"].includes(imported.status))
        result = imported;
      else if (!(await candidate(manifest, record)))
        result = { key: record.key, status: "admin-preserved" };
      else {
        const release = manifest.releases.find((r) => r.key === record.key)!;
        const purpose = record.kind === "Report" ? "content" : "certificate";
        await actorAllowed(actorId);
        let asset = await Asset.findOne({
          ownerId: actorId,
          entityType: record.kind,
          entityId: seedId(record.key),
          sha256: release.file.sha256,
          purpose,
          scanStatus: { $in: ['clean', 'type_checked'] },
          claimStatus: "staged",
          stagingExpiresAt: { $gt: new Date() },
        });
        if (!asset) {
          options.phase?.("upload");
          const stored = await provider.store(
            {
              bytes: files.get(release.file.id)!,
              filename: release.file.path,
              mime: release.file.path.endsWith(".pdf")
                ? "application/pdf"
                : "image/jpeg",
            },
            `${namespace}/${purpose}`,
            release.file.path.endsWith(".pdf") ? "pdf" : "jpg",
          );
          try {
            asset = await Asset.create({
              ...stored,
              sha256: release.file.sha256,
              ownerId: actorId,
              purpose,
              visibility: "restricted",
              scanStatus: 'type_checked',
              entityType: record.kind,
              entityId: seedId(record.key),
              stagingExpiresAt: new Date(Date.now() + 86400000),
            });
          } catch (error) {
            await provider.remove(stored).catch(() => {});
            throw error;
          }
        }
        options.phase?.("publication");
        const session = await mongoose.startSession();
        try {
          result = await session.withTransaction(
            async (): Promise<DocumentSeedResult> => {
              await Counter.findOneAndUpdate(
                { key: "security:user-governance" },
                { $inc: { sequence: 1 } },
                { session, upsert: true },
              );
              await actorAllowed(actorId, session);
              const row = await candidate(manifest, record, session);
              if (
                !row ||
                (await SourceImport.exists({
                  key: checkpointKey(record),
                }).session(session))
              )
                return { key: record.key, status: "admin-preserved" };
              const { assetId: _assetId, ...fields } = release.fields;
              row.set(fields);
              await bindDocumentFile(
                row,
                asset!.id,
                actorId,
                session,
                "public",
                record.kind as "Report" | "Certificate",
              );
              row.releaseReview = "approved";
              row.publishedAt = new Date();
              row.__v = 1;
              await row.validate();
              const changed = await modelFor(record).replaceOne(
                { _id: row._id, __v: 0 },
                row.toObject(),
                { session },
              );
              if (!changed.matchedCount)
                throw new Error("Document changed concurrently.");
              await SourceImport.create(
                [
                  {
                    key: checkpointKey(record),
                    checksum: checksum(manifest, record),
                    manifestVersion: manifest.version,
                    entityType: record.kind,
                    entityId: row._id,
                    references: [
                      release.file,
                      ...record.files.map(
                        (id) => manifest.source.files.find((f) => f.id === id)!,
                      ),
                    ].map(({ id: _id, ...file }) => file),
                    reviewTasks: [],
                  },
                ],
                { session },
              );
              await AuditLog.create(
                [
                  {
                    actorId,
                    action: "documents.seed-published",
                    entityType: record.kind,
                    entityId: row.id,
                    outcome: "success",
                    changedFields: ["publicFile", "publication", "releaseNote"],
                  },
                ],
                { session },
              );
              return { key: record.key, status: "published" };
            },
          );
        } finally {
          await session.endSession();
        }
      }
    }
    results.push(result!);
    options.report?.(result!);
  }
  return results;
}
