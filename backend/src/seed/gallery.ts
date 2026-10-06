import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import { Asset, AuditLog, Counter, GalleryItem, SourceImport, User } from '../domain/models.js';
import { can } from '../security/permissions.js';
import { digest } from '../security/crypto.js';
import { inspectUpload, type Scanner, type UploadProvider } from '../services/uploads.js';
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
}> = {
  'gallery:media-coverage:016': {
    title: 'Daily Awami Forum — archive cutting',
    alt: 'Archived Urdu newspaper cutting with the Daily Awami Forum Karachi masthead and an HRPF article.',
    caption: 'A cutting from the supplied HRPF newspaper archive, shown in its original archival context. Open the image to read the Urdu report. No current project outcome is inferred from this historical item.',
    sourceName: 'Daily Awami Forum, Karachi'
  },
  'gallery:in-action:003': {
    title: 'HRPF archive — an indoor photograph',
    alt: 'Two men seated indoors, with papers and a framed portrait in the background.',
    caption: 'From the supplied HRPF photograph archive. The event date and the participants’ roles are not confirmed by the source index.'
  },
  'gallery:in-action:004': {
    title: 'HRPF archive — TMA building',
    alt: 'Three men standing outside a building with a TMA Mandi Bahauddin sign.',
    caption: 'An archive photograph outside the TMA building in Mandi Bahauddin. The image records the setting; no official decision or project result is inferred.'
  },
  'gallery:in-action:005': {
    title: 'HRPF archive — Lahore Press Club',
    alt: 'Three men standing in front of a Lahore Press Club banner.',
    caption: 'An archive photograph with a Lahore Press Club backdrop. The supplied image index does not establish the event date or a specific campaign outcome.'
  }
};
export const galleryAssetRoot = new URL('../../seed/gallery-assets/', import.meta.url);
export async function loadGalleryManifest() {
  const manifest = await validateManifest(JSON.parse(await readFile(new URL('../../seed/gallery-manifest.json', import.meta.url), 'utf8')));
  if (manifest.records.length !== 4 || manifest.records.some(record => record.kind !== 'GalleryItem' || record.duplicateOf || !presentations[record.key])) throw new Error('Invalid Gallery preview manifest.');
  return manifest;
}
function presentation(record: SeedRecord) {
  const copy = presentations[record.key]!;
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
  status: 'published' | 'admin-preserved' | 'seeded-preserved' | 'would-publish';
};
export async function planGallerySeed(manifest: Manifest): Promise<GallerySeedResult[]> {
  const results: GallerySeedResult[] = [];
  for (const record of manifest.records) {
    const imported = await importRecord(manifest, record, false);
    if (imported.status !== 'preserved') {
      results.push(imported);
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
  scanner: Scanner;
  report?: (result: GallerySeedResult) => void;
  phase?: (phase: string) => void;
}) {
  const {
    manifest,
    files,
    actorId,
    namespace,
    provider,
    scanner
  } = options;
  if (namespace !== 'hrpf/dev') throw new Error('Gallery preview setup is limited to hrpf/dev.');
  await actorAllowed(actorId);
  options.phase?.('scan');
  // Verify and scan the complete batch before any DB or provider write.
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
    if ((await scanner(bytes)) !== 'clean') throw new Error('Gallery scan failed.');
  }
  const results: GallerySeedResult[] = [];
  for (const record of manifest.records) {
    options.phase?.('database');
    const prior = await SourceImport.findOne({
      key: previewKey(record)
    });
    let result: GallerySeedResult;
    if (prior) result = {
      key: record.key,
      status: !(await GalleryItem.exists({
        _id: prior.entityId
      })) ? 'deleted-preserved' : prior.checksum === checksum(manifest, record) ? 'seeded-preserved' : 'source-changed'
    };else {
      const imported = await importRecord(manifest, record, true);
      if (!['created', 'preserved'].includes(imported.status)) result = imported;else if (!(await candidate(manifest, record))) result = {
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
          scanStatus: 'clean',
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
              scanStatus: 'clean',
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
