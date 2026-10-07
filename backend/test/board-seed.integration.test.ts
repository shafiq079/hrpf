import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import express from "express";
import request from "supertest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import {
  Asset,
  BoardMember,
  SourceImport,
  User,
  ensureIndexes,
} from "../src/domain/models.js";
import {
  applyBoardSeed,
  boardAssetRoot,
  boardFiles,
  loadBoardManifest,
  planBoardSeed,
  type BoardManifest,
} from "../src/seed/board.js";
import { importRecord } from "../src/seed/importer.js";
import { publicRouter } from "../src/http/public-content.js";
import type { UploadProvider } from "../src/services/uploads.js";
let mongo: MongoMemoryReplSet,
  manifest: BoardManifest,
  files: Map<string, Buffer>,
  actorId: string,
  uploads = 0;
const provider: UploadProvider = {
  store: async (upload, _folder, format) => ({
    publicId: "hrpf/dev/board/test-" + ++uploads,
    resourceType: "image",
    deliveryType: "authenticated",
    format,
    bytes: upload.bytes.length,
    version: 1,
  }),
  remove: async () => {},
  read: async () => new Response(new Uint8Array([1, 2, 3])),
};
const seed = (overrides: Partial<Parameters<typeof applyBoardSeed>[0]> = {}) =>
  applyBoardSeed({
    manifest,
    files,
    actorId,
    namespace: "hrpf/dev",
    provider,
    scanner: async () => "clean",
    ...overrides,
  });
describe("Supplied board and team profiles", { timeout: 120000 }, () => {
  before(async () => {
    manifest = await loadBoardManifest();
    files = await boardFiles(manifest, fileURLToPath(boardAssetRoot));
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
      dbName: "hrpf_board_test",
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
        email: "board@example.test",
        name: "Board administrator",
        passwordHash: "not-real",
        role: "admin",
        active: true,
      })
    ).id;
  });
  it("verifies all seven supplied photos, plans without writes, publishes complete profiles and reruns without uploads", async () => {
    assert.ok(
      (await planBoardSeed(manifest)).every((r) => r.status === "would-create"),
    );
    assert.equal(await SourceImport.countDocuments(), 0);
    let scans = 0;
    assert.ok(
      (
        await seed({
          scanner: async () => {
            scans++;
            assert.equal(uploads, 0);
            assert.equal(await BoardMember.countDocuments(), 0);
            return "clean";
          },
        })
      ).every((r) => r.status === "published"),
    );
    assert.equal(scans, 7);
    assert.equal(uploads, 7);
    const app = express().use("/api", publicRouter(provider));
    const board = await request(app).get("/api/board").expect(200);
    const team = await request(app).get("/api/team").expect(200);
    assert.equal(board.body.meta.total, 7);
    assert.deepEqual(
      team.body.data.map((r: any) => r.slug),
      board.body.data.map((r: any) => r.slug),
    );
    assert.equal(board.body.data[2].designation, "Joint Chairperson");
    assert.equal(board.body.data[2].slotLabel, undefined);
    const chairman = await request(app)
      .get("/api/board/muhammad-yousaf-badar")
      .expect(200);
    assert.equal(chairman.body.data.sections.length, 12);
    assert.ok(JSON.stringify(chairman.body.data).includes("Sada Ba Sehra"));
    assert.equal(chairman.body.data.photoZoom, 1.4);
    assert.ok(!JSON.stringify(chairman.body).includes("publicId"));
    await request(app).get(chairman.body.data.photo).expect(200);
    assert.ok((await seed()).every((r) => r.status === "seeded-preserved"));
    assert.equal(uploads, 7);
  });
  it("enriches untouched original drafts and preserves admin edits, withdrawal, deletion and new future profiles", async () => {
    for (const record of manifest.source.records)
      await importRecord(manifest.source, record, true);
    assert.ok(
      (await planBoardSeed(manifest)).every(
        (r) => r.status === "would-publish",
      ),
    );
    await seed();
    await BoardMember.updateOne(
      { slug: "munawar-ahmad" },
      {
        $set: { "bio.en": "Administrator revision", isActive: false },
        $inc: { __v: 1 },
      },
    );
    await BoardMember.deleteOne({ slug: "hamza-uzair-badr" });
    await BoardMember.create({
      name: "Future team member",
      slug: "future-team-member",
      designation: "New role",
      rank: 8,
      bio: { en: "Future approved biography" },
      showOnBoard: false,
      showOnTeam: true,
      isActive: true,
    });
    const results = await seed();
    assert.equal(
      results.find((r) => r.key === "board:hamza-uzair-badr")!.status,
      "deleted-preserved",
    );
    assert.equal(uploads, 7);
    assert.equal(
      (await BoardMember.findOne({ slug: "munawar-ahmad" }))!.bio!.en,
      "Administrator revision",
    );
    const app = express().use("/api", publicRouter(provider));
    assert.equal(
      (await request(app).get("/api/board").expect(200)).body.meta.total,
      5,
    );
    assert.equal(
      (await request(app).get("/api/team").expect(200)).body.meta.total,
      6,
    );
    await request(app).get("/api/board/future-team-member").expect(200);
    await request(app).get("/api/board/munawar-ahmad").expect(404);
  });
  it("preserves native slug collisions and even unversioned administrative edits to original drafts", async () => {
    await BoardMember.create({
      name: "Native profile",
      slug: "muhammad-yousaf-badar",
      designation: "Native role",
      rank: 1,
      bio: { en: "Native text" },
    });
    const original = manifest.source.records.find(
      (r) => r.key === "board:munawar-ahmad",
    )!;
    await importRecord(manifest.source, original, true);
    await BoardMember.updateOne(
      { seedKey: original.key },
      {
        $set: {
          "bio.en": "Unversioned admin edit",
          updatedAt: new Date(Date.now() + 1000),
        },
      },
    );
    const results = await seed();
    assert.equal(results[0]!.status, "conflict");
    assert.equal(results[1]!.status, "admin-preserved");
    assert.equal(uploads, 5);
    assert.equal(
      (await BoardMember.findOne({ slug: "muhammad-yousaf-badar" }))!.name,
      "Native profile",
    );
    assert.equal(
      (await BoardMember.findOne({ seedKey: original.key }))!.bio!.en,
      "Unversioned admin edit",
    );
  });
  it("rejects tampered bytes, unavailable scanners and unauthorized actors before content or provider writes", async () => {
    const changed = new Map(files);
    changed.set(manifest.releases[0]!.file.id, Buffer.from("tampered"));
    await assert.rejects(seed({ files: changed }));
    await assert.rejects(
      seed({
        scanner: async () => {
          throw new Error("Scanner unavailable");
        },
      }),
    );
    await User.updateOne({ _id: actorId }, { $set: { role: "editor" } });
    await assert.rejects(seed());
    assert.equal(uploads, 0);
    assert.equal(await BoardMember.countDocuments(), 0);
    assert.equal(await Asset.countDocuments(), 0);
    assert.equal(await SourceImport.countDocuments(), 0);
  });
  it("resumes a partial upload failure without replacing or reuploading completed profiles", async () => {
    let fail = true;
    const flaky = {
      ...provider,
      store: async (...args: Parameters<UploadProvider["store"]>) => {
        if (uploads === 3 && fail) {
          fail = false;
          throw new Error("Temporary provider failure");
        }
        return provider.store(...args);
      },
    };
    await assert.rejects(seed({ provider: flaky }));
    assert.equal(await BoardMember.countDocuments({ isActive: true }), 3);
    await seed({ provider: flaky });
    assert.equal(await BoardMember.countDocuments({ isActive: true }), 7);
    assert.equal(uploads, 7);
  });
  it("checks role changes after scans and reuses a staged photo after publication is interrupted by role loss", async () => {
    await assert.rejects(
      seed({
        scanner: async () => {
          await User.updateOne({ _id: actorId }, { $set: { role: "editor" } });
          return "clean";
        },
      }),
    );
    assert.equal(await BoardMember.countDocuments(), 0);
    assert.equal(uploads, 0);
    await User.updateOne({ _id: actorId }, { $set: { role: "admin" } });
    let changeRole = true;
    const interrupted = {
      ...provider,
      store: async (...args: Parameters<UploadProvider["store"]>) => {
        const result = await provider.store(...args);
        if (changeRole) {
          changeRole = false;
          await User.updateOne({ _id: actorId }, { $set: { role: "editor" } });
        }
        return result;
      },
    };
    await assert.rejects(seed({ provider: interrupted }));
    assert.equal(uploads, 1);
    assert.equal(await Asset.countDocuments({ claimStatus: "staged" }), 1);
    await User.updateOne({ _id: actorId }, { $set: { role: "admin" } });
    await seed({ provider: interrupted });
    assert.equal(uploads, 7);
  });
});
