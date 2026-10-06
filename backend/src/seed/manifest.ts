import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Types } from 'mongoose';
import { z } from 'zod';
import { BoardMember, BlogPost, Certificate, ContentPage, GalleryItem, Report, Setting, Project } from '../domain/models.js';

const safePath = z.string().min(1).max(500).refine(value =>
  !value.includes('\\') && !value.includes('\0') && !value.split('/').some(part => !part || part === '.' || part === '..') &&
  /^(information|progress reports|certificates and registration|aims and objectives|newspaper_cuttings_final|other_images_final)\//.test(value) &&
  !/database|cloudinary|\.env|credentials/i.test(value), 'Only approved relative source paths are allowed.');
const key = z.string().regex(/^[a-zA-Z0-9:.-]{1,200}$/);
export const sourceFileSchema = z.object({
  id: key, path: safePath, sha256: z.string().regex(/^[a-f0-9]{64}$/), bytes: z.number().int().positive().max(20 * 1024 * 1024),
  archiveEntry: z.string().regex(/^word\/media\/image[1-7]\.jpeg$/).optional(),
  width: z.number().int().positive().max(100000).optional(), height: z.number().int().positive().max(100000).optional(),
}).strict();
const recordSchema = z.object({
  kind: z.enum(['BoardMember', 'GalleryItem', 'Report', 'Certificate', 'ContentPage', 'Setting', 'BlogPost', 'Project']),
  key, payload: z.record(z.string(), z.unknown()), files: z.array(key).min(1).max(10),
  reviewTasks: z.array(z.string().min(1).max(1000)).max(10), duplicateOf: key.optional(),
}).strict();
const schema = z.object({ version: z.string().regex(/^[a-zA-Z0-9.-]{1,50}$/), files: z.array(sourceFileSchema).min(1).max(1000), records: z.array(recordSchema).min(1).max(1000) }).strict();
export type SourceFile = z.infer<typeof sourceFileSchema>;
export type SeedRecord = z.infer<typeof recordSchema>;
export type Manifest = z.infer<typeof schema>;
export const seedModels = { BoardMember, GalleryItem, Report, Certificate, ContentPage, Setting, BlogPost, Project };
// Used only for seeded public-content candidates, never users or submissions.
export const seedId = (value: string) => new Types.ObjectId(createHash('sha256').update(`hrpf-source:${value}`).digest('hex').slice(0, 24));
function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
}
export function recordChecksum(manifest: Manifest, record: SeedRecord) {
  const sources = record.files.map(id => manifest.files.find(file => file.id === id)!);
  return createHash('sha256').update(canonical({ record, sources })).digest('hex');
}
export function lookup(record: SeedRecord): Record<string, unknown> {
  switch (record.kind) {
    case 'Setting': return { key: record.payload.key };
    case 'ContentPage': return { key: record.payload.key, locale: record.payload.locale };
    case 'Project':
    case 'BlogPost': return { slug: record.payload.slug };
    default: return { seedKey: record.key };
  }
}
export async function validateManifest(input: unknown): Promise<Manifest> {
  const manifest = schema.parse(input), fileIds = new Set<string>(), records = new Map<string, SeedRecord>();
  for (const file of manifest.files) {
    if (fileIds.has(file.id) || (file.archiveEntry && file.path !== 'information/Board of Directors.docx')) throw new Error('Invalid source file mapping.');
    fileIds.add(file.id);
  }
  for (const record of manifest.records) {
    if (records.has(record.key) || record.files.some(id => !fileIds.has(id))) throw new Error('Duplicate seed key or unknown source reference.');
    records.set(record.key, record);
    const p = record.payload;
    for (const field of ['_id', '__v', 'createdAt', 'updatedAt', 'publishedAt', 'scheduledAt', 'authorId', 'updatedBy', 'photo', 'asset', 'cover', 'inlineAssets', 'publicPdf', 'restrictedOriginal', 'original', 'publicFile', 'duplicateOf']) {
      if (field in p) throw new Error('Seeds cannot set operational fields or provider assets.');
    }
    if (['BoardMember', 'GalleryItem', 'Report', 'Certificate'].includes(record.kind) && p.seedKey !== record.key) throw new Error('Seed identity mismatch.');
    if (record.kind === 'BoardMember' && p.isActive !== false) throw new Error('Board imports must be inactive drafts.');
    if (record.kind === 'GalleryItem' && (p.featured !== false || p.reviewStatus !== (record.duplicateOf ? 'hidden' : 'pending'))) throw new Error('Gallery imports must await release review.');
    if (record.kind !== 'GalleryItem' && record.duplicateOf) throw new Error('Only gallery records can reference duplicates.');
    if (['Report', 'Certificate'].includes(record.kind) && p.releaseReview !== 'pending') throw new Error('Documents must await release review.');
    if (record.kind === 'ContentPage' && (p.reviewStatus !== 'pending' || p.locale !== 'en' || record.key !== `page:en:${p.key}`)) throw new Error('Content must remain a sourced English draft.');
    if (['BlogPost', 'Project'].includes(record.kind) && (p.status !== 'draft' || p.reviewStatus !== 'pending')) throw new Error('Blog imports must remain drafts.');
    if (record.kind === 'Setting' && (p.visibility !== 'private' || !['identity', 'contact', 'socialLinks', 'donations'].includes(String(p.key)) || record.key !== `setting:${p.key}`)) throw new Error('Only private sourced settings can be seeded.');
    // Mongoose validates strict fields, lengths and model-specific constraints offline.
    await new seedModels[record.kind](p).validate();
  }
  for (const record of manifest.records) {
    if (!record.duplicateOf) continue;
    const target = records.get(record.duplicateOf);
    if (!target || target.kind !== 'GalleryItem' || target.duplicateOf || target.payload.category !== record.payload.category || target.key === record.key) throw new Error('Duplicate must reference a canonical image in the same category.');
  }
  return manifest;
}
export async function loadManifest() {
  // Same location from src/seed/ or built dist/seed/; no arbitrary input file ingestion.
  return validateManifest(JSON.parse(await readFile(new URL('../../seed/source-manifest.json', import.meta.url), 'utf8')));
}
