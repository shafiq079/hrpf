import { bumpPublicRevision } from '../services/public-cache.js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import { Asset, AuditLog, Counter, GalleryItem, SourceImport, User } from '../domain/models.js';
import { can } from '../security/permissions.js';
import { digest } from '../security/crypto.js';
import { inspectUpload, type UploadProvider } from '../services/uploads.js';
import { bindContentMedia } from '../services/project-media.js';
import { galleryInput } from '../http/media-content.js';
import { verifySources } from './files.js';
import { importRecord, type SeedResult } from './importer.js';
import { recordChecksum, seedId, validateManifest, type Manifest, type SeedRecord } from './manifest.js';
const presentations: Record<string, {
  title: string;
  alt: string;
  caption: string;
  sourceName?: string;
}> = JSON.parse(await readFile(new URL('../../seed/gallery-presentations.json', import.meta.url), 'utf8'));
export const galleryAssetRoot = new URL('../../seed/gallery-assets/', import.meta.url);
export async function loadGalleryManifest(collection: 'archive' | 'preview' = 'archive') {
  const filename = collection === 'preview' ? 'gallery-manifest.json' : 'gallery-archive-manifest.json';
  const manifest = await validateManifest(JSON.parse(await readFile(new URL(`../../seed/${filename}`, import.meta.url), 'utf8')));
  if (manifest.records.length !== (collection === 'preview' ? 4 : 200) ||
      manifest.records.some(record => record.kind !== 'GalleryItem' || !presentations[record.duplicateOf ?? record.key])) throw new Error('Invalid Gallery archive manifest.');
  if (collection === 'archive' && (
    manifest.records.filter(record => record.duplicateOf).length !== 24 ||
    manifest.records.filter(record => record.payload.category === 'media-coverage').length !== 57 ||
    manifest.records.filter(record => record.payload.category === 'in-action').length !== 143
  )) throw new Error('Gallery archive counts changed.');
  for (const record of manifest.records) presentation(record);
  return manifest;
}
function presentation(record: SeedRecord) {
  const copy = presentations[record.duplicateOf ?? record.key];
  if (!copy) throw new Error('A Gallery source description is missing.');
  return galleryInput.parse({
    title: {
      en: copy.title
    },
    alt: {
      en: copy.alt
    },
    caption: {
      en: copy.caption
    },
    sourceName: copy.sourceName ?? '',
    category: record.payload.category,
    mediaType: record.payload.sourceImageType,
    treatment: record.payload.treatment,
    sortOrder: record.payload.sortOrder
  });
}
// Keep the original key and checksums: the four published preview records are
// recognised without re-uploading or rewriting an administrator's content.
const previewKey = (record: SeedRecord) => `gallery-preview:${record.key}`;
const checksum = (manifest: Manifest, record: SeedRecord) => digest(Buffer.from(JSON.stringify({
  source: recordChecksum(manifest, record),
  presentation: presentation(record)
})));
async function actorAllowed(id: string, session?: mongoose.ClientSession) {
  const actor = await User.findOne({
    _id: id,
    active: true
  }).session(session ?? null);
  if (!actor || !can(actor.role, 'content')) throw new Error('An active content administrator or editor is required.');
}
async function candidate(manifest: Manifest, record: SeedRecord, session?: mongoose.ClientSession) {
  const source = await SourceImport.findOne({
    key: record.key,
    checksum: recordChecksum(manifest, record),
    entityType: 'GalleryItem',
    entityId: seedId(record.key)
  }).session(session ?? null);
  if (!source) return null;
  const row = await GalleryItem.findOne({
    _id: source.entityId,
    __v: 0,
    reviewStatus: 'pending',
    asset: null,
    publishedAt: null,
    duplicateOf: null
  }).session(session ?? null);
  // Original source import only: native edits, deletion and withdrawal survive reruns.
  return row && (row.get('createdAt') as Date).getTime() === (row.get('updatedAt') as Date).getTime() ? row : null;
}
export async function galleryFiles(manifest: Manifest, root: string) {
  if ((await verifySources(manifest, root)).some(source => source.status !== 'verified')) throw new Error('Gallery source verification failed.');
  const files = new Map<string, Buffer>();
  for (const source of manifest.files.filter(file => file.id.endsWith(':webp'))) {
    const bytes = await readFile(resolve(root, source.path));
    if (bytes.length !== source.bytes || digest(bytes) !== source.sha256) throw new Error('Gallery source bytes changed.');
    await inspectUpload({
      bytes,
      filename: source.path,
      mime: 'image/webp'
    });
    files.set(source.id, bytes);
  }
  for (const record of manifest.records) presentation(record);
  return files;
}
export type GallerySeedResult = SeedResult | {
  key: string;
  status: 'published' | 'admin-preserved' | 'seeded-preserved' | 'would-publish' | 'duplicate-hidden' | 'would-hide-duplicate';
};
async function checkpointResult(manifest: Manifest, record: SeedRecord): Promise<GallerySeedResult | undefined> {
  const prior = await SourceImport.findOne({ key: previewKey(record) });
  if (!prior) return undefined;
  if (prior.entityType !== 'GalleryItem' || prior.entityId.toString() !== seedId(record.key).toString()) return { key: record.key, status: 'conflict' };
  return {
    key: record.key,
    status: !(await GalleryItem.exists({ _id: prior.entityId })) ? 'deleted-preserved' :
      prior.checksum === checksum(manifest, record) ? 'seeded-preserved' : 'source-changed'
  };
}
function orderedRecords(manifest: Manifest) {
  return [...manifest.records.filter(record => !record.duplicateOf), ...manifest.records.filter(record => record.duplicateOf)];
}
async function duplicateResult(record: SeedRecord): Promise<GallerySeedResult> {
  if (!record.duplicateOf) throw new Error('A duplicate source reference is required.');
  const target = await GalleryItem.findOne({ seedKey: record.duplicateOf });
  const hidden = target && await GalleryItem.exists({
    _id: seedId(record.key), __v: 0, reviewStatus: 'hidden',
    duplicateOf: target._id, asset: null, publishedAt: null
  });
  return { key: record.key, status: hidden ? 'duplicate-hidden' : 'admin-preserved' };
}
export async function planGallerySeed(manifest: Manifest): Promise<GallerySeedResult[]> {
  const results: GallerySeedResult[] = [];
  for (const record of orderedRecords(manifest)) {
    const prior = await checkpointResult(manifest, record);
    if (prior) { results.push(prior); continue; }
    const imported = await importRecord(manifest, record, false);
    if (imported.status !== 'preserved') {
      results.push(record.duplicateOf && imported.status === 'would-create' ? { key: record.key, status: 'would-hide-duplicate' } : imported);
      continue;
    }
    if (record.duplicateOf) {
      results.push(await duplicateResult(record));
      continue;
    }
    results.push({
      key: record.key,
      status: (await candidate(manifest, record)) ? 'would-publish' : 'admin-preserved'
    });
  }
  return results;
}
export async function applyGallerySeed(options: {
  manifest: Manifest;
  files: Map<string, Buffer>;
  actorId: string;
  namespace: string;
  provider: UploadProvider;
  report?: (result: GallerySeedResult) => void;
  phase?: (phase: string) => void;
  progress?: (progress: { phase: 'validate'; completed: number; total: number; key: string }) => void;
}) {
  const {
    manifest,
    files,
    actorId,
    namespace,
    provider
  } = options;
  if (namespace !== 'hrpf/dev') throw new Error('Gallery archive setup is limited to hrpf/dev.');
  await actorAllowed(actorId);
  options.phase?.('validate');
  // Verify and inspect the complete batch before any DB or provider write.
  let inspected = 0;
  for (const record of manifest.records) {
    const source = manifest.files.find(file => record.files.includes(file.id) && file.id.endsWith(':webp'));
    const bytes = source && files.get(source.id);
    if (!source || !bytes || bytes.length !== source.bytes || digest(bytes) !== source.sha256) throw new Error('A verified Gallery image is missing.');
    presentation(record);
    await inspectUpload({
      bytes,
      filename: source.path,
      mime: 'image/webp'
    });
    options.progress?.({ phase: 'validate', completed: ++inspected, total: manifest.records.length, key: record.key });
  }
  const results: GallerySeedResult[] = [];
  for (const record of orderedRecords(manifest)) {
    options.phase?.('database');
    // A full-archive validation can take time; permission may have changed meanwhile.
    await actorAllowed(actorId);
    const prior = await checkpointResult(manifest, record);
    let result: GallerySeedResult;
    if (prior) result = prior; else {
      const imported = await importRecord(manifest, record, true);
      if (!['created', 'preserved'].includes(imported.status)) result = imported; else if (record.duplicateOf) result = await duplicateResult(record); else if (!(await candidate(manifest, record))) result = {
        key: record.key,
        status: 'admin-preserved'
      };else {
        const source = manifest.files.find(file => record.files.includes(file.id) && file.id.endsWith(':webp'))!;
        await actorAllowed(actorId);
        let asset = await Asset.findOne({
          ownerId: actorId,
          entityType: 'GalleryItem',
          entityId: seedId(record.key),
          sha256: source.sha256,
          purpose: 'content',
          scanStatus: { $in: ['clean', 'type_checked'] },
          claimStatus: 'staged',
          stagingExpiresAt: {
            $gt: new Date()
          }
        });
        if (!asset) {
          options.phase?.('upload');
          const stored = await provider.store({
            bytes: files.get(source.id)!,
            filename: source.path,
            mime: 'image/webp'
          }, `${namespace}/content`, 'webp');
          try {
            asset = await Asset.create({
              ...stored,
              sha256: source.sha256,
              ownerId: actorId,
              purpose: 'content',
              visibility: 'restricted',
              scanStatus: 'type_checked',
              entityType: 'GalleryItem',
              entityId: seedId(record.key),
              stagingExpiresAt: new Date(Date.now() + 86400000)
            });
          } catch (error) {
            await provider.remove(stored).catch(() => {});
            throw error;
          }
        }
        options.phase?.('publication');
        const session = await mongoose.startSession();
        try {
          result = (await session.withTransaction(async (): Promise<GallerySeedResult> => {
            await bumpPublicRevision(session);
            await Counter.findOneAndUpdate({
              key: 'security:user-governance'
            }, {
              $inc: {
                sequence: 1
              }
            }, {
              session,
              upsert: true
            });
            await actorAllowed(actorId, session);
            const row = await candidate(manifest, record, session);
            if (!row || (await SourceImport.exists({
              key: previewKey(record)
            }).session(session))) return {
              key: record.key,
              status: 'admin-preserved'
            };
            row.set(presentation(record));
            const media = {
              _id: row._id,
              cover: row.asset,
              gallery: [],
              documents: []
            };
            await bindContentMedia(media, {
              coverAssetId: asset!.id
            }, actorId, session, 'public', 'GalleryItem');
            row.set('asset', media.cover);
            row.reviewStatus = 'approved';
            row.publishedAt = new Date();
            row.__v = 1;
            await row.validate();
            const updated = await GalleryItem.replaceOne({
              _id: row._id,
              __v: 0
            }, row.toObject(), {
              session
            });
            if (!updated.matchedCount) throw new Error('Gallery record changed concurrently.');
            await SourceImport.create([{
              key: previewKey(record),
              checksum: checksum(manifest, record),
              manifestVersion: manifest.version,
              entityType: 'GalleryItem',
              entityId: row._id,
              references: record.files.map(id => {
                const {
                  id: _id,
                  ...file
                } = manifest.files.find(item => item.id === id)!;
                return file;
              }),
              reviewTasks: []
            }], {
              session
            });
            await AuditLog.create([{
              actorId,
              action: 'gallery.seed-published',
              entityType: 'GalleryItem',
              entityId: row.id,
              outcome: 'success',
              changedFields: ['publication', 'image', 'caption', 'title', 'alt']
            }], {
              session
            });
            return {
              key: record.key,
              status: 'published'
            };
          })) as GallerySeedResult;
        } finally {
          await session.endSession();
        }
      }
    }
    results.push(result);
    options.report?.(result);
  }
  return results;
}
