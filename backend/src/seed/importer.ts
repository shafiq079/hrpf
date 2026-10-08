import { bumpPublicRevision } from '../services/public-cache.js';
import mongoose from 'mongoose';
import { AuditLog, SourceImport } from '../domain/models.js';
import { lookup, recordChecksum, seedId, seedModels, type Manifest, type SeedRecord } from './manifest.js';
export type SeedResult = { key: string; status: 'created' | 'would-create' | 'preserved' | 'source-changed' | 'deleted-preserved' | 'unmanaged-preserved' | 'conflict' };
export async function importRecord(manifest: Manifest, record: SeedRecord, apply: boolean): Promise<SeedResult> {
  const model = mongoose.model<Record<string, unknown>>(record.kind), checksum = recordChecksum(manifest, record);
  const inspect = async (session?: mongoose.ClientSession): Promise<SeedResult | undefined> => {
    const checkpoint = await SourceImport.findOne({ key: record.key }).session(session ?? null).lean();
    if (checkpoint) {
      const exists = await model.exists({ _id: checkpoint.entityId }).session(session ?? null);
      return { key: record.key, status: !exists ? 'deleted-preserved' : checkpoint.checksum === checksum ? 'preserved' : 'source-changed' };
    }
    if (await model.exists(lookup(record)).session(session ?? null)) return { key: record.key, status: 'unmanaged-preserved' };
    const collisions: Record<string, unknown>[] = [{ _id: seedId(record.key) }];
    if (typeof record.payload.slug === 'string') collisions.push({ slug: record.payload.slug });
    if (await model.exists({ $or: collisions }).session(session ?? null)) return { key: record.key, status: 'conflict' };
    return undefined;
  };
  const existing = await inspect();
  if (existing) return existing;
  if (!apply) {
    if (record.duplicateOf && !await seedModels.GalleryItem.exists({ seedKey: record.duplicateOf })) {
      const target = manifest.records.find(item => item.key === record.duplicateOf)!;
      const targetResult = await importRecord(manifest, target, false);
      if (['deleted-preserved', 'conflict', 'preserved', 'source-changed'].includes(targetResult.status)) return { key: record.key, status: 'conflict' };
    }
    return { key: record.key, status: 'would-create' };
  }
  const session = await mongoose.startSession();
  try {
    // Create-only imports retain no document instances across retries. Use the
    // driver's transaction retry instead of Mongoose's document-state rollback.
    return await session.withTransaction(async () => {
      await bumpPublicRevision(session);
      const concurrent = await inspect(session);
      if (concurrent) return concurrent;
      const payload = { ...record.payload, _id: seedId(record.key) };
      if (record.duplicateOf) {
        const target = await seedModels.GalleryItem.findOne({ seedKey: record.duplicateOf }).session(session).lean();
        if (!target) return { key: record.key, status: 'conflict' } as SeedResult;
        Object.assign(payload, { duplicateOf: target._id });
      }
      await model.create([payload], { session });
      await SourceImport.create([{
        key: record.key, checksum, manifestVersion: manifest.version, entityType: record.kind, entityId: payload._id,
        references: record.files.map(id => { const { id: _id, ...file } = manifest.files.find(file => file.id === id)!; return file; }), reviewTasks: record.reviewTasks,
      }], { session });
      await AuditLog.create([{ action: 'source.seed-created', entityType: record.kind, entityId: payload._id.toString(), outcome: 'success', changedFields: Object.keys(record.payload) }], { session });
      return { key: record.key, status: 'created' } as SeedResult;
    });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    // A parallel seed may have won, or a native slug/ID collides with admin content.
    return await inspect() ?? { key: record.key, status: 'conflict' };
  } finally { await session.endSession(); }
}
export async function importManifest(manifest: Manifest, apply: boolean, report: (result: SeedResult) => void = () => {}) {
  const results: SeedResult[] = [];
  // Canonical records first so duplicate references resolve even after an interruption.
  for (const record of [...manifest.records.filter(record => !record.duplicateOf), ...manifest.records.filter(record => record.duplicateOf)]) {
    const result = await importRecord(manifest, record, apply);
    results.push(result); report(result);
  }
  return results;
}
