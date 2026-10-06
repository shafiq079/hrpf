import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import express from 'express';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Asset, AuditLog, GalleryItem, SourceImport, User, ensureIndexes } from '../src/domain/models.js';
import { applyGallerySeed, galleryAssetRoot, galleryFiles, loadGalleryManifest, planGallerySeed } from '../src/seed/gallery.js';
import { importRecord } from '../src/seed/importer.js';
import { loadManifest, recordChecksum, seedId, type Manifest } from '../src/seed/manifest.js';
import { publicRouter } from '../src/http/public-content.js';
import type { UploadProvider } from '../src/services/uploads.js';
let mongo: MongoMemoryReplSet,
  manifest: Manifest,
  files: Map<string, Buffer>,
  actorId: string,
  uploads = 0;
const provider: UploadProvider = {
  store: async upload => ({
    publicId: `hrpf/dev/content/gallery-test-${++uploads}`,
    resourceType: 'image',
    deliveryType: 'authenticated',
    format: 'webp',
    bytes: upload.bytes.length,
    version: 1
  }),
  remove: async () => {},
  read: async () => new Response(new Uint8Array([1, 2, 3]))
};
const seed = () => applyGallerySeed({
  manifest,
  files,
  actorId,
  namespace: 'hrpf/dev',
  provider,
  scanner: async () => 'clean'
});
describe('Gallery archive import and preview compatibility', {
  timeout: 120000
}, () => {
  before(async () => {
    manifest = await loadGalleryManifest('preview');
    files = await galleryFiles(manifest, fileURLToPath(galleryAssetRoot));
    mongo = await MongoMemoryReplSet.create({
      binary: {
        version: '8.0.5'
      },
      replSet: {
        count: 1
      },
      instanceOpts: [{
        args: ['--nounixsocket', '--setParameter', 'diagnosticDataCollectionEnabled=false']
      }]
    });
    await mongoose.connect(mongo.getUri(), {
      dbName: 'hrpf_gallery_seed_test',
      autoIndex: false,
      autoCreate: false
    });
    await ensureIndexes();
  });
  after(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });
  beforeEach(async () => {
    for (const model of Object.values(mongoose.models)) await model.deleteMany({});
    uploads = 0;
    actorId = (await User.create({
      email: 'gallery-seed@example.test',
      name: 'Test editor',
      passwordHash: 'not-real',
      role: 'editor',
      active: true
    })).id;
  });
  it('publishes verified source images with context and private provider metadata, then reruns without duplicate uploads', async () => {
    assert.ok((await planGallerySeed(manifest)).every(row => row.status === 'would-create'));
    assert.equal(await SourceImport.countDocuments(), 0);
    assert.ok((await seed()).every(row => row.status === 'published'));
    assert.equal(uploads, 4);
    assert.equal(await GalleryItem.countDocuments(), 4);
    const app = express().use('/api', publicRouter(provider));
    const press = await request(app).get('/api/gallery?category=media-coverage').expect(200);
    assert.equal(press.body.meta.total, 1);
    assert.equal(press.body.data[0].sourceName, 'Daily Awami Forum, Karachi');
    assert.ok(!JSON.stringify(press.body).includes('sourceFilename'));
    assert.ok(!JSON.stringify(press.body).includes('publicId'));
    assert.equal(press.body.data[0].eventDate, undefined);
    await request(app).get(press.body.data[0].file).expect(200);
    assert.equal((await request(app).get('/api/gallery?category=in-action')).body.meta.total, 3);
    const audits = await AuditLog.countDocuments();
    assert.ok((await seed()).every(row => row.status === 'seeded-preserved'));
    assert.equal(uploads, 4);
    assert.equal(await AuditLog.countDocuments(), audits);
  });
  it('enriches original imported drafts and preserves admin edits, withdrawals and deletions', async () => {
    for (const record of manifest.records) await importRecord(manifest, record, true);
    assert.ok((await planGallerySeed(manifest)).every(row => row.status === 'would-publish'));
    await seed();
    const rows = await GalleryItem.find().sort({
      _id: 1
    });
    await GalleryItem.updateOne({
      _id: rows[0]!._id
    }, {
      $set: {
        title: {
          en: 'Admin edited title'
        }
      },
      $inc: {
        __v: 1
      }
    });
    await GalleryItem.updateOne({
      _id: rows[1]!._id
    }, {
      $unset: {
        publishedAt: 1
      },
      $set: {
        reviewStatus: 'pending'
      },
      $inc: {
        __v: 1
      }
    });
    await Asset.updateMany({
      entityId: rows[1]!._id
    }, {
      $set: {
        visibility: 'restricted'
      }
    });
    await GalleryItem.deleteOne({
      _id: rows[2]!._id
    });
    await seed();
    assert.equal((await GalleryItem.findById(rows[0]!._id))!.title!.en, 'Admin edited title');
    assert.equal((await GalleryItem.findById(rows[1]!._id))!.publishedAt, undefined);
    assert.equal(await GalleryItem.findById(rows[2]!._id), null);
    assert.equal(uploads, 4);
  });
  it('preserves modified, deleted and unmanaged archive records before enrichment', async () => {
    const [one, two, three] = manifest.records;
    await importRecord(manifest, one!, true);
    await GalleryItem.updateOne({
      _id: seedId(one!.key)
    }, {
      $set: {
        title: {
          en: 'Admin original draft'
        },
        __v: 1
      }
    });
    await importRecord(manifest, two!, true);
    await GalleryItem.deleteOne({
      _id: seedId(two!.key)
    });
    await GalleryItem.create({
      ...three!.payload,
      title: {
        en: 'Unmanaged draft'
      }
    });
    const results = await seed();
    assert.equal(results.find(row => row.key === one!.key)!.status, 'admin-preserved');
    assert.equal(results.find(row => row.key === two!.key)!.status, 'deleted-preserved');
    assert.equal(results.find(row => row.key === three!.key)!.status, 'unmanaged-preserved');
    assert.equal(uploads, 1);
  });
  it('fails scans, changed bytes and invalid actors before any draft or provider write', async () => {
    await assert.rejects(applyGallerySeed({
      manifest,
      files,
      actorId,
      namespace: 'hrpf/dev',
      provider,
      scanner: async () => 'infected'
    }));
    assert.equal(await GalleryItem.countDocuments(), 0);
    assert.equal(uploads, 0);
    const key = files.keys().next().value!;
    const original = files.get(key)!;
    files.set(key, Buffer.from('changed'));
    try {
      await assert.rejects(seed());
      assert.equal(await SourceImport.countDocuments(), 0);
    } finally {
      files.set(key, original);
    }
    await User.updateOne({
      _id: actorId
    }, {
      $set: {
        active: false
      }
    });
    await assert.rejects(seed());
    assert.equal(uploads, 0);
  });
  it('recovers the existing staged image after actor revocation interrupts publication', async () => {
    const store = provider.store;
    provider.store = async (...args) => {
      const result = await store(...args);
      await User.updateOne({
        _id: actorId
      }, {
        $set: {
          active: false
        }
      });
      return result;
    };
    try {
      await assert.rejects(seed());
      assert.equal(await Asset.countDocuments({
        visibility: 'public'
      }), 0);
      assert.equal(uploads, 1);
      provider.store = store;
      await User.updateOne({
        _id: actorId
      }, {
        $set: {
          active: true
        }
      });
      await seed();
      assert.equal(uploads, 4);
      assert.equal(await GalleryItem.countDocuments({
        reviewStatus: 'approved'
      }), 4);
    } finally {
      provider.store = store;
    }
  });
  it('rechecks an admin edit made during upload and never releases the changed record', async () => {
    const store = provider.store;
    let edited = false;
    provider.store = async (...args) => {
      const result = await store(...args);
      if (!edited) {
        edited = true;
        await GalleryItem.updateOne({
          _id: seedId(manifest.records[0]!.key)
        }, {
          $set: {
            title: {
              en: 'Concurrent admin edit'
            }
          },
          $inc: {
            __v: 1
          }
        });
      }
      return result;
    };
    try {
      const results = await seed();
      assert.equal(results[0]!.status, 'admin-preserved');
      const row = await GalleryItem.findById(seedId(manifest.records[0]!.key));
      assert.equal(row!.title!.en, 'Concurrent admin edit');
      assert.equal(row!.publishedAt, undefined);
      assert.equal(await Asset.countDocuments({
        visibility: 'public'
      }), 3);
    } finally {
      provider.store = store;
    }
  });
  it('extends an existing four-image preview to all 200 source entries with 176 releases and 24 hidden duplicates', async () => {
    await seed();
    const previewRows = await GalleryItem.find().lean();
    const previewCheckpoints = await SourceImport.find().lean();
    const archive = await loadGalleryManifest();
    const archiveFiles = await galleryFiles(archive, fileURLToPath(galleryAssetRoot));
    const original = await loadManifest();
    assert.equal(archiveFiles.size, 200);
    for (const record of archive.records) {
      const source = original.records.find(row => row.key === record.key)!;
      assert.equal(recordChecksum(archive, record), recordChecksum(original, source));
    }
    const plan = await planGallerySeed(archive);
    assert.equal(plan.filter(row => row.status === 'seeded-preserved').length, 4);
    assert.equal(plan.filter(row => row.status === 'would-create').length, 172);
    assert.equal(plan.filter(row => row.status === 'would-hide-duplicate').length, 24);
    assert.equal(uploads, 4);
    assert.equal(await GalleryItem.countDocuments(), 4);
    const scanned: number[] = [];
    const options = { manifest: archive, files: archiveFiles, actorId, namespace: 'hrpf/dev', provider, scanner: async () => 'clean' as const };
    const results = await applyGallerySeed({ ...options, progress: value => scanned.push(value.completed) });
    assert.equal(scanned.length, 200);
    assert.equal(scanned.at(-1), 200);
    assert.equal(results.filter(row => row.status === 'published').length, 172);
    assert.equal(results.filter(row => row.status === 'seeded-preserved').length, 4);
    assert.equal(results.filter(row => row.status === 'duplicate-hidden').length, 24);
    assert.equal(uploads, 176);
    assert.equal(await Asset.countDocuments(), 176);
    assert.equal(await GalleryItem.countDocuments(), 200);
    assert.equal(await GalleryItem.countDocuments({ reviewStatus: 'hidden', publishedAt: null, asset: null }), 24);
    assert.equal(await GalleryItem.countDocuments({ reviewStatus: 'approved', treatment: 'AI_RESTORATION' }), 16);
    for (const before of previewRows) assert.deepEqual(await GalleryItem.findById(before._id).lean(), before);
    for (const before of previewCheckpoints) assert.deepEqual(await SourceImport.findById(before._id).lean(), before);
    const app = express().use('/api', publicRouter(provider));
    for (const [category, total] of [['media-coverage', 44], ['in-action', 132]] as const) {
      const first = await request(app).get(`/api/gallery?category=${category}&limit=12`).expect(200);
      assert.equal(first.body.meta.total, total);
      const ids = new Set<string>();
      for (let page = 1; page <= first.body.meta.pages; page++) {
        const response = await request(app).get(`/api/gallery?category=${category}&limit=12&page=${page}`).expect(200);
        for (const item of response.body.data) { assert.ok(item.alt); ids.add(item.id); }
        assert.ok(!JSON.stringify(response.body).includes('sourceFilename'));
      }
      assert.equal(ids.size, total);
    }
    const audits = await AuditLog.countDocuments();
    const rerun = await applyGallerySeed(options);
    assert.equal(rerun.filter(row => row.status === 'seeded-preserved').length, 176);
    assert.equal(rerun.filter(row => row.status === 'duplicate-hidden').length, 24);
    assert.equal(uploads, 176);
    assert.equal(await AuditLog.countDocuments(), audits);
  });
  it('rejects a scan failure at the end of the full archive before uploading or importing anything', async () => {
    const archive = await loadGalleryManifest();
    const archiveFiles = await galleryFiles(archive, fileURLToPath(galleryAssetRoot));
    let scans = 0;
    await assert.rejects(applyGallerySeed({
      manifest: archive, files: archiveFiles, actorId, namespace: 'hrpf/dev', provider,
      scanner: async () => ++scans === 200 ? 'infected' : 'clean'
    }));
    assert.equal(scans, 200);
    assert.equal(uploads, 0);
    assert.equal(await GalleryItem.countDocuments(), 0);
    assert.equal(await SourceImport.countDocuments(), 0);
    scans = 0;
    await assert.rejects(applyGallerySeed({
      manifest: archive, files: archiveFiles, actorId, namespace: 'hrpf/dev', provider,
      scanner: async () => {
        if (++scans === 200) await User.updateOne({ _id: actorId }, { $set: { active: false } });
        return 'clean';
      }
    }));
    assert.equal(await GalleryItem.countDocuments(), 0);
    assert.equal(uploads, 0);
  });
  it('resumes a partially uploaded archive without re-uploading its completed releases', async () => {
    const archive = await loadGalleryManifest();
    const archiveFiles = await galleryFiles(archive, fileURLToPath(galleryAssetRoot));
    const store = provider.store;
    let attempts = 0;
    const options = { manifest: archive, files: archiveFiles, actorId, namespace: 'hrpf/dev', provider, scanner: async () => 'clean' as const };
    provider.store = async (...args) => {
      if (++attempts === 7) throw new Error('Simulated provider interruption');
      return store(...args);
    };
    try {
      await assert.rejects(applyGallerySeed(options));
      assert.equal(uploads, 6);
      assert.equal(await GalleryItem.countDocuments({ reviewStatus: 'approved' }), 6);
      provider.store = store;
      const resumed = await applyGallerySeed(options);
      assert.equal(resumed.filter(row => row.status === 'seeded-preserved').length, 6);
      assert.equal(resumed.filter(row => row.status === 'published').length, 170);
      assert.equal(resumed.filter(row => row.status === 'duplicate-hidden').length, 24);
      assert.equal(uploads, 176);
      assert.equal(await Asset.countDocuments({ visibility: 'public' }), 176);
    } finally { provider.store = store; }
  });
  it('reports an inconsistent publication checkpoint without changing its linked record', async () => {
    await seed();
    const first = manifest.records[0]!;
    const other = await GalleryItem.findById(seedId(manifest.records[1]!.key)).lean();
    await SourceImport.updateOne({ key: `gallery-preview:${first.key}` }, { $set: { entityId: other!._id } });
    assert.equal((await planGallerySeed(manifest)).find(row => row.key === first.key)!.status, 'conflict');
    assert.equal((await seed()).find(row => row.key === first.key)!.status, 'conflict');
    assert.deepEqual(await GalleryItem.findById(other!._id).lean(), other);
    assert.equal(uploads, 4);
  });
});
