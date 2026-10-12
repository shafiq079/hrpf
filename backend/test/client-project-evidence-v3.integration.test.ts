import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import express from 'express';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Asset, AuditLog, Project, SourceImport, User, ensureIndexes } from '../src/domain/models.js';
import { publicRouter } from '../src/http/public-content.js';
import { seedId, recordChecksum } from '../src/seed/manifest.js';
import { loadWorkProjectsManifest } from '../src/seed/work-projects.js';
import { applyClientProjectEvidence, clientEvidenceFiles, homepageAssetRoot, loadClientProjectEvidenceV3, planClientProjectEvidence, type EvidenceManifest } from '../src/seed/client-project-evidence.js';
import type { Upload, UploadProvider } from '../src/services/uploads.js';

let mongo: MongoMemoryReplSet, manifest: EvidenceManifest, uploads: Map<string, Upload>, actorId: string, stores = 0;
const provider: UploadProvider = {
  store: async (upload, _folder, format) => ({ publicId: `hrpf/dev/content/batch3-${++stores}`, resourceType: 'image', deliveryType: 'authenticated', format, bytes: upload.bytes.length, version: 1 }),
  remove: async () => {}, read: async () => new Response(new Uint8Array([1, 2, 3])),
};
const apply = () => applyClientProjectEvidence({ manifest, uploads, actorId, namespace: 'hrpf/dev', provider });
const rowFor = (key: string) => Project.findById(seedId(key));
describe('Public research evidence images', { timeout: 120000 }, () => {
  before(async () => {
    manifest = await loadClientProjectEvidenceV3();
    uploads = await clientEvidenceFiles(manifest, fileURLToPath(homepageAssetRoot));
    mongo = await MongoMemoryReplSet.create({ binary: { version: '8.0.5' }, replSet: { count: 1 }, instanceOpts: [{ args: ['--nounixsocket', '--setParameter', 'diagnosticDataCollectionEnabled=false'] }] });
    await mongoose.connect(mongo.getUri(), { dbName: 'hrpf_client_evidence_v3_test', autoIndex: false, autoCreate: false });
    await ensureIndexes();
  });
  after(async () => { await mongoose.disconnect(); if (mongo) await mongo.stop(); });
  beforeEach(async () => {
    for (const model of Object.values(mongoose.models)) await model.deleteMany({});
    stores = 0;
    actorId = (await User.create({ email: 'editor@example.test', name: 'Editor', passwordHash: 'not-a-real-password', role: 'editor', active: true })).id;
    const base = await loadWorkProjectsManifest();
    for (const entry of manifest.projects) {
      const record = base.records.find(record => record.key === entry.key)!;
      await new Project({ ...record.payload, _id: seedId(entry.key), status: 'published', reviewStatus: 'approved', publishedAt: new Date('2026-10-01') }).save();
      await SourceImport.create({ key: entry.key, manifestVersion: base.version, checksum: recordChecksum(base, record), entityType: 'Project', entityId: seedId(entry.key), references: [], reviewTasks: [] });
    }
  });
  it('fills only the two verified gaps, delivers images and preserves project narrative and work selections', async () => {
    assert.equal(manifest.files.length, 2);
    assert.deepEqual(manifest.projects.map(entry => entry.key), ['work-project:national-minorities-day-awareness', 'work-project:flood-relief-access-accountability']);
    assert.ok(manifest.projects.every(entry => Object.keys(entry.patch).length === 0 && entry.images.length === 1));
    const old = await Project.find().lean();
    assert.ok((await planClientProjectEvidence(manifest)).every(result => result.status === 'would-update'));
    assert.equal(stores, 0);
    assert.ok((await apply()).every(result => result.status === 'updated'));
    assert.equal(stores, 2);
    const app = express().use('/api', publicRouter(provider));
    for (const entry of manifest.projects) {
      const row = (await rowFor(entry.key))!, before = old.find(row => String(row._id) === String(seedId(entry.key)))!;
      for (const field of ['title', 'summary', 'details', 'blocks', 'workAreas', 'projectStatus', 'status', 'reviewStatus', 'publishedAt'] as const) assert.deepEqual(row.toObject()[field], before[field]);
      assert.equal(row.cover!.sha256, manifest.files.find(file => file.id === entry.images[0]!.fileId)!.sha256);
      assert.equal(row.gallery.length, 0);
      const response = await request(app).get('/api/projects/' + row.slug).expect(200);
      assert.ok(response.body.data.image);
      await request(app).get(response.body.data.image).expect(200);
      assert.ok(!JSON.stringify(response.body).includes('facebook.com'));
    }
    assert.equal(await SourceImport.countDocuments({ key: /^client-evidence-v3:/ }), 2);
    assert.equal(await AuditLog.countDocuments({ action: 'project-evidence.seed-updated' }), 2);
    await Project.updateOne({ _id: seedId(manifest.projects[0]!.key) }, { $set: { cover: null, 'summary.en': 'Later administrator revision' }, $inc: { __v: 1 } });
    const snapshot = await Project.find().lean();
    assert.ok((await apply()).every(result => result.status === 'already-updated'));
    assert.equal(stores, 2);
    assert.deepEqual(await Project.find().lean(), snapshot);
  });
  it('keeps an existing admin cover and text, adding the new asset to its gallery with an accurate caption', async () => {
    const entry = manifest.projects[1]!, row = (await rowFor(entry.key))!;
    const asset = await Asset.create({ publicId: 'hrpf/dev/content/admin-cover', resourceType: 'image', deliveryType: 'authenticated', format: 'jpg', bytes: 100, version: 1, sha256: 'a'.repeat(64), ownerId: actorId, purpose: 'content', scanStatus: 'type_checked', visibility: 'public', claimStatus: 'claimed', entityType: 'Project', entityId: row._id });
    const cover = { assetId: asset._id, publicId: asset.publicId, resourceType: asset.resourceType, deliveryType: asset.deliveryType, format: asset.format, bytes: asset.bytes, version: 1, sha256: asset.sha256 };
    await Project.updateOne({ _id: row._id }, { $set: { cover, coverAlt: 'Admin cover', 'details.overview': 'Admin narrative', workAreas: ['community-development'] }, $inc: { __v: 1 } });
    await apply();
    const updated = (await rowFor(entry.key))!;
    assert.equal(String(updated.cover!.assetId), asset.id);
    assert.equal(updated.coverAlt, 'Admin cover');
    assert.equal(updated.details!.overview, 'Admin narrative');
    assert.deepEqual(updated.workAreas, ['community-development']);
    assert.equal(updated.gallery.length, 1);
    assert.equal(updated.gallery[0]!.caption, entry.images[0]!.caption);
    assert.ok(updated.gallery[0]!.caption!.startsWith('Video still'));
  });
  it('does not recreate deleted entries or publish withdrawn projects', async () => {
    await Project.deleteOne({ _id: seedId(manifest.projects[0]!.key) });
    await Project.updateOne({ _id: seedId(manifest.projects[1]!.key) }, { $set: { status: 'draft' } });
    assert.deepEqual((await apply()).map(result => result.status), ['deleted-preserved', 'withdrawn-preserved']);
    assert.equal(stores, 0);
    assert.equal(await SourceImport.countDocuments({ key: /^client-evidence-v3:/ }), 0);
  });
});
