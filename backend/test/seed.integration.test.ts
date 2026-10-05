import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { AuditLog, BoardMember, Certificate, ContentPage, GalleryItem, Setting, SourceImport, ensureIndexes } from '../src/domain/models.js';
import { importManifest, importRecord } from '../src/seed/importer.js';
import { loadManifest, seedId, type Manifest } from '../src/seed/manifest.js';
let mongo: MongoMemoryReplSet, manifest: Manifest;
describe('M3 transactional seed preservation and recovery', { timeout: 120000 }, () => {
  before(async () => {
    manifest = await loadManifest();
    mongo = await MongoMemoryReplSet.create({ binary: { version: '8.0.5' }, replSet: { count: 1 }, instanceOpts: [{ args: ['--nounixsocket', '--setParameter', 'diagnosticDataCollectionEnabled=false'] }] });
    mongoose.set('bufferCommands', false); mongoose.set('sanitizeFilter', false);
    await mongoose.connect(mongo.getUri(), { dbName: `hrpf_seed_test_${randomUUID().replaceAll('-', '')}`, autoIndex: false, autoCreate: false });
    await ensureIndexes();
  });
  after(async () => { await mongoose.disconnect(); if (mongo) await mongo.stop(); });
  beforeEach(async () => { for (const model of Object.values(mongoose.models)) await model.deleteMany({}); });
  it('database dry run writes no drafts, checkpoints or audit entries', async () => {
    const results = await importManifest(manifest, false);
    assert.equal(results.filter(r => r.status === 'would-create').length, 231);
    for (const model of Object.values(mongoose.models)) assert.equal(await model.countDocuments(), 0);
  });
  it('imports every draft once, resolves all duplicates and makes no operational or asset records', async () => {
    const results = await importManifest(manifest, true);
    assert.equal(results.filter(r => r.status === 'created').length, 231);
    assert.equal(await SourceImport.countDocuments(), 231); assert.equal(await AuditLog.countDocuments(), 231);
    assert.equal(await GalleryItem.countDocuments(), 200); assert.equal(await BoardMember.countDocuments({ isActive: false }), 7);
    for (const record of manifest.records.filter(r => r.duplicateOf)) {
      const image = await GalleryItem.findOne({ seedKey: record.key }).lean();
      assert.equal(image!.duplicateOf!.toString(), seedId(record.duplicateOf!).toString()); assert.equal(image!.reviewStatus, 'hidden');
    }
    assert.equal(await GalleryItem.countDocuments({ publishedAt: { $exists: true } }), 0);
    assert.equal(await Setting.countDocuments({ visibility: 'private' }), 4);
    for (const name of ['User', 'Member', 'MembershipApplication', 'Complaint', 'Asset', 'EmailOutbox', 'Counter']) assert.equal(await mongoose.model(name).countDocuments(), 0);
    const again = await importManifest(manifest, true);
    assert.ok(again.every(r => r.status === 'preserved')); assert.equal(await AuditLog.countDocuments(), 231);
  });
  it('preserves edited names, order, captions, settings and deletions, and reports source drift', async () => {
    await importManifest(manifest, true);
    await BoardMember.updateOne({ seedKey: manifest.records[0]!.key }, { $set: { name: 'Administrator name', rank: 99, isActive: true } });
    const galleryRecord = manifest.records.find(r => r.kind === 'GalleryItem')!;
    await GalleryItem.updateOne({ seedKey: galleryRecord.key }, { $set: { caption: { en: 'Administrator caption' }, reviewStatus: 'hidden' } });
    await Setting.updateOne({ key: 'donations' }, { $set: { value: { bank: 'Administrator bank' }, revision: 9 } });
    await ContentPage.updateOne({ key: 'mission', locale: 'en' }, { $set: { title: 'Administrator title', revision: 9 } });
    const deleted = manifest.records.find(r => r.kind === 'Certificate')!;
    await Certificate.deleteOne({ seedKey: deleted.key });
    const changed = structuredClone(manifest); changed.records[0]!.payload.name = 'Revised source';
    const result = await importManifest(changed, true);
    assert.equal(result.find(r => r.key === manifest.records[0]!.key)!.status, 'source-changed');
    assert.equal(result.find(r => r.key === deleted.key)!.status, 'deleted-preserved');
    assert.equal((await BoardMember.findOne({ seedKey: manifest.records[0]!.key }))!.name, 'Administrator name');
    assert.equal((await GalleryItem.findOne({ seedKey: galleryRecord.key }))!.caption!.en, 'Administrator caption');
    assert.deepEqual((await Setting.findOne({ key: 'donations' }))!.value, { bank: 'Administrator bank' });
    assert.equal((await ContentPage.findOne({ key: 'mission' }))!.title, 'Administrator title');
    assert.equal(await Certificate.countDocuments(), 3); assert.equal(await AuditLog.countDocuments(), 231);
  });
  it('resumes an interrupted run from atomic checkpoints', async () => {
    const first = { ...manifest, records: manifest.records.filter(r => !r.duplicateOf).slice(0, 20) };
    await importManifest(first, true);
    const resumed = await importManifest(manifest, true);
    assert.equal(resumed.filter(r => r.status === 'created').length, 211);
    assert.equal(resumed.filter(r => r.status === 'preserved').length, 20);
    assert.equal(await SourceImport.countDocuments(), 231);
  });
  it('parallel runs commit one draft, checkpoint and audit entry', async () => {
    const record = manifest.records[0]!;
    const results = await Promise.all(Array.from({ length: 6 }, () => importRecord(manifest, record, true)));
    assert.equal(results.filter(r => r.status === 'created').length, 1); assert.equal(results.filter(r => r.status === 'preserved').length, 5);
    assert.equal(await BoardMember.countDocuments(), 1); assert.equal(await SourceImport.countDocuments(), 1); assert.equal(await AuditLog.countDocuments(), 1);
  });
  it('a checkpoint failure rolls back the draft and allows a later clean retry', async () => {
    const bad = structuredClone(manifest), record = bad.records[0]!;
    bad.files.find(f => f.id === record.files[0])!.bytes = -1;
    await assert.rejects(importRecord(bad, record, true));
    assert.equal(await BoardMember.countDocuments(), 0); assert.equal(await SourceImport.countDocuments(), 0); assert.equal(await AuditLog.countDocuments(), 0);
    assert.equal((await importRecord(manifest, manifest.records[0]!, true)).status, 'created');
  });
  it('preserves unmanaged admin entries and rejects a native slug collision without a checkpoint', async () => {
    const record = manifest.records[0]!;
    await BoardMember.create({ ...record.payload, seedKey: 'admin:other', name: 'Native admin record', isActive: true });
    assert.equal((await importRecord(manifest, record, false)).status, 'conflict');
    assert.equal((await importRecord(manifest, record, true)).status, 'conflict');
    assert.equal(await BoardMember.countDocuments(), 1); assert.equal(await SourceImport.countDocuments(), 0);
    const setting = manifest.records.find(r => r.key === 'setting:donations')!;
    await Setting.create({ key: 'donations', value: { bank: 'Existing bank' }, visibility: 'public' });
    assert.equal((await importRecord(manifest, setting, true)).status, 'unmanaged-preserved');
    assert.deepEqual((await Setting.findOne({ key: 'donations' }))!.value, { bank: 'Existing bank' });
  });
  it('does not recreate a deleted canonical image to satisfy a duplicate', async () => {
    const duplicate = manifest.records.find(r => r.duplicateOf)!;
    const target = manifest.records.find(r => r.key === duplicate.duplicateOf)!;
    await importRecord(manifest, target, true); await GalleryItem.deleteOne({ seedKey: target.key });
    assert.equal((await importRecord(manifest, target, true)).status, 'deleted-preserved');
    assert.equal((await importRecord(manifest, duplicate, false)).status, 'conflict');
    assert.equal((await importRecord(manifest, duplicate, true)).status, 'conflict');
    assert.equal(await GalleryItem.countDocuments(), 0); assert.equal(await SourceImport.countDocuments(), 1);
  });
});
