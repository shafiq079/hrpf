import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Asset, AuditLog, Counter, Project, SourceImport, User } from '../domain/models.js';
import { projectWorkAreas, workAreaSlugs } from '../domain/work-areas.js';
import { can } from '../security/permissions.js';
import { digest } from '../security/crypto.js';
import { bumpPublicRevision } from '../services/public-cache.js';
import { bindProjectMedia } from '../services/project-media.js';
import { inspectUpload, type UploadProvider } from '../services/uploads.js';
import { imageMime, loadHomepageManifest } from './homepage.js';
import { recordChecksum, seedId, sourceFileSchema, type Manifest } from './manifest.js';

const schema = z.object({
  version: z.literal('project-presentations-v1'), files: z.array(sourceFileSchema).max(31),
  projects: z.array(z.object({ key: z.string().min(1), workAreas: z.array(z.enum(workAreaSlugs)).max(8),
    cover: z.object({ fileId: z.string(), alt: z.string().trim().min(1).max(300) }).strict().nullable(),
    verification: z.string().min(1).max(1000),
  }).strict()).length(31),
}).strict();
export type PresentationReview = z.infer<typeof schema>;
export async function loadProjectPresentations() {
  const review = schema.parse(JSON.parse(await readFile(new URL('../../seed/project-presentations.json', import.meta.url), 'utf8')));
  const keys = new Set(review.projects.map(entry => entry.key)), ids = new Set(review.files.map(file => file.id));
  if (keys.size !== 31 || ids.size !== review.files.length) throw new Error('Duplicate project presentation identity.');
  for (const entry of review.projects) {
    if ((!entry.key.startsWith('home-project:') && !entry.key.startsWith('work-project:')) || new Set(entry.workAreas).size !== entry.workAreas.length || (entry.cover && !ids.has(entry.cover.fileId))) throw new Error('Invalid project presentation mapping.');
  }
  return review;
}
async function actorAllowed(actorId: string, session?: mongoose.ClientSession) {
  const actor = await User.findOne({ _id: actorId, active: true }).session(session ?? null);
  if (!actor || !can(actor.role, 'content')) throw new Error('An active content administrator or editor is required.');
}
async function guard(actorId: string, session: mongoose.ClientSession) {
  await Counter.findOneAndUpdate({ key: 'security:user-governance' }, { $inc: { sequence: 1 } }, { session, upsert: true });
  await actorAllowed(actorId, session);
}
export async function verifyPresentationBytes(review: PresentationReview, files: Map<string, Buffer>) {
  for (const source of review.files) {
    const bytes = files.get(source.id);
    if (!bytes || bytes.length !== source.bytes || digest(bytes) !== source.sha256) throw new Error('A verified project photograph is missing.');
    await inspectUpload({ bytes, filename: source.path, mime: imageMime(source.path) });
  }
}
/** Accept only a known v1 checksum. Upgrade provenance without overwriting admin content. */
export async function upgradeWorkCheckpoints(legacy: Manifest, current: Manifest, actorId: string) {
  await actorAllowed(actorId);
  for (const old of legacy.records) {
    const modern = current.records.find(record => record.key === old.key)!, checksum = recordChecksum(legacy, old);
    if (!await SourceImport.exists({ key: old.key, checksum, entityId: seedId(old.key), entityType: 'Project' })) continue;
    await mongoose.connection.transaction(async session => {
      await guard(actorId, session);
      const checkpoint = await SourceImport.findOne({ key: old.key, checksum, entityId: seedId(old.key), entityType: 'Project' }).session(session);
      if (!checkpoint) return;
      checkpoint.checksum = recordChecksum(current, modern); checkpoint.manifestVersion = current.version;
      checkpoint.set('references', modern.files.map(id => { const { id: _id, ...source } = current.files.find(file => file.id === id)!; return source; }));
      await checkpoint.save({ session });
      // Resume only an interrupted untouched draft, leaving its original timestamps.
      await Project.updateOne({ _id: checkpoint.entityId, __v: 0, status: 'draft', cover: { $exists: false }, $expr: { $eq: ['$createdAt', '$updatedAt'] } },
        { $set: { workAreas: modern.payload.workAreas, coverAlt: modern.payload.coverAlt } }, { session, timestamps: false });
      await bumpPublicRevision(session);
      await AuditLog.create([{ actorId, action: 'work-project.source-upgraded', entityType: 'Project', entityId: checkpoint.entityId.toString(), outcome: 'success', changedFields: ['sourceReferences'] }], { session });
    });
  }
}
export type RepairResult = { key: string; status: 'corrected' | 'unchanged' | 'unmanaged-preserved' | 'deleted-preserved' | 'concurrent-preserved' };
export async function repairProjectPresentations(options: { review: PresentationReview; files: Map<string, Buffer>; actorId: string; namespace: string; provider: UploadProvider; report?: (result: RepairResult) => void }) {
  const { review, files, actorId, namespace, provider } = options;
  if (namespace !== 'hrpf/dev') throw new Error('Project presentation repairs are limited to hrpf/dev.');
  await verifyPresentationBytes(review, files); await actorAllowed(actorId);
  const legacy = JSON.parse(await readFile(new URL('../../seed/work-projects-manifest.json', import.meta.url), 'utf8')) as Manifest;
  const home = await loadHomepageManifest();
  const details = JSON.parse(await readFile(new URL('../../seed/project-details-manifest.json', import.meta.url), 'utf8'));
  const results: RepairResult[] = [];
  for (const entry of review.projects) {
    const originalManifest = entry.key.startsWith('work-project:') ? legacy : home;
    const original = originalManifest.records.find(record => record.key === entry.key);
    if (!original) throw new Error('Unknown seeded project review.');
    const originalImages = original.files.filter(id => id.startsWith('gallery:')).map(id => originalManifest.files.find(file => file.id === id)!.sha256);
    const detailEntry = details.projects.find((project: any) => project.key === entry.key);
    for (const photo of detailEntry?.gallery ?? []) originalImages.push(details.files.find((file: any) => file.id === photo.fileId).sha256);
    const checkpoint = await SourceImport.findOne({ key: entry.key, entityType: 'Project', entityId: seedId(entry.key) }).lean();
    if (!checkpoint) { const result: RepairResult = { key: entry.key, status: 'unmanaged-preserved' }; results.push(result); options.report?.(result); continue; }
    const row = await Project.findById(checkpoint.entityId);
    if (!row) { const result: RepairResult = { key: entry.key, status: 'deleted-preserved' }; results.push(result); options.report?.(result); continue; }
    // A seed audit, owner and creation time prove that the image was seeded.
    // A later admin upload with identical bytes is still preserved.
    const audits = await AuditLog.find({ entityType: 'Project', entityId: row.id, action: { $in: ['homepage.seed-published', 'work-project.seed-published', 'project-details.seed-published'] } }).lean();
    const assets = await Asset.find({ entityType: 'Project', entityId: row._id, sha256: { $in: originalImages }, purpose: 'content', publicId: { $regex: '^hrpf/dev/content/' } }).lean<Array<{ _id: mongoose.Types.ObjectId; ownerId?: mongoose.Types.ObjectId; createdAt: Date }>>();
    const wrongIds = new Set(assets.filter(asset => audits.some(audit => audit.actorId?.toString() === asset.ownerId?.toString() && asset.createdAt <= audit.createdAt)).map(asset => asset._id.toString()));
    const wrongCover = !!row.cover && wrongIds.has(row.cover.assetId.toString());
    const gallery = (row.gallery ?? []).filter(photo => !wrongIds.has(photo.asset.assetId.toString())).map(photo => ({ assetId: photo.asset.assetId.toString(), alt: photo.alt, caption: photo.caption ?? '' }));
    const addPlacements = !Array.isArray(row.workAreas);
    if (!wrongCover && gallery.length === (row.gallery ?? []).length && !addPlacements) { const result: RepairResult = { key: entry.key, status: 'unchanged' }; results.push(result); options.report?.(result); continue; }
    const source = wrongCover && entry.cover ? review.files.find(file => file.id === entry.cover!.fileId) : undefined;
    let replacementId: string | undefined;
    if (source) {
      await actorAllowed(actorId);
      let asset = await Asset.findOne({ ownerId: actorId, entityType: 'Project', entityId: row._id, sha256: source.sha256, bytes: source.bytes, purpose: 'content', deliveryType: 'authenticated', scanStatus: { $in: ['clean', 'type_checked'] }, claimStatus: 'staged', stagingExpiresAt: { $gt: new Date() } });
      if (!asset) {
        const stored = await provider.store({ bytes: files.get(source.id)!, filename: source.path, mime: imageMime(source.path) }, `${namespace}/content`, source.path.split('.').at(-1)!);
        try { asset = await Asset.create({ ...stored, sha256: source.sha256, ownerId: actorId, purpose: 'content', visibility: 'restricted', scanStatus: 'type_checked', entityType: 'Project', entityId: row._id, stagingExpiresAt: new Date(Date.now() + 86400000) }); }
        catch (error) { await provider.remove(stored).catch(() => {}); throw error; }
      }
      replacementId = asset.id;
    }
    const result = await mongoose.connection.transaction(async session => {
      await guard(actorId, session);
      const fresh = await Project.findOne({ _id: row._id, __v: row.__v }).session(session);
      if (!fresh) return { key: entry.key, status: 'concurrent-preserved' } as RepairResult;
      const fields: string[] = [];
      if (addPlacements) { fresh.workAreas = fresh.focusArea === original.payload.focusArea ? entry.workAreas : projectWorkAreas(fresh); fields.push('workAreas'); }
      if (wrongCover || gallery.length !== (row.gallery ?? []).length) {
        await bindProjectMedia(fresh, { coverAssetId: wrongCover ? replacementId ?? null : fresh.cover?.assetId.toString() ?? null, gallery }, actorId, session,
          fresh.status === 'published' && fresh.reviewStatus === 'approved' && fresh.publishedAt && fresh.publishedAt <= new Date() ? 'public' : 'restricted');
        if (wrongCover) { fresh.coverAlt = replacementId ? entry.cover!.alt : ''; fields.push('cover', 'coverAlt'); }
        if (gallery.length !== (row.gallery ?? []).length) fields.push('gallery');
      }
      fresh.__v += 1; await fresh.validate();
      const replaced = await Project.replaceOne({ _id: row._id, __v: row.__v }, fresh.toObject(), { session });
      if (!replaced.matchedCount) throw new Error('Project changed concurrently.');
      await bumpPublicRevision(session);
      await AuditLog.create([{ actorId, action: 'project-presentation.corrected', entityType: 'Project', entityId: fresh.id, outcome: 'success', changedFields: fields }], { session });
      return { key: entry.key, status: 'corrected' } as RepairResult;
    });
    results.push(result); options.report?.(result);
  }
  return results;
}
