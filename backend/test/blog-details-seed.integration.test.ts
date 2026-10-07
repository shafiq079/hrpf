import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import express from "express";
import request from "supertest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import {
  Asset,
  AuditLog,
  BlogPost,
  Project,
  SourceImport,
  User,
  ensureIndexes,
} from "../src/domain/models.js";
import {
  applyHomepageSeed,
  homepageFiles,
  loadHomepageManifest,
} from "../src/seed/homepage.js";
import {
  applyBlogDetails,
  homepageAssetRoot,
  loadBlogDetailsManifest,
  planBlogDetails,
  blogDetailsFiles,
  type BlogDetailsManifest,
} from "../src/seed/blog-details.js";
import { publicRouter } from "../src/http/public-content.js";
import type { Upload, UploadProvider } from "../src/services/uploads.js";
let mongo: MongoMemoryReplSet,
  manifest: BlogDetailsManifest,
  uploads: Map<string, Upload>,
  actorId: string,
  stores = 0;
const provider: UploadProvider = {
  store: async (upload, _folder, format) => ({
    publicId: `hrpf/dev/content/test-${++stores}`,
    resourceType: format === "pdf" ? "raw" : "image",
    deliveryType: "authenticated",
    format,
    bytes: upload.bytes.length,
    version: 1,
  }),
  remove: async () => {},
  read: async () => new Response(new Uint8Array([1, 2, 3])),
};
const enrich = () =>
  applyBlogDetails({
    manifest,
    uploads,
    actorId,
    namespace: "hrpf/dev",
    provider,
  });
describe(
  "Published homepage blog detail enrichment",
  { timeout: 120000 },
  () => {
    before(async () => {
      manifest = await loadBlogDetailsManifest();
      uploads = await blogDetailsFiles(
        manifest,
        fileURLToPath(homepageAssetRoot),
      );
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
        dbName: "hrpf_blog_enrichment_test",
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
      stores = 0;
      actorId = (
        await User.create({
          email: "seed@example.test",
          name: "Test editor",
          passwordHash: "not-a-real-password",
          role: "editor",
          active: true,
        })
      ).id;
      const home = await loadHomepageManifest(),
        files = await homepageFiles(home, fileURLToPath(homepageAssetRoot));
      await applyHomepageSeed({
        manifest: home,
        files,
        actorId,
        namespace: "hrpf/dev",
        provider,
      });
    });
    it("enriches the three original blogs atomically with public gallery and PDFs and leaves projects/identity intact", async () => {
      const original = await BlogPost.find().lean(),
        projects = await Project.find().lean();
      const plan = await planBlogDetails(manifest);
      assert.ok(plan.every((row) => row.status === "would-enrich"));
      assert.equal(stores, 6);
      const results = await enrich();
      assert.ok(results.every((row) => row.status === "enriched"));
      assert.equal(stores, 15);
      const app = express().use("/api", publicRouter(provider));
      for (const old of original) {
        const row = await BlogPost.findById(old._id);
        assert.equal(row!.slug, old.slug);
        assert.equal(String(row!.cover!.assetId), String(old.cover!.assetId));
        assert.equal(row!.__v, 2);
        assert.equal(row!.publishedAt!.getTime(), old.publishedAt!.getTime());
        assert.equal(row!.gallery.length, 2);
        assert.equal(row!.documents.length, 1);
        assert.equal(row!.details!.sections.length, 4);
        assert.ok(row!.details!.intro!.length > 300);
        const detail = await request(app)
          .get("/api/blogs/" + old.slug)
          .expect(200);
        assert.equal(detail.body.data.gallery.length, 2);
        assert.equal(detail.body.data.documents.length, 1);
        for (const photo of detail.body.data.gallery)
          await request(app).get(photo.image).expect(200);
        await request(app).get(detail.body.data.documents[0].file).expect(200);
      }
      assert.deepEqual(await Project.find().lean(), projects);
      assert.equal(
        await AuditLog.countDocuments({
          action: "blog-details.seed-published",
          actorId,
        }),
        3,
      );
    });
    it("reruns are idempotent and preserve later admin changes and withdrawals", async () => {
      await enrich();
      const row = await BlogPost.findOne({
        slug: "human-trafficking-awareness",
      });
      await BlogPost.updateOne(
        { _id: row!._id },
        {
          $set: {
            "details.intro": "Admin revised content",
            status: "draft",
          },
          $inc: { __v: 1 },
        },
      );
      const count = await AuditLog.countDocuments();
      assert.ok(
        (await enrich()).every((row) => row.status === "already-enriched"),
      );
      assert.equal(stores, 15);
      assert.equal(await AuditLog.countDocuments(), count);
      assert.equal(
        (await BlogPost.findById(row!._id))!.details!.intro,
        "Admin revised content",
      );
      assert.equal((await BlogPost.findById(row!._id))!.status, "draft");
    });
    it("does not recreate deleted rows, republish withdrawn content or overwrite rich admin content", async () => {
      const rows = await BlogPost.find().sort({ slug: 1 });
      await BlogPost.deleteOne({ _id: rows[0]!._id });
      await BlogPost.updateOne(
        { _id: rows[1]!._id },
        { $set: { status: "draft", reviewStatus: "pending" } },
      );
      await BlogPost.updateOne(
        { _id: rows[2]!._id },
        { $set: { "details.intro": "Existing admin story" } },
      );
      const results = await enrich();
      assert.equal(
        results.filter((row) => row.status === "deleted-preserved").length,
        1,
      );
      assert.equal(
        results.filter((row) => row.status === "admin-preserved").length,
        2,
      );
      assert.equal(stores, 6);
      assert.equal(
        await SourceImport.countDocuments({ key: /^blog-details:/ }),
        0,
      );
    });
    it("preserves a republished administrator revision before the first enrichment", async () => {
      const row = await BlogPost.findOne({
        slug: "school-accountability-mianwal-ranjha",
      });
      await BlogPost.updateOne(
        { _id: row!._id },
        {
          $set: { "title.en": "Reviewed administrator title" },
          $inc: { __v: 2 },
        },
      );
      assert.equal(
        (await planBlogDetails(manifest))[0]!.status,
        "admin-preserved",
      );
      const result = await enrich();
      assert.equal(result[0]!.status, "admin-preserved");
      assert.equal(
        (await BlogPost.findById(row!._id))!.title!.en,
        "Reviewed administrator title",
      );
      assert.equal((await BlogPost.findById(row!._id))!.gallery.length, 0);
      assert.equal(stores, 12);
    });
    it("rejects corrupt bytes and unauthorized actors before uploads or detail writes", async () => {
      const id = manifest.blogs[0]!.gallery[0]!.fileId,
        original = uploads.get(id)!;
      uploads.set(id, { ...original, bytes: Buffer.from("corrupt") });
      try {
        await assert.rejects(enrich());
      } finally {
        uploads.set(id, original);
      }
      await User.updateOne(
        { _id: actorId },
        { $set: { role: "case_manager" } },
      );
      await assert.rejects(enrich());
      assert.equal(stores, 6);
      assert.equal(
        await SourceImport.countDocuments({ key: /^blog-details:/ }),
        0,
      );
      assert.equal(
        await BlogPost.countDocuments({ "details.intro": { $exists: true } }),
        0,
      );
    });
    it("recovers staged uploads after interruption without double upload or partial publication", async () => {
      const store = provider.store;
      let interrupted = true;
      provider.store = async (...args) => {
        if (interrupted && stores === 7) throw new Error("interrupted");
        return store(...args);
      };
      try {
        await assert.rejects(enrich());
        assert.equal(
          await SourceImport.countDocuments({ key: /^blog-details:/ }),
          0,
        );
        assert.equal(
          await Asset.countDocuments({
            claimStatus: "staged",
            visibility: "restricted",
          }),
          1,
        );
        interrupted = false;
        await enrich();
        assert.equal(stores, 15);
      } finally {
        provider.store = store;
      }
    });
    it("rechecks actor revocation and publishes no new files until an authorized retry", async () => {
      const store = provider.store;
      provider.store = async (...args) => {
        const result = await store(...args);
        await User.updateOne({ _id: actorId }, { $set: { active: false } });
        return result;
      };
      try {
        await assert.rejects(enrich());
        assert.equal(await Asset.countDocuments({ visibility: "public" }), 6);
        assert.equal(
          await SourceImport.countDocuments({ key: /^blog-details:/ }),
          0,
        );
        provider.store = store;
        await User.updateOne({ _id: actorId }, { $set: { active: true } });
        await enrich();
        assert.equal(stores, 15);
      } finally {
        provider.store = store;
      }
    });
    it("does not overwrite a concurrent admin edit and detects changed enrichment sources", async () => {
      const store = provider.store;
      let edit = true;
      provider.store = async (...args) => {
        const result = await store(...args);
        if (edit) {
          edit = false;
          await BlogPost.updateOne(
            { slug: "school-accountability-mianwal-ranjha" },
            { $set: { "title.en": "Administrator title" }, $inc: { __v: 1 } },
          );
        }
        return result;
      };
      try {
        const results = await enrich();
        assert.equal(results[0]!.status, "admin-preserved");
        assert.equal(
          (await BlogPost.findOne({
            slug: "school-accountability-mianwal-ranjha",
          }))!.title!.en,
          "Administrator title",
        );
        await enrich();
        assert.equal(stores, 15);
      } finally {
        provider.store = store;
      }
      const changed = structuredClone(manifest);
      changed.blogs[1]!.details.intro = "Changed source text";
      assert.equal(
        (await planBlogDetails(changed))[1]!.status,
        "source-changed",
      );
    });
  },
);
