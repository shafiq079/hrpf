import { before, after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { AuditLog, User, VideoInterview, ensureIndexes } from '../src/domain/models.js';
import { applyVideoSeed, loadVideoManifest, planVideoSeed, type VideoManifest } from '../src/seed/videos.js';
import type { YouTubeMetadataReader } from '../src/services/youtube-metadata.js';
let mongo: MongoMemoryReplSet, manifest: VideoManifest, actorId: string, calls = 0;
const metadata: YouTubeMetadataReader = async url => {
  calls++;
  const id = new URL(url).searchParams.get('v');
  return { title: `YouTube title ${id}`, sourceName: 'HRPF', thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
};
describe('YouTube seed transactions', { timeout: 120000 }, () => {
  before(async () => {
    manifest = await loadVideoManifest();
    mongo = await MongoMemoryReplSet.create({ binary: { version: '8.0.5' }, replSet: { count: 1 }, instanceOpts: [{ args: ['--nounixsocket', '--setParameter', 'diagnosticDataCollectionEnabled=false'] }] });
    await mongoose.connect(mongo.getUri(), { dbName: 'hrpf_video_seed_test', autoIndex: false });
    await ensureIndexes();
  });
  after(async () => { await mongoose.disconnect(); if (mongo) await mongo.stop(); });
  beforeEach(async () => {
    for (const model of Object.values(mongoose.models)) await model.deleteMany({});
    actorId = (await User.create({ name: 'Test seed admin', email: 'video-seed@example.test', passwordHash: 'synthetic', role: 'admin', active: true })).id;
    calls = 0;
  });
  it('publishes 28 correctly assigned videos, then preserves edits, ordering and hidden state on rerun', async () => {
    assert.equal((await planVideoSeed(manifest)).filter(r => r.status === 'planned').length, 28);
    assert.equal((await applyVideoSeed(manifest, actorId, metadata)).filter(r => r.status === 'created').length, 28);
    assert.equal(await VideoInterview.countDocuments({ category: 'tv-interviews' }), 5);
    assert.equal(await VideoInterview.countDocuments({ category: 'media-coverage' }), 23);
    assert.equal(await AuditLog.countDocuments({ action: 'interviews.seed' }), 28);
    await VideoInterview.updateOne({ videoUrl: manifest.videos[0]!.videoUrl }, { $set: { sortOrder: 77, category: 'media-coverage', reviewStatus: 'pending', title: { en: 'Admin edit' } }, $unset: { publishedAt: 1 } });
    assert.equal((await applyVideoSeed(manifest, actorId, metadata)).filter(r => r.status === 'preserved').length, 28);
    assert.equal(calls, 28, 'Reruns do not fetch or overwrite preserved videos');
    const row = await VideoInterview.findOne({ videoUrl: manifest.videos[0]!.videoUrl });
    assert.equal(row!.title!.en, 'Admin edit'); assert.equal(row!.sortOrder, 77); assert.equal(row!.category, 'media-coverage'); assert.equal(row!.publishedAt, undefined);
  });
  it('failed metadata creates no placeholders, and only missing records are imported on retry', async () => {
    const first = manifest.videos[0]!.videoUrl;
    const result = await applyVideoSeed(manifest, actorId, async url => { if (url === first) throw new Error('Unavailable'); return metadata(url); });
    assert.equal(result.filter(r => r.status === 'failed').length, 1); assert.equal(await VideoInterview.countDocuments(), 27);
    calls = 0;
    assert.equal((await applyVideoSeed(manifest, actorId, metadata)).filter(r => r.status === 'created').length, 1); assert.equal(calls, 1);
    assert.equal(await VideoInterview.countDocuments(), 28);
  });
  it('preserves a manually added URL without a seed key and refuses an inactive actor atomically', async () => {
    await VideoInterview.create({ videoUrl: manifest.videos[0]!.videoUrl, title: { en: 'Manual record' }, category: 'media-coverage' });
    await User.updateOne({ _id: actorId }, { $set: { active: false } });
    const result = await applyVideoSeed(manifest, actorId, metadata);
    assert.equal(result[0]!.status, 'preserved'); assert.equal(result.filter(r => r.status === 'failed').length, 27);
    assert.equal(await VideoInterview.countDocuments(), 1); assert.equal(await AuditLog.countDocuments(), 0);
  });
});
