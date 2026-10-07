import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import express from "express";
import request from "supertest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import {
  Asset,
  Report,
  Certificate,
  SourceImport,
  User,
  ensureIndexes,
} from "../src/domain/models.js";
import {
  applyDocumentSeed,
  documentAssetRoot,
  documentFiles,
  loadDocumentManifest,
  planDocumentSeed,
  type DocumentManifest,
} from "../src/seed/documents.js";
import { importRecord } from "../src/seed/importer.js";
import { seedId } from "../src/seed/manifest.js";
import { publicRouter } from "../src/http/public-content.js";
import type { UploadProvider } from "../src/services/uploads.js";

let mongo: MongoMemoryReplSet,
  manifest: DocumentManifest,
  files: Map<string, Buffer>,
  actorId: string,
  uploads = 0;
const provider: UploadProvider = {
  store: async (upload, _folder, format) => ({
    publicId: `hrpf/dev/documents/test-${++uploads}`,
    resourceType: format === "pdf" ? "raw" : "image",
    deliveryType: "authenticated",
    format,
    bytes: upload.bytes.length,
    version: 1,
  }),
  remove: async () => {},
  read: async () => new Response(new Uint8Array([1, 2, 3])),
};
const seed = (
  overrides: Partial<Parameters<typeof applyDocumentSeed>[0]> = {},
) =>
  applyDocumentSeed({
    manifest,
    files,
    actorId,
    namespace: "hrpf/dev",
    provider,
    ...overrides,
  });
describe("Reviewed document import", { timeout: 120000 }, () => {
  before(async () => {
    manifest = await loadDocumentManifest();
    files = await documentFiles(manifest, fileURLToPath(documentAssetRoot));
    mongo = await MongoMemoryReplSet.create({
      binary: { version: "8.0.5" },
      replSet: { count: 1 },
      instanceOpts: [
        {
          args: [
            "--nounixsocket",
            "--setParameter",
            "diagnosticDataCollectionEnabled=false",
          ],
        },
      ],
    });
    await mongoose.connect(mongo.getUri(), {
      dbName: "hrpf_documents_test",
      autoIndex: false,
      autoCreate: false,
    });
    await ensureIndexes();
  });
  after(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });
  beforeEach(async () => {
    for (const model of Object.values(mongoose.models))
      await model.deleteMany({});
    uploads = 0;
    actorId = (
      await User.create({
        email: "documents@example.test",
        name: "Document administrator",
        passwordHash: "not-real",
        role: "admin",
        active: true,
      })
    ).id;
  });
  it("plans without writes, publishes three labelled editions and four distinct scans, and reruns without uploads", async () => {
    assert.ok(
      (await planDocumentSeed(manifest)).every(
        (r) => r.status === "would-create",
      ),
    );
    assert.equal(await SourceImport.countDocuments(), 0);
    assert.ok((await seed()).every((r) => r.status === "published"));
    assert.equal(uploads, 7);
    const app = express().use("/api", publicRouter(provider));
    const reports = await request(app).get("/api/reports").expect(200);
    assert.equal(reports.body.meta.total, 3);
    for (const r of reports.body.data) {
      assert.equal(r.edition, "public-edition");
      assert.ok(r.releaseNote);
      assert.equal(r.format, "pdf");
      assert.equal(r.coverageStart, undefined);
      assert.ok(r.view.endsWith("/view"));
    }
    assert.deepEqual(
      reports.body.data.map((r: any) => r.pages),
      [26, 19, 15],
    );
    const certificates = await request(app)
      .get("/api/certificates")
      .expect(200);
    assert.equal(certificates.body.meta.total, 4);
    assert.equal(
      certificates.body.data.find((r: any) => r.title.includes("2024–2026"))
        .expiresAt,
      "2026-01-22T00:00:00.000Z",
    );
    assert.equal(
      certificates.body.data.find((r: any) => r.title.includes("evaluation"))
        .reference,
      "",
    );
    assert.ok(!JSON.stringify(reports.body).includes("publicId"));
    assert.ok(!JSON.stringify(certificates.body).includes("original"));
    assert.ok((await seed()).every((r) => r.status === "seeded-preserved"));
    assert.equal(uploads, 7);
  });
  it("preserves administrator edits, withdrawal, native records and deleted imports", async () => {
    await seed();
    const report = await Report.findOne({ seedKey: "report:2025" });
    await Report.updateOne(
      { _id: report!._id },
      {
        $set: { "summary.en": "Administrator edit", releaseReview: "pending" },
        $unset: { publishedAt: 1 },
        $inc: { __v: 1 },
      },
    );
    await Certificate.deleteOne({ seedKey: "certificate:pcp-npo-evaluation" });
    await Report.create({
      title: { en: "New report" },
      slug: "future-report",
      year: 2028,
      releaseReview: "pending",
    });
    const results = await seed();
    assert.equal(
      results.find((r) => r.key === "certificate:pcp-npo-evaluation")?.status,
      "deleted-preserved",
    );
    assert.equal(
      (await Report.findById(report!._id))!.summary!.en,
      "Administrator edit",
    );
    assert.equal(await Report.countDocuments(), 4);
    assert.equal(await Certificate.countDocuments(), 3);
    assert.equal(uploads, 7);
  });
  it("enriches untouched original source drafts and preserves edited and deleted source drafts", async () => {
    for (const record of manifest.source.records)
      await importRecord(manifest.source, record, true);
    await Report.updateOne(
      { seedKey: "report:2024" },
      { $set: { "summary.en": "Edited source report" }, $inc: { __v: 1 } },
    );
    await Report.deleteOne({ seedKey: "report:2023" });
    const results = await seed();
    assert.equal(
      results.find((r) => r.key === "report:2024")?.status,
      "admin-preserved",
    );
    assert.equal(
      results.find((r) => r.key === "report:2023")?.status,
      "deleted-preserved",
    );
    assert.equal(uploads, 5);
    assert.equal(
      (await Report.findOne({ seedKey: "report:2024" }))!.summary!.en,
      "Edited source report",
    );
  });
  it("inspects the complete batch before writes and refuses corrupted bytes and non-admin actors", async () => {
    const corrupted = new Map(files);
    corrupted.set(manifest.releases.at(-1)!.file.id, Buffer.from("corrupted"));
    await assert.rejects(seed({ files: corrupted }));
    await User.updateOne({ _id: actorId }, { $set: { role: "editor" } });
    await assert.rejects(seed());
    assert.equal(await Report.countDocuments(), 0);
    assert.equal(uploads, 0);
  });
  it("resumes after provider failure and does not republish completed records", async () => {
    let attempt = 0;
    await assert.rejects(
      seed({
        provider: {
          ...provider,
          store: async (...args) => {
            if (++attempt === 3) throw new Error("Provider unavailable");
            return provider.store(...args);
          },
        },
      }),
    );
    assert.equal(uploads, 2);
    const results = await seed();
    assert.equal(
      results.filter((r) => r.status === "seeded-preserved").length,
      2,
    );
    assert.equal(results.filter((r) => r.status === "published").length, 5);
    assert.equal(uploads, 7);
  });
  it("detects inconsistent publication checkpoints", async () => {
    await seed();
    await SourceImport.updateOne(
      { key: "document-public:report:2025" },
      { $set: { entityId: seedId("wrong-report") } },
    );
    assert.equal(
      (await planDocumentSeed(manifest)).find((r) => r.key === "report:2025")
        ?.status,
      "conflict",
    );
    assert.equal(
      (await seed()).find((r) => r.key === "report:2025")?.status,
      "conflict",
    );
    assert.equal(uploads, 7);
    assert.equal(await Asset.countDocuments({ visibility: "public" }), 7);
  });
  it("preserves native slug collisions and reuses a staged copy after interrupted publication", async () => {
    const native = await Report.create({
      title: { en: "Administrator report" },
      slug: "progress-report-2025",
      year: 2025,
    });
    const result = await seed();
    assert.equal(
      result.find((r) => r.key === "report:2025")?.status,
      "conflict",
    );
    assert.equal(
      (await Report.findById(native._id))!.title.en,
      "Administrator report",
    );
    assert.equal(await SourceImport.countDocuments({ key: "report:2025" }), 0);
    await Report.deleteOne({ _id: native._id });
    let revoked = false;
    await assert.rejects(
      seed({
        provider: {
          ...provider,
          store: async (...args) => {
            const stored = await provider.store(...args);
            if (!revoked) {
              revoked = true;
              await User.updateOne(
                { _id: actorId },
                { $set: { active: false } },
              );
            }
            return stored;
          },
        },
      }),
    );
    const beforeRetry = uploads;
    assert.equal(
      await Asset.countDocuments({
        claimStatus: "staged",
        visibility: "restricted",
      }),
      1,
    );
    await User.updateOne({ _id: actorId }, { $set: { active: true } });
    assert.equal(
      (await seed()).find((r) => r.key === "report:2025")?.status,
      "published",
    );
    assert.equal(uploads, beforeRetry);
    assert.equal(await Asset.countDocuments({ visibility: "public" }), 7);
  });
});
