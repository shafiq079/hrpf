import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import express from 'express';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Asset, AuditLog, BlogPost, Project, SourceImport, User, ensureIndexes } from '../src/domain/models.js';
import { applyHomepageSeed, homepageAssetRoot, homepageFiles, loadHomepageManifest } from '../src/seed/homepage.js';
import { publicRouter } from '../src/http/public-content.js';
import type { UploadProvider } from '../src/services/uploads.js';
import type { Manifest } from '../src/seed/manifest.js';
let mongo: MongoMemoryReplSet, manifest: Manifest, files: Map<string, Buffer>, actorId: string, uploads = 0;
const provider: UploadProvider = {
  store: async upload => ({ publicId: `hrpf/dev/content/test-${++uploads}`, resourceType: 'image', deliveryType: 'authenticated', format: 'webp', bytes: upload.bytes.length, version: 1 }),
  remove: async () => {}, read: async () => new Response(new Uint8Array([1, 2, 3])),
};
const seed = () => applyHomepageSeed({ manifest, files, actorId, namespace: 'hrpf/dev', provider });
describe('Homepage source seed publication and preservation', { timeout: 120000 }, () => {
  before(async () => {
    manifest = await loadHomepageManifest(); files = await homepageFiles(manifest, fileURLToPath(homepageAssetRoot));
    mongo = await MongoMemoryReplSet.create({ binary: { version: '8.0.5' }, replSet: { count: 1 }, instanceOpts: [{ args: ['--nounixsocket', '--setParameter', 'diagnosticDataCollectionEnabled=false'] }] });
    await mongoose.connect(mongo.getUri(), { dbName: 'hrpf_home_seed_test', autoIndex: false, autoCreate: false }); await ensureIndexes();
  });
  after(async () => { await mongoose.disconnect(); if (mongo) await mongo.stop(); });
  beforeEach(async () => {
    for (const model of Object.values(mongoose.models)) await model.deleteMany({}); uploads = 0;
    const actor = await User.create({ email: 'seed@example.test', name: 'Test editor', passwordHash: 'not-a-real-password', role: 'editor', active: true }); actorId = actor.id;
  });
  it('publishes three real projects and three sourced articles with type-checked owned covers visible in public feeds', async () => {
    const results = await seed(); assert.equal(results.filter(row => row.status === 'published').length, 6);
    assert.equal(await Project.countDocuments({ status: 'published' }), 3); assert.equal(await BlogPost.countDocuments({ status: 'published' }), 3);
    assert.equal(await Asset.countDocuments({ claimStatus: 'claimed', visibility: 'public', scanStatus: 'type_checked' }), 6);
    assert.equal(await AuditLog.countDocuments({ action: 'homepage.seed-published', actorId }), 6);
    const app = express().use('/api', publicRouter(provider));
    for (const path of ['/api/projects', '/api/news']) {
      const response = await request(app).get(path).expect(200); assert.equal(response.body.data.length, 3);
      for (const row of response.body.data) {
        assert.ok(row.image.startsWith('/api/public-assets/')); assert.ok(!JSON.stringify(row).includes('publicId'));
        const detail = await request(app).get(`${path}/${row.slug}`).expect(200); assert.ok(detail.body.data.blocks.some((block: { text: string }) => block.text.includes('Source:')));
        await request(app).get(row.image).expect(200);
      }
    }
  });
  it('reruns preserve published entries without extra uploads or audit writes', async () => {
    await seed(); const before = await AuditLog.countDocuments(); const results = await seed();
    assert.ok(results.every(row => row.status === 'admin-preserved')); assert.equal(uploads, 6); assert.equal(await AuditLog.countDocuments(), before);
  });
  it('preserves admin edits, withdrawals and deleted records', async () => {
    await seed(); const rows = await Project.find().sort({ slug: 1 });
    await Project.updateOne({ _id: rows[0]!._id }, { $set: { title: { en: 'Admin title' } }, $inc: { __v: 1 } });
    await Project.updateOne({ _id: rows[1]!._id }, { $set: { status: 'draft', reviewStatus: 'pending' }, $unset: { publishedAt: 1 }, $inc: { __v: 1 } });
    await Asset.updateMany({ entityId: rows[1]!._id }, { $set: { visibility: 'restricted' } });
    await Project.deleteOne({ _id: rows[2]!._id }); await seed();
    assert.equal((await Project.findById(rows[0]!._id))!.title!.en, 'Admin title'); assert.equal((await Project.findById(rows[1]!._id))!.status, 'draft');
    assert.equal(await Project.findById(rows[2]!._id), null); assert.equal(uploads, 6);
  });
  it('recovers an interrupted draft/upload using its existing staged asset', async () => {
    const realStore = provider.store; let interrupted = true;
    provider.store = async (...args) => { if (interrupted && uploads === 1) throw new Error('simulated interruption'); return realStore(...args); };
    try { await assert.rejects(seed()); interrupted = false; await seed(); assert.equal(uploads, 6); assert.equal(await SourceImport.countDocuments(), 6); }
    finally { provider.store = realStore; }
  });
  it('rejects unauthorized actors before creating drafts or uploading', async () => {
    assert.equal(await Project.countDocuments(), 0); assert.equal(await SourceImport.countDocuments(), 0); assert.equal(uploads, 0);
    await User.updateOne({ _id: actorId }, { $set: { role: 'case_manager' } }); await assert.rejects(seed()); assert.equal(uploads, 0);
  });
  it('rejects changed image bytes before creating drafts or uploading', async () => {
    const id = manifest.files.find(file => file.id.startsWith('gallery:'))!.id; const original = files.get(id)!;
    files.set(id, Buffer.from('changed'));
    try { await assert.rejects(seed()); assert.equal(await SourceImport.countDocuments(), 0); assert.equal(uploads, 0); }
    finally { files.set(id, original); }
  });
  it('rechecks an actor revoked during upload and keeps the draft/cover restricted', async () => {
    const realStore = provider.store;
    provider.store = async (...args) => { const stored = await realStore(...args); await User.updateOne({ _id: actorId }, { $set: { active: false } }); return stored; };
    try { await assert.rejects(seed()); assert.equal(await Project.countDocuments({ status: 'published' }), 0); assert.equal(await Asset.countDocuments({ visibility: 'public' }), 0);
      provider.store = realStore; await User.updateOne({ _id: actorId }, { $set: { active: true } }); await seed();
      assert.equal(uploads, 6, 'Recovered staged cover should not be uploaded twice'); assert.equal(await Project.countDocuments({ status: 'published' }), 3); }
    finally { provider.store = realStore; }
  });
});
