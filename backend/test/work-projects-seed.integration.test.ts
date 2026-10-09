import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import mongoose from 'mongoose';
import express from 'express';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Asset, AuditLog, Counter, Project, SourceImport, User, ensureIndexes } from '../src/domain/models.js';
import { applyWorkProjectsSeed, loadLegacyWorkProjectsManifest, loadWorkProjectsManifest, workProjectAssetRoot, workProjectFields, workProjectFiles } from '../src/seed/work-projects.js';
import { applyHomepageSeed, homepageFiles, loadHomepageManifest } from '../src/seed/homepage.js';
import { publicRouter } from '../src/http/public-content.js';
import type { UploadProvider } from '../src/services/uploads.js';
import type { Manifest } from '../src/seed/manifest.js';
import { workAreas } from '../src/domain/work-areas.js';
import { loadProjectDetailsManifest, projectDetailsFiles, applyProjectDetails } from '../src/seed/project-details.js';
import { bindProjectMedia } from '../src/services/project-media.js';

let mongo: MongoMemoryReplSet, manifest: Manifest, files: Map<string, Buffer>, actorId: string, uploads = 0;
const provider: UploadProvider = {
  store: async (upload, _folder, format) => ({ publicId: `hrpf/dev/content/work-test-${++uploads}`, resourceType: upload.mime === 'application/pdf' ? 'raw' : 'image', deliveryType: 'authenticated', format, bytes: upload.bytes.length, version: 1 }),
  remove: async () => {}, read: async () => new Response(new Uint8Array([1, 2, 3])),
};
const seed = (input = manifest) => applyWorkProjectsSeed({ manifest: input, files, actorId, namespace: 'hrpf/dev', provider });
describe('Work project catalog import and field discovery', { timeout: 120000 }, () => {
  before(async () => {
    manifest = await loadWorkProjectsManifest(); files = await workProjectFiles(manifest, fileURLToPath(workProjectAssetRoot));
    mongo = await MongoMemoryReplSet.create({ binary: { version: '8.0.5' }, replSet: { count: 1 }, instanceOpts: [{ args: ['--nounixsocket', '--setParameter', 'diagnosticDataCollectionEnabled=false'] }] });
    await mongoose.connect(mongo.getUri(), { dbName: 'hrpf_work_seed_test', autoIndex: false, autoCreate: false }); await ensureIndexes();
  });
  after(async () => { await mongoose.disconnect(); if (mongo) await mongo.stop(); });
  beforeEach(async () => {
    for (const model of Object.values(mongoose.models)) await model.deleteMany({}); uploads = 0;
    actorId = (await User.create({ email: 'seed@example.test', name: 'Test editor', passwordHash: 'test-only', role: 'editor', active: true })).id;
  });
  it('adds 28 rich projects without duplicating the existing three; all eight fields discover their relevant records', async () => {
    const home = await loadHomepageManifest();
    await applyHomepageSeed({ manifest: home, files: await homepageFiles(home, fileURLToPath(workProjectAssetRoot)), actorId, namespace: 'hrpf/dev', provider });
    assert.equal((await seed()).filter(row => row.status === 'published').length, 28);
    assert.equal(await Project.countDocuments({ status: 'published' }), 31);
    assert.equal(await AuditLog.countDocuments({ action: 'work-project.seed-published', actorId }), 28);
    assert.ok((await Counter.findOne({ key: 'public:content-revision' }))!.sequence >= 56);
    const app = express().use('/api', publicRouter(provider));
    for (const field of workProjectFields) {
      const expected = manifest.records.filter(record => (record.payload.workAreas as string[]).includes(workAreas.find(area => area.title === field)!.slug)).map(record => String(record.payload.slug));
      const response = await request(app).get('/api/projects').query({ focusArea: field, limit: 48 }).expect(200);
      for (const slug of expected) assert.ok(response.body.data.some((row: { slug: string }) => row.slug === slug), `${field}: ${slug}`);
    }
    for (const record of manifest.records) {
      const response = await request(app).get(`/api/projects/${record.payload.slug}`).expect(200);
      const row = response.body.data;
      assert.ok(row.details.overview && row.details.activities.length && row.details.outcomes.length);
      if (record.files.some(id => id.startsWith('gallery:'))) { assert.ok(row.image.startsWith('/api/public-assets/')); await request(app).get(row.image).expect(200); } else assert.equal(row.image, null);
      assert.equal(row.blocks.length, 0); assert.equal(row.details.metrics.length, 0);
      assert.ok(!JSON.stringify(row).includes('sourceReferences') && !JSON.stringify(row).includes('verificationNotes'));
    }
    const school = (await request(app).get('/api/projects/safe-classrooms-mianwal-ranjha')).body.data;
    assert.equal(school.status, 'Ongoing'); assert.ok(school.details.outcomes.some((value: string) => value.includes('unconfirmed')));
    const minority = (await request(app).get('/api/projects/national-minorities-day-awareness')).body.data;
    assert.equal(minority.status, 'Completed'); assert.ok(minority.details.outcomes[0].includes('no service-delivery outcome'));
  });
  it('preserves admin edits, withdrawals, deletion and unmanaged slug collisions on rerun', async () => {
    await Project.create({ ...manifest.records[0]!.payload, title: { en: 'Existing admin project' } });
    const results = await seed(); assert.ok(results.some(row => row.status === 'unmanaged-preserved'));
    const [edited, withdrawn, deleted] = await Project.find({ status: 'published' }).limit(3);
    await Project.updateOne({ _id: edited!._id }, { $set: { title: { en: 'Admin edit' } }, $inc: { __v: 1 } });
    await Project.updateOne({ _id: withdrawn!._id }, { $set: { status: 'draft', reviewStatus: 'pending' }, $unset: { publishedAt: 1 }, $inc: { __v: 1 } });
    await Asset.updateMany({ entityId: withdrawn!._id }, { $set: { visibility: 'restricted' } });
    await Project.deleteOne({ _id: deleted!._id });
    const before = await AuditLog.countDocuments(); await seed();
    assert.equal(uploads, 6); assert.equal(await AuditLog.countDocuments(), before);
    assert.equal((await Project.findById(edited!._id))!.title!.en, 'Admin edit');
    assert.equal((await Project.findById(withdrawn!._id))!.status, 'draft'); assert.equal(await Project.findById(deleted!._id), null);
    assert.equal((await Project.findOne({ slug: String(manifest.records[0]!.payload.slug) }))!.title!.en, 'Existing admin project');
  });
  it('reports changed source data without overwriting or republishing', async () => {
    await seed(); const changed = structuredClone(manifest); changed.records[0]!.payload.summary = { en: 'Changed source summary' };
    const result = await seed(changed); assert.ok(result.some(row => row.status === 'source-changed'));
    assert.equal(uploads, 6); assert.equal((await Project.findOne({ slug: String(manifest.records[0]!.payload.slug) }))!.summary!.en, (manifest.records[0]!.payload.summary as { en: string }).en);
  });
  it('verifies evidence integrity as well as cover bytes before writes', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hrpf-work-evidence-'));
    try {
      for (const file of manifest.files) {
        const target = join(root, file.path); await mkdir(dirname(target), { recursive: true });
        await writeFile(target, await readFile(join(fileURLToPath(workProjectAssetRoot), file.path)));
      }
      await writeFile(join(root, manifest.files.find(file => file.id.startsWith('work-evidence:'))!.path), 'changed evidence');
      await assert.rejects(workProjectFiles(manifest, root)); assert.equal(uploads, 0); assert.equal(await Project.countDocuments(), 0);
    } finally { await rm(root, { recursive: true, force: true }); }
    const id = manifest.files.find(file => file.id.startsWith('gallery:'))!.id; const original = files.get(id)!; files.set(id, Buffer.from('changed'));
    try { await assert.rejects(seed()); assert.equal(await SourceImport.countDocuments(), 0); }
    finally { files.set(id, original); }
  });
  it('repairs v1 photos while preserving text edits, explicit selections, withdrawals and deletions', async () => {
    const home = await loadHomepageManifest();
    await applyHomepageSeed({ manifest: home, files: await homepageFiles(home, fileURLToPath(workProjectAssetRoot)), actorId, namespace: 'hrpf/dev', provider });
    const detail = await loadProjectDetailsManifest();
    await applyProjectDetails({ manifest: detail, uploads: await projectDetailsFiles(detail, fileURLToPath(workProjectAssetRoot)), actorId, namespace: 'hrpf/dev', provider });
    const old = await loadLegacyWorkProjectsManifest();
    await applyHomepageSeed({ manifest: old, files: await homepageFiles(old, fileURLToPath(workProjectAssetRoot)), actorId, namespace: 'hrpf/dev', provider, publicationAction: 'work-project.seed-published' });
    const oldCovers = (await Project.find()).map(row => row.cover!.assetId.toString());
    const [edited, withdrawn, deleted] = await Project.find({ slug: { $in: ['domestic-violence-emergency-response', 'prison-healthcare-mandi-bahauddin', 'overseas-travel-document-support'] } }).sort({ slug: 1 });
    await Project.updateOne({ _id: edited!._id }, { $set: { title: { en: 'Administrator wording' }, workAreas: [] }, $inc: { __v: 1 } });
    await Project.updateOne({ _id: withdrawn!._id }, { $set: { status: 'draft', reviewStatus: 'pending' }, $unset: { publishedAt: 1 }, $inc: { __v: 1 } });
    await Asset.updateMany({ entityId: withdrawn!._id }, { $set: { visibility: 'restricted' } });
    await Project.deleteOne({ _id: deleted!._id });
    const preservedDetails = (await Project.findOne({ slug: 'mianwal-ranjha-sanitation' }).lean())!.details;
    await seed();
    assert.equal((await Project.findById(edited!._id))!.title!.en, 'Administrator wording');
    assert.deepEqual((await Project.findById(edited!._id))!.workAreas, []);
    assert.equal((await Project.findById(withdrawn!._id))!.status, 'draft');
    assert.equal(await Project.findById(deleted!._id), null);
    assert.deepEqual((await Project.findOne({ slug: 'mianwal-ranjha-sanitation' }).lean())!.details, preservedDetails);
    assert.equal(await Project.countDocuments({ cover: { $exists: true } }), 8);
    assert.equal(await Project.countDocuments({ 'gallery.0': { $exists: true } }), 0);
    assert.equal(await Asset.countDocuments({ _id: { $in: oldCovers.filter(id => id !== deleted!.cover!.assetId.toString()) }, visibility: 'public' }), 0);
    const app = express().use('/api', publicRouter(provider));
    for (const id of oldCovers) await request(app).get(`/api/public-assets/${id}`).expect(404);
    assert.deepEqual((await Project.findOne({ slug: 'national-minorities-day-awareness' }))!.workAreas, ['minority-rights']);
    const beforeUploads = uploads, beforeAudits = await AuditLog.countDocuments();
    await seed(); assert.equal(uploads, beforeUploads); assert.equal(await AuditLog.countDocuments(), beforeAudits);
  });
  it('preserves later admin uploads even with the same bytes as a rejected legacy cover', async () => {
    const old = await loadLegacyWorkProjectsManifest();
    await applyHomepageSeed({ manifest: old, files: await homepageFiles(old, fileURLToPath(workProjectAssetRoot)), actorId, namespace: 'hrpf/dev', provider, publicationAction: 'work-project.seed-published' });
    const row = (await Project.findOne({ slug: 'womens-dignity-public-services' }))!, original = (await Asset.findById(row.cover!.assetId))!;
    const uploaded = await Asset.create({ publicId: 'hrpf/dev/content/admin-upload', resourceType: 'image', deliveryType: 'authenticated', format: original.format, bytes: original.bytes, sha256: original.sha256, ownerId: actorId, purpose: 'content', visibility: 'restricted', scanStatus: 'type_checked', claimStatus: 'staged', stagingExpiresAt: new Date(Date.now()+86400000) });
    await mongoose.connection.transaction(async session => {
      const current = (await Project.findById(row._id).session(session))!;
      await bindProjectMedia(current, { coverAssetId: uploaded.id }, actorId, session, 'public');
      current.workAreas = ['minority-rights']; current.coverAlt = 'Administrator selected image'; await current.save({ session });
    });
    await seed(); const current = (await Project.findById(row._id))!;
    assert.equal(current.cover!.assetId.toString(), uploaded.id); assert.equal(current.coverAlt, 'Administrator selected image'); assert.deepEqual(current.workAreas, ['minority-rights']);
  });
  it('recovers an interrupted upload and restricts publication if the actor is revoked', async () => {
    const realStore = provider.store; let interrupted = true;
    provider.store = async (...args) => { if (interrupted && uploads === 1) throw new Error('interrupted'); return realStore(...args); };
    try { await assert.rejects(seed()); interrupted = false; await seed(); assert.equal(uploads, 6); }
    finally { provider.store = realStore; }
    // A separate interrupted fresh batch must not release assets after revocation.
    for (const name of ['Project', 'Asset', 'SourceImport', 'AuditLog']) await mongoose.model(name).deleteMany({}); uploads = 0;
    provider.store = async (...args) => { const stored = await realStore(...args); await User.updateOne({ _id: actorId }, { $set: { active: false } }); return stored; };
    try {
      await assert.rejects(seed()); assert.ok(await Project.countDocuments({ status: 'published' }) < 28); assert.equal(await Asset.countDocuments({ visibility: 'public' }), 0);
      provider.store = realStore; await User.updateOne({ _id: actorId }, { $set: { active: true } }); await seed(); assert.equal(uploads, 6);
    } finally { provider.store = realStore; }
  });
});
