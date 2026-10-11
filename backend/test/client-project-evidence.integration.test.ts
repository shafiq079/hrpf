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
import { applyClientProjectEvidence, clientEvidenceFiles, homepageAssetRoot, loadClientProjectEvidence, planClientProjectEvidence, type EvidenceManifest } from '../src/seed/client-project-evidence.js';
import type { Upload, UploadProvider } from '../src/services/uploads.js';
let mongo: MongoMemoryReplSet, manifest: EvidenceManifest, uploads: Map<string, Upload>, actorId: string, stores = 0;
const provider: UploadProvider = {
  store: async (upload, _folder, format) => ({ publicId: `hrpf/dev/content/evidence-${++stores}`, resourceType: 'image', deliveryType: 'authenticated', format, bytes: upload.bytes.length, version: 1 }),
  remove: async () => {}, read: async () => new Response(new Uint8Array([1, 2, 3])),
};
const apply = (customProvider = provider, customManifest = manifest, customUploads = uploads) => applyClientProjectEvidence({ manifest: customManifest, uploads: customUploads, actorId, namespace: 'hrpf/dev', provider: customProvider });
const rowFor = (key: string) => Project.findById(seedId(key));
describe('Verified client project evidence update', { timeout: 120000 }, () => {
  before(async () => {
    manifest = await loadClientProjectEvidence(); uploads = await clientEvidenceFiles(manifest, fileURLToPath(homepageAssetRoot));
    mongo = await MongoMemoryReplSet.create({ binary: { version: '8.0.5' }, replSet: { count: 1 }, instanceOpts: [{ args: ['--nounixsocket', '--setParameter', 'diagnosticDataCollectionEnabled=false'] }] });
    await mongoose.connect(mongo.getUri(), { dbName: 'hrpf_client_evidence_test', autoIndex: false, autoCreate: false }); await ensureIndexes();
  });
  after(async () => { await mongoose.disconnect(); if (mongo) await mongo.stop(); });
  beforeEach(async () => {
    for (const model of Object.values(mongoose.models)) await model.deleteMany({}); stores = 0;
    actorId = (await User.create({ email: 'editor@example.test', name: 'Editor', passwordHash: 'not-a-real-password', role: 'editor', active: true })).id;
    const base = await loadWorkProjectsManifest();
    for (const entry of manifest.projects) {
      const record = base.records.find(record => record.key === entry.key)!;
      const row = new Project({ ...record.payload, _id: seedId(entry.key), status: 'published', reviewStatus: 'approved', publishedAt: new Date('2026-10-01') }); row.__v = 1; await row.save();
      await SourceImport.create({ key: entry.key, manifestVersion: base.version, checksum: recordChecksum(base, record), entityType: 'Project', entityId: seedId(entry.key), references: [], reviewTasks: [] });
    }
  });
  it('updates five matching projects with ten images and leaves Road Visibility unchanged', async () => {
    const before = await Project.find().lean();
    assert.deepEqual((await planClientProjectEvidence(manifest)).map(result => result.status), ['would-update', 'evidence-unavailable', 'would-update', 'would-update', 'would-update', 'would-update']);
    assert.deepEqual((await apply()).map(result => result.status), ['updated', 'evidence-unavailable', 'updated', 'updated', 'updated', 'updated']); assert.equal(stores, 10);
    const app = express().use('/api', publicRouter(provider));
    for (const entry of manifest.projects) {
      const row = (await rowFor(entry.key))!, old = before.find(old => String(old._id) === row.id)!;
      if (!entry.images.length) { assert.deepEqual(row.toObject(), old); continue; }
      assert.equal(row.slug, old.slug); assert.deepEqual(row.workAreas, old.workAreas); assert.equal(row.projectStatus, old.projectStatus); assert.equal(row.publishedAt!.getTime(), old.publishedAt!.getTime());
      assert.equal(row.__v, (old.__v ?? 0) + 1); assert.equal(row.cover!.sha256, manifest.files.find(file => file.id === entry.images[0]!.fileId)!.sha256); assert.equal(row.gallery.length, entry.images.length - 1);
      assert.equal(row.details!.period, entry.patch.details!.period);
      const response = await request(app).get('/api/projects/' + row.slug).expect(200);
      assert.equal(response.body.data.gallery.length, entry.images.length - 1);
      assert.ok(!JSON.stringify(response.body).includes('facebook.com')); assert.ok(!JSON.stringify(response.body).includes('client-project-evidence-v1'));
      for (const photo of response.body.data.gallery) await request(app).get(photo.image).expect(200);
    }
    assert.equal(await SourceImport.countDocuments({ key: /^client-evidence-v1:/ }), 5);
    assert.equal(await AuditLog.countDocuments({ action: 'project-evidence.seed-updated' }), 5);
  });
  it('reruns do not upload again or undo later admin edits and image removals', async () => {
    await apply(); const key = manifest.projects[0]!.key;
    await Project.updateOne({ _id: seedId(key) }, { $set: { 'summary.en': 'Admin revision', gallery: [], cover: null }, $inc: { __v: 1 } });
    const before = await Project.find().lean(); assert.ok((await apply()).every(result => ['already-updated', 'evidence-unavailable'].includes(result.status)));
    assert.equal(stores, 10); assert.deepEqual(await Project.find().lean(), before);
    const changed = structuredClone(manifest); changed.projects[0]!.patch.summary!.en += ' changed';
    assert.equal((await apply(provider, changed))[0]!.status, 'source-changed'); assert.equal(stores, 10);
  });
  it('preserves admin narrative, existing cover and gallery while adding verified evidence', async () => {
    const entry = manifest.projects[2]!, row = (await rowFor(entry.key))!;
    const asset = await Asset.create({ publicId: 'hrpf/dev/content/admin-cover', resourceType: 'image', deliveryType: 'authenticated', format: 'jpg', bytes: 100, version: 1, sha256: 'a'.repeat(64), ownerId: actorId, purpose: 'content', scanStatus: 'type_checked', visibility: 'public', claimStatus: 'claimed', entityType: 'Project', entityId: row._id });
    const cover = { assetId: asset._id, publicId: asset.publicId, resourceType: asset.resourceType, deliveryType: asset.deliveryType, format: asset.format, bytes: asset.bytes, version: 1, sha256: asset.sha256 };
    await Project.updateOne({ _id: row._id }, { $set: { cover, coverAlt: 'Admin cover', 'summary.en': 'Admin text', 'details.overview': 'Admin story' }, $inc: { __v: 1 } });
    const results = await apply(); assert.equal(results[2]!.status, 'updated-admin-content-preserved'); assert.deepEqual(results[2]!.preservedFields, ['summary', 'details']);
    const updated = (await rowFor(entry.key))!; assert.equal(updated.summary!.en, 'Admin text'); assert.equal(updated.details!.overview, 'Admin story'); assert.equal(String(updated.cover!.assetId), asset.id); assert.equal(updated.coverAlt, 'Admin cover'); assert.equal(updated.gallery.length, 6);
  });
  it('does not recreate deleted projects, republish withdrawals or touch unmanaged rows', async () => {
    await Project.deleteOne({ _id: seedId(manifest.projects[0]!.key) });
    await Project.updateOne({ _id: seedId(manifest.projects[1]!.key) }, { $set: { status: 'draft' } });
    await SourceImport.deleteOne({ key: manifest.projects[2]!.key });
    const results = await apply(); assert.deepEqual(results.slice(0, 3).map(result => result.status), ['deleted-preserved', 'withdrawn-preserved', 'unmanaged-preserved']); assert.equal(stores, 3);
  });
  it('checks all file bytes before any upload or database update', async () => {
    const corrupted = new Map(uploads), first = manifest.files[0]!; corrupted.set(first.id, { ...uploads.get(first.id)!, bytes: Buffer.from('wrong') });
    await assert.rejects(() => apply(provider, manifest, corrupted), /bytes changed/); assert.equal(stores, 0); assert.equal(await AuditLog.countDocuments(), 0);
  });
  it('stages files across interruptions and resumes without duplicate uploads', async () => {
    let calls = 0;
    await assert.rejects(() => apply({ ...provider, store: async (...args) => { if (++calls === 3) throw new Error('Interrupted'); return provider.store(...args); } }), /Interrupted/);
    assert.equal(stores, 2); assert.equal(await SourceImport.countDocuments({ key: /^client-evidence-v1:/ }), 1);
    await apply(); assert.equal(stores, 10); assert.equal(await Asset.countDocuments(), 10);
  });
  it('rechecks editor authorization after uploads and resumes staged files after restoration', async () => {
    await assert.rejects(() => apply({ ...provider, store: async (...args) => { const stored = await provider.store(...args); await User.updateOne({ _id: actorId }, { $set: { active: false } }); return stored; } }), /active content/);
    assert.equal(stores, 1); assert.equal(await SourceImport.countDocuments({ key: /^client-evidence-v1:/ }), 0); assert.equal(await Asset.countDocuments({ visibility: 'public' }), 0);
    await User.updateOne({ _id: actorId }, { $set: { active: true } }); await apply(); assert.equal(stores, 10);
  });
  it('detects concurrent edits and keeps uploaded evidence restricted until a safe rerun', async () => {
    const key = manifest.projects[0]!.key;
    const results = await apply({ ...provider, store: async (...args) => { const stored = await provider.store(...args); if (stores === 1) await Project.updateOne({ _id: seedId(key) }, { $set: { 'summary.en': 'Concurrent edit' }, $inc: { __v: 1 } }); return stored; } });
    assert.equal(results[0]!.status, 'version-conflict'); assert.equal((await rowFor(key))!.cover, undefined);
    const result = await apply(); assert.equal(result[0]!.status, 'updated-admin-content-preserved'); assert.equal((await rowFor(key))!.summary!.en, 'Concurrent edit'); assert.equal(stores, 10);
  });
  it('preserves a full gallery instead of removing existing images', async () => {
    const entry = manifest.projects[2]!, row = (await rowFor(entry.key))!;
    const ref = (i: number) => ({ assetId: new mongoose.Types.ObjectId(), publicId: `hrpf/dev/content/existing-${i}`, resourceType: 'image', deliveryType: 'authenticated', format: 'jpg', bytes: 100, version: 1, sha256: 'a'.repeat(64) });
    await Project.updateOne({ _id: row._id }, { $set: { cover: ref(0), gallery: Array.from({ length: 20 }, (_, i) => ({ asset: ref(i + 1), alt: `Existing ${i}` })) } });
    const before = (await rowFor(entry.key))!.toObject();
    assert.equal((await apply())[2]!.status, 'gallery-full-preserved');
    assert.deepEqual((await rowFor(entry.key))!.toObject(), before); assert.equal(stores, 4);
  });
  it('does not repeat a matching image already added by the admin', async () => {
    const entry = manifest.projects[2]!, row = (await rowFor(entry.key))!, file = manifest.files.find(file => file.id === entry.images[0]!.fileId)!;
    const asset = await Asset.create({ publicId: 'hrpf/dev/content/already-present', resourceType: 'image', deliveryType: 'authenticated', format: 'jpg', bytes: file.bytes, version: 1, sha256: file.sha256, ownerId: actorId, purpose: 'content', scanStatus: 'type_checked', visibility: 'public', claimStatus: 'claimed', entityType: 'Project', entityId: row._id });
    const ref = { assetId: asset._id, publicId: asset.publicId, resourceType: asset.resourceType, deliveryType: asset.deliveryType, format: asset.format, bytes: asset.bytes, version: 1, sha256: asset.sha256 };
    await Project.updateOne({ _id: row._id }, { $set: { gallery: [{ asset: ref, alt: 'Admin caption', caption: 'Keep this caption' }] } });
    await apply(); const updated = (await rowFor(entry.key))!;
    assert.equal(stores, 9); assert.equal(updated.gallery.length, 5); assert.equal(updated.gallery[0]!.caption, 'Keep this caption');
    assert.equal([updated.cover!.sha256, ...updated.gallery.map(image => image.asset.sha256)].filter(hash => hash === file.sha256).length, 1);
  });
  it('rejects a production namespace before uploading or changing content', async () => {
    await assert.rejects(() => applyClientProjectEvidence({ manifest, uploads, actorId, namespace: 'hrpf/prod', provider }), /limited to hrpf\/dev/);
    assert.equal(stores, 0); assert.equal(await AuditLog.countDocuments(), 0);
  });

});
