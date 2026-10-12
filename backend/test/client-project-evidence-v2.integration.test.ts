import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import express from 'express';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Asset, AuditLog, Project, SourceImport, User, ensureIndexes } from '../src/domain/models.js';
import { publicRouter } from '../src/http/public-content.js';
import { seedId, recordChecksum, type Manifest, type SeedRecord } from '../src/seed/manifest.js';
import { loadWorkProjectsManifest } from '../src/seed/work-projects.js';
import { loadHomepageManifest } from '../src/seed/homepage.js';
import { loadProjectDetailsManifest } from '../src/seed/project-details.js';
import { applyClientProjectEvidence, clientEvidenceFiles, homepageAssetRoot, loadClientProjectEvidence, loadClientProjectEvidenceV2, planClientProjectEvidence, type EvidenceManifest } from '../src/seed/client-project-evidence.js';
import type { Upload, UploadProvider } from '../src/services/uploads.js';
let mongo: MongoMemoryReplSet, manifest: EvidenceManifest, uploads: Map<string, Upload>, originals: Manifest[], actorId: string, stores = 0;
const provider: UploadProvider = { store: async (upload, _folder, format) => ({ publicId: `hrpf/dev/content/batch2-${++stores}`, resourceType: 'image', deliveryType: 'authenticated', format, bytes: upload.bytes.length, version: 1 }), remove: async () => {}, read: async () => new Response(new Uint8Array([1, 2, 3])) };
const apply = (custom = provider, input = manifest) => applyClientProjectEvidence({ manifest: input, uploads, actorId, namespace: 'hrpf/dev', provider: custom });
const rowFor = (key: string) => Project.findById(seedId(key));
describe('Second client evidence revision', { timeout: 120000 }, () => {
  before(async () => {
    manifest = await loadClientProjectEvidenceV2(); uploads = await clientEvidenceFiles(manifest, fileURLToPath(homepageAssetRoot)); originals = await Promise.all([loadWorkProjectsManifest(), loadHomepageManifest()]);
    mongo = await MongoMemoryReplSet.create({ binary: { version: '8.0.5' }, replSet: { count: 1 }, instanceOpts: [{ args: ['--nounixsocket', '--setParameter', 'diagnosticDataCollectionEnabled=false'] }] });
    await mongoose.connect(mongo.getUri(), { dbName: 'hrpf_client_evidence_v2_test', autoIndex: false, autoCreate: false }); await ensureIndexes();
  });
  after(async () => { await mongoose.disconnect(); if (mongo) await mongo.stop(); });
  beforeEach(async () => {
    for (const model of Object.values(mongoose.models)) await model.deleteMany({}); stores = 0;
    actorId = (await User.create({ email: 'editor@example.test', name: 'Editor', passwordHash: 'not-a-real-password', role: 'editor', active: true })).id;
    for (const entry of manifest.projects) {
      const source = originals.find(source => source.records.some(record => record.key === entry.key))!, record = source.records.find(record => record.key === entry.key)!;
      await new Project({ ...record.payload, _id: seedId(entry.key), status: 'published', reviewStatus: 'approved', publishedAt: new Date('2026-10-01') }).save();
      await SourceImport.create({ key: entry.key, manifestVersion: source.version, checksum: recordChecksum(source, record), entityType: 'Project', entityId: seedId(entry.key), references: [], reviewTasks: [] });
    }
  });
  it('maps 25 sources to 14 updates and one unavailable source, with 18 verified images', async () => {
    assert.equal(manifest.projects.length, 15); assert.equal(new Set(manifest.projects.flatMap(entry => entry.sourceLinks)).size, 25); assert.equal(manifest.files.length, 18);
    const originalRows = await Project.find().lean(), plan = await planClientProjectEvidence(manifest); assert.equal(plan.filter(result => result.status === 'would-update').length, 14);
    const results = await apply(); assert.equal(results.filter(result => result.status === 'updated').length, 14); assert.equal(results.filter(result => result.status === 'evidence-unavailable').length, 1); assert.equal(stores, 18);
    const app = express().use('/api', publicRouter(provider));
    for (const entry of manifest.projects) {
      const row = (await rowFor(entry.key))!, old = originalRows.find(old => String(old._id) === row.id)!;
      assert.equal(row.slug, old.slug); assert.equal(row.projectStatus, old.projectStatus); assert.equal(row.publishedAt!.getTime(), old.publishedAt!.getTime());
      if (!Object.keys(entry.patch).length) { assert.deepEqual(row.toObject(), old); continue; }
      assert.equal(row.__v, (old.__v ?? 0) + 1); assert.equal(row.details!.overview, entry.patch.details!.overview); assert.equal(row.gallery.length, Math.max(0, entry.images.length - 1));
      const response = await request(app).get('/api/projects/' + row.slug).expect(200);
      assert.ok(!JSON.stringify(response.body).includes('clientNumber')); assert.ok(!JSON.stringify(response.body).includes('facebook.com')); assert.ok(!JSON.stringify(response.body).includes('Sources and photographs'));
      for (const image of response.body.data.gallery) await request(app).get(image.image).expect(200);
    }
    const child = (await rowFor('work-project:child-protection-institutional-advocacy'))!; assert.ok(child.workAreas!.includes('minority-rights')); assert.equal(child.cover, undefined);
    assert.equal((await rowFor('work-project:overseas-travel-document-support'))!.cover, undefined);
  });
  it('recognizes the previous evidence checkpoint and appends without losing the first timeline or media', async () => {
    const first = await loadClientProjectEvidence(), firstUploads = await clientEvidenceFiles(first, fileURLToPath(homepageAssetRoot));
    await applyClientProjectEvidence({ manifest: first, uploads: firstUploads, actorId, namespace: 'hrpf/dev', provider });
    const before = (await rowFor('work-project:public-safety-information-research'))!, cover = String(before.cover!.assetId), count = before.gallery.length;
    const results = await apply(); assert.equal(results.find(result => result.key === 'work-project:public-safety-information-research')!.status, 'updated');
    const row = (await rowFor('work-project:public-safety-information-research'))!; assert.equal(String(row.cover!.assetId), cover); assert.equal(row.gallery.length, count + 1); assert.ok(row.details!.milestones.some(item => item.period === '30 December 2021')); assert.ok(row.details!.milestones.some(item => item.period === '16 March 2025'));
    const snapshot = await Project.find().lean(), uploadsBefore = stores; await apply(); assert.equal(stores, uploadsBefore); assert.deepEqual(await Project.find().lean(), snapshot);
  });
  it('recognizes original homepage detail enrichment and removes only unchanged seed source blocks', async () => {
    const rich = await loadProjectDetailsManifest();
    for (const entry of rich.projects.filter(entry => manifest.projects.some(project => project.key === entry.key))) {
      const record: SeedRecord = { kind: 'Project', key: `project-details:${entry.key}`, payload: entry, files: ['homepage:sources', ...entry.gallery.map(image => image.fileId), ...entry.documents.map(doc => doc.fileId)], reviewTasks: [] };
      await Project.updateOne({ _id: seedId(entry.key) }, { $set: { details: entry.details } });
      await SourceImport.create({ key: record.key, manifestVersion: rich.version, checksum: recordChecksum({ version: rich.version, files: rich.files, records: [] }, record), entityType: 'Project', entityId: seedId(entry.key), references: [], reviewTasks: [] });
    }
    const results = await apply(); assert.ok(results.filter(result => result.key.startsWith('home-project:')).every(result => result.status === 'updated'));
    for (const key of ['home-project:shelter-dignity-advocacy', 'home-project:mianwal-ranjha-sanitation']) {
      const row = (await rowFor(key))!; assert.equal(row.blocks.length, 0); assert.equal(row.details!.sections.length, 0); assert.ok(row.details!.metrics.every(metric => !metric.source));
    }
  });
  it('preserves administrator text, explicit work selections and source blocks', async () => {
    const childKey = 'work-project:child-protection-institutional-advocacy', shelterKey = 'home-project:shelter-dignity-advocacy';
    await Project.updateOne({ _id: seedId(childKey) }, { $set: { 'details.overview': 'Admin story', workAreas: [] } });
    await Project.updateOne({ _id: seedId(shelterKey) }, { $set: { blocks: [{ type: 'paragraph', text: 'Admin block' }] } });
    const result = await apply(); assert.equal(result.find(result => result.key === childKey)!.status, 'updated-admin-content-preserved');
    assert.equal((await rowFor(childKey))!.details!.overview, 'Admin story'); assert.deepEqual((await rowFor(childKey))!.workAreas, []); assert.equal((await rowFor(shelterKey))!.blocks[0]!.text, 'Admin block');
  });
  it('does not trust previous generated text if its checkpoint was changed', async () => {
    const first = await loadClientProjectEvidence(), firstUploads = await clientEvidenceFiles(first, fileURLToPath(homepageAssetRoot));
    await applyClientProjectEvidence({ manifest: first, uploads: firstUploads, actorId, namespace: 'hrpf/dev', provider });
    const key = 'work-project:public-safety-information-research', before = (await rowFor(key))!.toObject().details;
    await SourceImport.updateOne({ key: 'client-evidence-v1:' + key }, { $set: { checksum: 'b'.repeat(64) } });
    const result = await apply(); assert.equal(result.find(result => result.key === key)!.status, 'updated-admin-content-preserved'); assert.deepEqual((await rowFor(key))!.toObject().details, before);
  });
});
