import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Asset, AuditLog, Counter, Project, SourceImport, User } from '../domain/models.js';
import { workAreaSlugs } from '../domain/work-areas.js';
import { loadProjectDetailsManifest, type ProjectDetailsManifest } from './project-details.js';
import { projectDetailsInput } from '../http/project-details.js';
import { digest } from '../security/crypto.js';
import { can } from '../security/permissions.js';
import { bindProjectMedia } from '../services/project-media.js';
import { bumpPublicRevision } from '../services/public-cache.js';
import { inspectUpload, type Upload, type UploadProvider } from '../services/uploads.js';
import { verifySources } from './files.js';
import { loadHomepageManifest, homepageAssetRoot } from './homepage.js';
import { recordChecksum, seedId, sourceFileSchema, type Manifest, type SeedRecord } from './manifest.js';
import { loadLegacyWorkProjectsManifest, loadWorkProjectsManifest } from './work-projects.js';

const schema = z.object({
  version: z.enum(['client-project-evidence-v1', 'client-project-evidence-v2', 'client-project-evidence-v3']),
  files: z.array(sourceFileSchema).min(1),
  projects: z.array(z.object({
    key: z.string().regex(/^(work-project|home-project):[a-z0-9-]+$/),
    clientNumber: z.string().max(100).optional(),
    sourceLinks: z.array(z.url().refine(value => ['www.facebook.com', 'www.linkedin.com'].includes(new URL(value).hostname) && new URL(value).protocol === 'https:')).min(1),
    retrieval: z.enum(['unavailable', 'verified', 'partial', 'mismatch']),
    patch: z.object({ summary: z.object({ en: z.string().min(1).max(2000) }).strict().optional(), details: projectDetailsInput.optional(), blocks: z.array(z.never()).length(0).optional(), workAreas: z.array(z.enum(workAreaSlugs)).max(8).refine(values => new Set(values).size === values.length).optional() }).strict(),
    images: z.array(z.object({ fileId: z.string(), alt: z.string().min(1).max(300), caption: z.string().max(500) }).strict()).max(10),
  }).strict()).min(1).max(31),
}).strict();
export type EvidenceManifest = z.infer<typeof schema>;
type Entry = EvidenceManifest['projects'][number];
type Status = 'would-update' | 'updated' | 'updated-admin-content-preserved' | 'already-updated' | 'evidence-unavailable' | 'deleted-preserved' | 'withdrawn-preserved' | 'unmanaged-preserved' | 'source-changed' | 'version-conflict' | 'gallery-full-preserved';
export type EvidenceResult = { key: string; status: Status; preservedFields?: string[] };
const checkpointKey = (entry: Entry, version = 'client-project-evidence-v1') => `${version.replace('client-project-evidence-', 'client-evidence-')}:${entry.key}`;
function sourceRecord(entry: Entry, version = 'client-project-evidence-v1'): SeedRecord {
  return { kind: 'Project', key: checkpointKey(entry, version), payload: entry, files: entry.images.map(image => image.fileId), reviewTasks: [] };
}
function checksum(manifest: EvidenceManifest, entry: Entry) {
  return recordChecksum({ version: manifest.version, files: manifest.files, records: [] }, sourceRecord(entry, manifest.version));
}
async function loadEvidence(filename: string, version: EvidenceManifest['version']) {
  const manifest = schema.parse(JSON.parse(await readFile(new URL('../../seed/' + filename, import.meta.url), 'utf8')));
  if (manifest.version !== version) throw new Error('Unexpected evidence revision.');
  // This public-research batch supplies media only; earlier narrative revisions stay intact.
  if (version === 'client-project-evidence-v3' && manifest.projects.some(entry => Object.keys(entry.patch).length)) throw new Error('The third evidence revision is image-only.');
  const allowed = new Set((await originalManifests()).flatMap(source => source.records.filter(record => record.kind === 'Project').map(record => record.key)));
  if (manifest.projects.some(entry => !allowed.has(entry.key))) throw new Error('Unknown existing project identity.');
  const ids = new Set(manifest.files.map(file => file.id));
  if (ids.size !== manifest.files.length || new Set(manifest.projects.map(entry => entry.key)).size !== manifest.projects.length) throw new Error('Duplicate evidence identity.');
  const used = manifest.projects.flatMap(entry => entry.images.map(image => image.fileId));
  if (used.length !== manifest.files.length || new Set(used).size !== used.length) throw new Error('Each evidence image must belong to one project.');
  for (const entry of manifest.projects) {
    if (new Set(entry.images.map(image => image.fileId)).size !== entry.images.length || new Set(entry.images.map(image => manifest.files.find(file => file.id === image.fileId)?.sha256)).size !== entry.images.length) throw new Error('Duplicate project image.');
    for (const image of entry.images) {
      const file = manifest.files.find(file => file.id === image.fileId);
      if (!file || !/\.(jpeg|jpg|webp|png)$/.test(file.path)) throw new Error('A verified project image is required.');
    }
  }
  return manifest;
}
export const loadClientProjectEvidence = () => loadEvidence('client-project-evidence.json', 'client-project-evidence-v1');
export const loadClientProjectEvidenceV2 = () => loadEvidence('client-project-evidence-v2.json', 'client-project-evidence-v2');
export const loadClientProjectEvidenceV3 = () => loadEvidence('client-project-evidence-v3.json', 'client-project-evidence-v3');
const originalManifests = () => Promise.all([loadLegacyWorkProjectsManifest(), loadWorkProjectsManifest(), loadHomepageManifest()]);
export async function clientEvidenceFiles(manifest: EvidenceManifest, root: string) {
  const checks = await verifySources({ version: manifest.version, files: manifest.files, records: [] } as Manifest, root);
  if (checks.some(file => file.status !== 'verified')) throw new Error('Client evidence file verification failed.');
  const uploads = new Map<string, Upload>();
  for (const file of manifest.files) {
    const bytes = await readFile(resolve(root, file.path));
    const mime = /\.jpe?g$/.test(file.path) ? 'image/jpeg' : file.path.endsWith('.png') ? 'image/png' : 'image/webp';
    const upload = { bytes, filename: file.path, mime };
    if (bytes.length !== file.bytes || digest(bytes) !== file.sha256) throw new Error('Client evidence bytes changed.');
    await inspectUpload(upload);
    uploads.set(file.id, upload);
  }
  return uploads;
}
async function actorAllowed(actorId: string, session?: mongoose.ClientSession) {
  const actor = await User.findOne({ _id: actorId, active: true }).session(session ?? null);
  if (!actor || !can(actor.role, 'content')) throw new Error('An active content administrator or editor is required.');
}
async function state(manifest: EvidenceManifest, entry: Entry, originals: Manifest[], session?: mongoose.ClientSession) {
  const row = await Project.findById(seedId(entry.key)).session(session ?? null);
  const checkpoint = await SourceImport.findOne({ key: checkpointKey(entry, manifest.version) }).session(session ?? null);
  if (checkpoint) return { row, status: !row ? 'deleted-preserved' : checkpoint.checksum === checksum(manifest, entry) ? 'already-updated' : 'source-changed' } as const;
  const original = await SourceImport.findOne({ key: entry.key, entityType: 'Project', entityId: seedId(entry.key) }).session(session ?? null);
  const base = originals.flatMap(source => source.records).find(record => record.key === entry.key)!;
  if (!original || !originals.some(source => { const record = source.records.find(record => record.key === entry.key); return record && original.checksum === recordChecksum(source, record); }) || (row && (row.slug !== base.payload.slug || row.locale !== 'en'))) return { row, status: 'unmanaged-preserved' } as const;
  if (!row) return { row, status: 'deleted-preserved' } as const;
  if (row.status !== 'published' || row.reviewStatus !== 'approved' || !row.publishedAt || row.publishedAt > new Date()) return { row, status: 'withdrawn-preserved' } as const;
  if (!entry.images.length && !Object.keys(entry.patch).length) return { row, status: 'evidence-unavailable' } as const;
  const existing = new Set([row.cover?.sha256, ...row.gallery.map(image => image.asset.sha256)]);
  const missing = entry.images.filter(image => !existing.has(manifest.files.find(file => file.id === image.fileId)!.sha256));
  if (row.gallery.length + missing.length - (!row.cover && missing.length ? 1 : 0) > 20) return { row, status: 'gallery-full-preserved' } as const;
  return { row, status: 'would-update' } as const;
}
export async function planClientProjectEvidence(manifest: EvidenceManifest) {
  const originals = await originalManifests();
  return Promise.all(manifest.projects.map(async entry => ({ key: entry.key, status: (await state(manifest, entry, originals)).status })));
}
const value = (row: mongoose.Document, field: string) => JSON.parse(JSON.stringify(row.get(field) ?? null));
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
async function isManagedField(row: mongoose.Document, entry: Entry, field: 'summary' | 'details' | 'workAreas' | 'blocks', originals: Manifest[], previous: EvidenceManifest | undefined, rich: ProjectDetailsManifest | undefined, session: mongoose.ClientSession) {
  const current = value(row, field);
  for (const source of originals) {
    const record = source.records.find(record => record.key === entry.key);
    if (record && equal(current, value(new Project(record.payload), field))) return true;
  }
  const prior = previous?.projects.find(prior => prior.key === entry.key);
  if (previous && prior?.patch[field]) {
    const saved = await SourceImport.findOne({ key: checkpointKey(prior, previous.version), entityType: 'Project', entityId: seedId(entry.key), checksum: checksum(previous, prior) }).session(session);
    if (saved && equal(current, value(new Project(prior.patch), field))) return true;
  }
  const detail = rich?.projects.find(prior => prior.key === entry.key);
  if (rich && detail && field === 'details') {
    const record: SeedRecord = { kind: 'Project', key: `project-details:${entry.key}`, payload: detail, files: ['homepage:sources', ...detail.gallery.map(image => image.fileId), ...detail.documents.map(doc => doc.fileId)], reviewTasks: [] };
    const saved = await SourceImport.findOne({ key: record.key, entityType: 'Project', entityId: seedId(entry.key), checksum: recordChecksum({ version: rich.version, files: rich.files, records: [] }, record) }).session(session);
    if (saved && equal(current, value(new Project({ details: detail.details }), field))) return true;
  }
  return false;
}
// A separate checkpoint updates existing seed-owned rows exactly once. The original
// import remains immutable. Withdrawals/deletions and administrator text/images win.
export async function applyClientProjectEvidence(options: {
  manifest: EvidenceManifest; uploads: Map<string, Upload>; actorId: string;
  namespace: string; provider: UploadProvider; report?: (result: EvidenceResult) => void;
}) {
  const { manifest, uploads, actorId, namespace, provider } = options;
  if (namespace !== 'hrpf/dev') throw new Error('Client evidence updates are limited to hrpf/dev.');
  await actorAllowed(actorId);
  for (const file of manifest.files) {
    const upload = uploads.get(file.id);
    if (!upload || upload.bytes.length !== file.bytes || digest(upload.bytes) !== file.sha256) throw new Error('Client evidence bytes changed.');
    await inspectUpload(upload);
  }
  const originals = await originalManifests();
  const previous = manifest.version === 'client-project-evidence-v2' ? await loadClientProjectEvidence() : undefined;
  const rich = manifest.projects.some(entry => entry.key.startsWith('home-project:')) ? await loadProjectDetailsManifest() : undefined;
  const results: EvidenceResult[] = [];
  for (const entry of manifest.projects) {
    const initial = await state(manifest, entry, originals);
    if (initial.status !== 'would-update' || !initial.row) {
      const result = { key: entry.key, status: initial.status }; results.push(result); options.report?.(result); continue;
    }
    const expectedVersion = initial.row.__v;
    const existing = new Set([initial.row.cover?.sha256, ...initial.row.gallery.map(image => image.asset.sha256)]);
    const missing = entry.images.filter(image => !existing.has(manifest.files.find(file => file.id === image.fileId)!.sha256));
    const assetIds = new Map<string, string>();
    for (const image of missing) {
      await actorAllowed(actorId);
      const file = manifest.files.find(file => file.id === image.fileId)!, upload = uploads.get(file.id)!;
      let asset = await Asset.findOne({ ownerId: actorId, entityType: 'Project', entityId: initial.row._id, sha256: file.sha256, purpose: 'content', scanStatus: { $in: ['clean', 'type_checked'] }, claimStatus: 'staged', stagingExpiresAt: { $gt: new Date() } });
      if (!asset) {
        const type = await inspectUpload(upload), stored = await provider.store(upload, `${namespace}/content`, type.ext);
        try { asset = await Asset.create({ ...stored, ...(file.width ? { width: file.width } : {}), ...(file.height ? { height: file.height } : {}), sha256: file.sha256, ownerId: actorId, purpose: 'content', scanStatus: 'type_checked', visibility: 'restricted', entityType: 'Project', entityId: initial.row._id, stagingExpiresAt: new Date(Date.now() + 86400000) }); }
        catch (error) { await provider.remove(stored).catch(() => {}); throw error; }
      }
      assetIds.set(file.id, asset.id);
    }
    const session = await mongoose.startSession();
    let result: EvidenceResult;
    try {
      result = await session.withTransaction(async (): Promise<EvidenceResult> => {
        await Counter.findOneAndUpdate({ key: 'security:user-governance' }, { $inc: { sequence: 1 } }, { session, upsert: true });
        await actorAllowed(actorId, session);
        const current = await state(manifest, entry, originals, session), row = current.row;
        if (current.status !== 'would-update' || !row) return { key: entry.key, status: current.status };
        if (row.__v !== expectedVersion) return { key: entry.key, status: 'version-conflict' };
        const preservedFields: string[] = [], changedFields: string[] = [];
        for (const field of ['summary', 'details', 'workAreas', 'blocks'] as const) {
          if (!entry.patch[field]) continue;
          if (equal(value(row, field), value(new Project(entry.patch), field))) continue;
          if (await isManagedField(row, entry, field, originals, previous, rich, session)) { row.set(field, entry.patch[field]); changedFields.push(field); }
          else preservedFields.push(field);
        }
        const cover = !row.cover ? missing[0] : undefined;
        const gallery = row.gallery.map(image => ({ assetId: image.asset.assetId!.toString(), alt: image.alt, caption: image.caption ?? '' }));
        for (const image of missing.filter(image => image !== cover)) gallery.push({ assetId: assetIds.get(image.fileId)!, alt: image.alt, caption: image.caption });
        if (cover) { row.coverAlt = cover.alt; changedFields.push('cover', 'coverAlt'); }
        if (missing.length) {
          await bindProjectMedia(row, { ...(cover ? { coverAssetId: assetIds.get(cover.fileId)! } : {}), gallery }, actorId, session, 'public');
          changedFields.push('gallery');
        }
        row.__v += 1; await row.validate();
        const saved = await Project.replaceOne({ _id: row._id, __v: expectedVersion, status: 'published', reviewStatus: 'approved' }, row.toObject(), { session });
        if (!saved.matchedCount) throw new Error('Project changed concurrently.');
        await SourceImport.create([{ key: checkpointKey(entry, manifest.version), manifestVersion: manifest.version, checksum: checksum(manifest, entry), entityType: 'Project', entityId: row._id, references: entry.images.map(image => { const { id: _id, ...file } = manifest.files.find(file => file.id === image.fileId)!; return file; }), reviewTasks: [] }], { session });
        await AuditLog.create([{ actorId, action: 'project-evidence.seed-updated', entityType: 'Project', entityId: row.id, outcome: 'success', changedFields }], { session });
        await bumpPublicRevision(session);
        return { key: entry.key, status: preservedFields.length ? 'updated-admin-content-preserved' : 'updated', ...(preservedFields.length ? { preservedFields } : {}) };
      });
    } finally { await session.endSession(); }
    results.push(result); options.report?.(result);
  }
  return results;
}
export { homepageAssetRoot };
