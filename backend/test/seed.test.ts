import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GalleryItem } from '../src/domain/models.js';
import { loadManifest, recordChecksum, validateManifest, type Manifest } from '../src/seed/manifest.js';
import { prepareAssets, verifySources } from '../src/seed/files.js';
describe('M3 source safety and offline preparation', () => {
  it('preserves authoritative board order, draft status, gallery treatments and document dates', async () => {
    const m = await loadManifest();
    assert.equal(m.records.length, 231); assert.equal(m.files.length, 227);
    const board = m.records.filter(r => r.kind === 'BoardMember');
    assert.deepEqual(board.map(r => [r.payload.name, r.payload.rank]), [
      ['Muhammad Yousaf Badar', 1], ['Munawar Ahmad', 2], ['Dr. Sidra Mubashir', 3], ['Dr. Iqra Mubashar', 4], ['Hamza Uzair Badr', 5], ['Nasar Iqbal Gondal', 6], ['Imdad Ullah Bhutta', 7],
    ]);
    assert.equal(board[2]!.payload.designation, 'Joint Chairperson'); assert.equal(board[2]!.payload.slotLabel, 'Vice Chairman');
    assert.ok(board.every(r => r.payload.isActive === false));
    const gallery = m.records.filter(r => r.kind === 'GalleryItem');
    assert.equal(gallery.filter(r => r.payload.category === 'media-coverage').length, 57);
    assert.equal(gallery.filter(r => r.payload.category === 'in-action').length, 143);
    assert.equal(gallery.filter(r => r.duplicateOf).length, 24);
    assert.equal(gallery.filter(r => r.payload.treatment === 'AI_RESTORATION').length, 17);
    assert.ok(gallery.filter(r => r.duplicateOf).every(r => r.payload.reviewStatus === 'hidden'));
    assert.ok(gallery.every(r => r.payload.sourceWidth && r.payload.sourceHeight && !r.payload.asset));
    assert.equal(m.records.filter(r => r.kind === 'Certificate').length, 4);
    assert.equal(m.records.find(r => r.key === 'certificate:punjab-charity-2024')!.payload.expiresAt, '2026-01-22T00:00:00.000Z');
    const fbr = m.records.find(r => r.key === 'certificate:pcp-npo-evaluation')!;
    assert.equal(fbr.payload.reference, undefined); assert.equal(fbr.payload.issuedAt, undefined);
    const aims = m.records.find(r => r.key === 'page:en:aims-and-objectives')!;
    const objectives = (aims.payload.blocks as { type: string; items?: string[] }[]).find(block => block.type === 'list')!.items!;
    const publicObjectives = JSON.parse(await readFile(new URL('../../frontend/data/aims-and-objectives.json', import.meta.url), 'utf8')).objectives;
    assert.equal(objectives.length, 42);
    assert.deepEqual(objectives, publicObjectives, 'Public and archived source objectives must agree');
    assert.equal(aims.payload.reviewStatus, 'pending');
    assert.equal(m.records.find(r => r.key === 'setting:membershipPolicy'), undefined);
    assert.ok(m.records.every(r => !r.payload.publishedAt));
  });
  it('rejects unsafe paths, activation, provider fields and invalid duplicate references', async () => {
    const manifest = await loadManifest();
    for (const path of ['../secret', '/tmp/secret', 'information/database and cloudinary.txt', 'information/../secret', 'information\\logo.jpeg']) {
      const m = structuredClone(manifest); m.files[0]!.path = path;
      await assert.rejects(validateManifest(m));
    }
    for (const mutate of [
      (m: Manifest) => { m.records[0]!.payload.isActive = true; },
      (m: Manifest) => { m.records[0]!.payload.photo = {}; },
      (m: Manifest) => { m.records[0]!.payload.publishedAt = '2026-01-01'; },
      (m: Manifest) => { m.records.find(r => r.duplicateOf)!.duplicateOf = 'gallery:missing'; },
      (m: Manifest) => { m.records.find(r => r.kind === 'Setting')!.payload.visibility = 'public'; },
    ]) { const m = structuredClone(manifest); mutate(m); await assert.rejects(validateManifest(m)); }
    const gallery = manifest.records.find(r => r.kind === 'GalleryItem')!;
    await assert.rejects(new GalleryItem({ ...gallery.payload, reviewStatus: 'approved', publishedAt: new Date() }).validate());
  });
  it('detects content/source changes independent of object property order', async () => {
    const m = await loadManifest(), r = m.records[0]!;
    const same = structuredClone(r); same.payload = Object.fromEntries(Object.entries(same.payload).reverse());
    assert.equal(recordChecksum(m, r), recordChecksum(m, same));
    same.payload.name = 'Changed'; assert.notEqual(recordChecksum(m, r), recordChecksum(m, same));
    const changed = structuredClone(m); changed.files[0]!.sha256 = 'a'.repeat(64);
    assert.notEqual(recordChecksum(m, r), recordChecksum(changed, r));
  });
  it('verifies exact bytes, blocks escaping symlinks, resumes preparation and preserves changed output', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hrpf-seed-')), outside = await mkdtemp(join(tmpdir(), 'hrpf-outside-'));
    await mkdir(join(root, 'information'));
    const bytes = Buffer.from('synthetic source bytes'), file = { id: 'branding:logo', path: 'information/logo.jpeg', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
    const m: Manifest = { version: 'test', files: [file], records: [] };
    assert.equal((await verifySources(m, root))[0]!.status, 'missing');
    await writeFile(join(root, file.path), bytes);
    assert.equal((await verifySources(m, root))[0]!.status, 'verified');
    const output = join(root, 'prepared');
    assert.equal(await prepareAssets(m, root, output), 1); assert.equal(await prepareAssets(m, root, output), 1);
    const plan = JSON.parse(await readFile(join(output, 'asset-plan.json'), 'utf8'));
    assert.equal(plan.candidates[0].uploadStatus, 'not-uploaded'); assert.equal(plan.candidates[0].reviewStatus, 'pending');
    const prepared = join(output, plan.candidates[0].filename);
    await writeFile(prepared, 'administrator edit');
    await assert.rejects(prepareAssets(m, root, output)); assert.equal(await readFile(prepared, 'utf8'), 'administrator edit');
    await writeFile(join(root, file.path), 'changed'); assert.equal((await verifySources(m, root))[0]!.status, 'mismatch');
    await writeFile(join(outside, 'secret'), bytes);
    await symlink(join(outside, 'secret'), join(root, 'information/escape.jpeg'));
    assert.equal((await verifySources({ ...m, files: [{ ...file, path: 'information/escape.jpeg' }] }, root))[0]!.status, 'unsafe-path');
  });
});
