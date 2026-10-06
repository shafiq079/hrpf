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
import { seedId, type Manifest } from '../src/seed/manifest.js';
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
describe('Gallery source preview seed', {
  timeout: 120000
}, () => {
  before(async () => {
    manifest = await loadGalleryManifest();
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
});
