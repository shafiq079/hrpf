import type mongoose from 'mongoose';
import { Router } from 'express';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { z } from 'zod';
import { Asset, BlogCategory, BlogPost, BoardMember, Certificate, GalleryItem, Report, Setting, Project } from '../domain/models.js';
import type { UploadProvider } from '../services/uploads.js';
import { ApiError, unavailable, validate } from './errors.js';
import { blogReadingMinutes } from './blog-details.js';

const short = z.string().trim().min(1).max(1000);
const https = z.url().refine(v => { const u = new URL(v); return u.protocol === 'https:' && !u.username && !u.password; });
export const publicSettingSchemas = {
  identity: z.object({ name: short, shortName: short, type: short, website: https, visionLine: short }),
  contact: z.object({ address: short, postalCode: short, phone: short, landline: short, emails: z.array(z.email().max(254)).max(5) }),
  socialLinks: z.object({ facebook: https.optional(), youtube: https.optional(), x: https.optional(), linkedin: https.optional(), tiktok: https.optional(), threadsHandle: short.optional() }),
  donations: z.object({ accountTitle: short, bank: short, branch: short, accountNumber: short, iban: short, jazzCash: short }),
};
export const publicQuery = z.object({ locale: z.enum(['en', 'ur']).default('en'), page: z.coerce.number().int().min(1).max(1000).default(1), limit: z.coerce.number().int().min(1).max(48).default(12), category: z.enum(['media-coverage', 'in-action']).optional(), q: z.string().trim().max(80).default('') }).strict();
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
const id = z.string().regex(/^[a-fA-F0-9]{24}$/);
const missing = () => new ApiError(404, 'NOT_FOUND', 'This content is not available.');
export const publicationFilter = () => ({ publishedAt: { $ne: null, $lte: new Date() } });
export function publicBlocks(blocks: { type: string; text?: string | null; items?: string[] | null }[] | null | undefined) {
  // Images have a separate released-file contract; never expose raw asset IDs from rich text.
  return (blocks ?? []).filter(b => ['paragraph', 'heading', 'list'].includes(b.type)).map(b => ({ type: b.type, ...(b.text ? { text: b.text } : {}), ...(b.type === 'list' ? { items: b.items ?? [] } : {}) }));
}
export async function releasedAsset(assetId: mongoose.Types.ObjectId | undefined, entityType: string, entityId: mongoose.Types.ObjectId) {
  if (!assetId) return null;
  return Asset.findOne({ _id: assetId, entityType, entityId, purpose: entityType === 'Certificate' ? 'certificate' : 'content', deliveryType: 'authenticated', visibility: 'public', scanStatus: 'clean', claimStatus: 'claimed' }).select('format bytes width height').lean();
}
export function publicRouter(provider: UploadProvider) {
  const router = Router();
  // No caching: publication/withdrawal is reflected immediately, including asset requests.
  router.get('/settings/public', async (req, res) => {
    validate(z.object({}).strict(), req.query);
    const rows = await Setting.find({ key: { $in: Object.keys(publicSettingSchemas) }, visibility: 'public' }).select('key value').lean();
    const data: Record<string, unknown> = {};
    for (const row of rows) {
      const schema = publicSettingSchemas[row.key as keyof typeof publicSettingSchemas];
      const parsed = schema?.safeParse(row.value);
      if (parsed?.success) data[row.key] = parsed.data;
    }
    res.json({ data });
  });
  router.get('/board', async (req, res) => {
    const { locale } = validate(publicQuery, req.query);
    const rows = await BoardMember.find({ isActive: true }).sort({ rank: 1, _id: 1 }).select('name slug designation slotLabel rank bio photo').lean();
    const data = await Promise.all(rows.map(async row => ({ name: row.name, slug: row.slug, designation: row.designation, slotLabel: row.slotLabel, rank: row.rank, bio: row.bio?.[locale] ?? '', photo: await releasedAsset(row.photo?.assetId, 'BoardMember', row._id) ? `/api/public-assets/${row.photo!.assetId}` : null })));
    res.json({ data });
  });
  router.get('/blog-categories', async (req, res) => {
    const { locale } = validate(publicQuery, req.query);
    const rows = await BlogCategory.find({ isActive: true }).sort({ sortOrder: 1, _id: 1 }).select('name slug').lean();
    res.json({ data: rows.map(r => ({ slug: r.slug, name: r.name?.[locale] ?? '' })) });
  });
  const blogView = async (row: any, locale: 'en' | 'ur') => ({
    title: row.title?.[locale] ?? '', slug: row.slug, excerpt: row.excerpt?.[locale] ?? '', publishedAt: row.publishedAt,
    category: row.details?.category || 'HRPF Blogs', authorName: row.details?.authorName || 'HRPF Pakistan',
    readingMinutes: blogReadingMinutes(row), imageAlt: row.coverAlt || row.title?.[locale] || 'Blog photograph',
    image: await releasedAsset(row.cover?.assetId, 'BlogPost', row._id) ? `/api/public-assets/${row.cover.assetId}` : null,
  });
  router.get(['/blogs', '/news'], async (req, res) => {
    const { locale, page, limit, q } = validate(publicQuery, req.query);
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = { locale, status: 'published' as const, reviewStatus: 'approved' as const, ...publicationFilter(), ...(q ? { [`title.${locale}`]: { $regex: escaped, $options: 'i' } } : {}) };
    const [rows, total] = await Promise.all([BlogPost.find(filter).sort({ publishedAt: -1, _id: 1 }).skip((page - 1) * limit).limit(limit).select('title slug excerpt publishedAt cover coverAlt details blocks').lean(), BlogPost.countDocuments(filter)]);
    res.json({ data: await Promise.all(rows.map(r => blogView(r, locale))), meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  });
  router.get(['/blogs/:slug', '/news/:slug'], async (req, res) => {
    const { locale } = validate(publicQuery, req.query);
    const row = await BlogPost.findOne({ slug: validate(slug, req.params.slug), locale, status: 'published', reviewStatus: 'approved', ...publicationFilter() }).select('title slug excerpt blocks publishedAt cover coverAlt details tags gallery documents').lean();
    if (!row) throw missing();
    const gallery = await Promise.all((row.gallery ?? []).map(async item => await releasedAsset(item.asset.assetId, 'BlogPost', row._id) ? { image: `/api/public-assets/${item.asset.assetId}`, alt: item.alt, caption: item.caption ?? '' } : null));
    const documents = await Promise.all((row.documents ?? []).map(async item => await releasedAsset(item.asset.assetId, 'BlogPost', row._id) ? { file: `/api/public-assets/${item.asset.assetId}`, label: item.label } : null));
    res.json({ data: { ...await blogView(row, locale), blocks: publicBlocks(row.blocks), details: row.details ?? {}, tags: row.tags ?? [], gallery: gallery.filter(Boolean), documents: documents.filter(Boolean) } });
  });
  const projectView = async (row: any, locale: 'en' | 'ur') => ({ title: row.title?.[locale] ?? '', slug: row.slug, summary: row.summary?.[locale] ?? '', focusArea: row.focusArea, location: row.location, status: row.projectStatus, startYear: row.startYear, imageAlt: row.coverAlt || row.title?.[locale] || 'Project photograph', image: await releasedAsset(row.cover?.assetId, 'Project', row._id) ? `/api/public-assets/${row.cover.assetId}` : null });
  router.get('/projects', async (req, res) => {
    const {locale, page, limit} = validate(publicQuery, req.query);
    const filter = {locale, status: 'published' as const, reviewStatus: 'approved' as const, ...publicationFilter()};
    const [rows, total] = await Promise.all([Project.find(filter).sort({publishedAt:-1,_id:1}).skip((page-1)*limit).limit(limit).lean(), Project.countDocuments(filter)]);
    res.json({data: await Promise.all(rows.map(r => projectView(r, locale))), meta:{page,limit,total,pages:Math.ceil(total/limit)}});
  });
  router.get('/projects/:slug', async (req, res) => {
    const {locale} = validate(publicQuery, req.query);
    const row = await Project.findOne({slug:validate(slug,req.params.slug),locale,status:'published',reviewStatus:'approved',...publicationFilter()}).lean();
    if (!row) throw missing();
    const gallery = await Promise.all((row.gallery ?? []).map(async item => await releasedAsset(item.asset.assetId, 'Project', row._id) ? { image: `/api/public-assets/${item.asset.assetId}`, alt: item.alt, caption: item.caption ?? '' } : null));
    const documents = await Promise.all((row.documents ?? []).map(async item => await releasedAsset(item.asset.assetId, 'Project', row._id) ? { file: `/api/public-assets/${item.asset.assetId}`, label: item.label } : null));
    res.json({data:{...await projectView(row,locale),blocks:publicBlocks(row.blocks),details:row.details ?? {},gallery:gallery.filter(Boolean),documents:documents.filter(Boolean)}});
  });
  for (const kind of ['gallery', 'reports', 'certificates'] as const) {
    router.get(`/${kind}`, async (req, res) => {
      const { locale, page, limit, category } = validate(publicQuery, req.query);
      const model = kind === 'gallery' ? GalleryItem : kind === 'reports' ? Report : Certificate;
      const entityType = kind === 'gallery' ? 'GalleryItem' : kind === 'reports' ? 'Report' : 'Certificate';
      const field = kind === 'gallery' ? 'asset' : kind === 'reports' ? 'publicPdf' : 'publicFile';
      const filter = { ...publicationFilter(), ...(kind === 'gallery' ? { reviewStatus: 'approved', duplicateOf: null, ...(category ? { category } : {}) } : { releaseReview: 'approved' }) };
      // Join before pagination/counting: a missing, restricted or mismatched file is never listed.
      const results = await model.aggregate([
        { $match: filter }, { $lookup: { from: Asset.collection.name, let: { file: `$${field}.assetId`, entity: '$_id' }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$file'] }, { $eq: ['$entityId', '$$entity'] }, { $eq: ['$entityType', entityType] }] }, purpose: kind === 'certificates' ? 'certificate' : 'content', deliveryType: 'authenticated', visibility: 'public', scanStatus: 'clean', claimStatus: 'claimed', ...(kind === 'reports' ? { format: 'pdf' } : kind === 'gallery' ? { format: { $in: ['jpg', 'jpeg', 'png', 'webp'] } } : {}) } }], as: 'released' } },
        { $match: { 'released.0': { $exists: true } } }, { $sort: { sortOrder: 1, _id: 1 } },
        { $facet: { rows: [{ $skip: (page - 1) * limit }, { $limit: limit }], count: [{ $count: 'total' }] } },
      ]);
      const result = results[0], total = result.count[0]?.total ?? 0;
      const data = result.rows.map((r: Record<string, any>) => {
        const base = { id: String(r._id), title: r.title?.[locale] ?? '', file: `/api/public-assets/${r.released[0]._id}` };
        if (kind === 'gallery') return { ...base, category: r.category, alt: r.alt?.[locale] ?? '', caption: r.caption?.[locale] ?? '', treatment: r.treatment, width: r.released[0].width, height: r.released[0].height };
        if (kind === 'reports') return { ...base, slug: r.slug, year: r.year, summary: r.summary?.[locale] ?? '', pages: r.pages, download: `/api/reports/${r._id}/download` };
        return { ...base, issuer: r.issuer, reference: r.reference, issuedAt: r.issuedAt, validFrom: r.validFrom, expiresAt: r.expiresAt };
      });
      res.json({ data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    });
  }
  const stream: import('express').RequestHandler = async (req, res) => {
    validate(z.object({}).strict(), req.query);
    const isDownload = req.path.startsWith('/reports/');
    const value = validate(id, req.params.id);
    const report = isDownload ? await Report.findOne({ _id: value, releaseReview: 'approved', ...publicationFilter() }).lean() : null;
    const assetId = isDownload ? report?.publicPdf?.assetId : value;
    if (!assetId) throw missing();
    const asset = await Asset.findOne({ _id: assetId, deliveryType: 'authenticated', visibility: 'public', scanStatus: 'clean', claimStatus: 'claimed', purpose: { $in: ['content', 'certificate'] } }).lean();
    if (!asset?.entityId || asset.purpose !== (asset.entityType === 'Certificate' ? 'certificate' : 'content')) throw missing();
    let released = false;
    switch (asset.entityType) {
      case 'Project': released = !!await Project.exists({_id:asset.entityId,status:'published',reviewStatus:'approved',$or:[{'cover.assetId':asset._id},{'gallery.asset.assetId':asset._id},{'documents.asset.assetId':asset._id}],...publicationFilter()}); break;
      case 'BlogPost': released = !!await BlogPost.exists({_id:asset.entityId,status:'published',reviewStatus:'approved',$or:[{'cover.assetId':asset._id},{'gallery.asset.assetId':asset._id},{'documents.asset.assetId':asset._id}],...publicationFilter()}); break;
      case 'BoardMember': released = !!await BoardMember.exists({ _id: asset.entityId, isActive: true, 'photo.assetId': asset._id }); break;
      case 'GalleryItem': released = !!await GalleryItem.exists({ _id: asset.entityId, reviewStatus: 'approved', duplicateOf: null, 'asset.assetId': asset._id, ...publicationFilter() }); break;
      case 'Report': released = !!await Report.exists({ _id: asset.entityId, releaseReview: 'approved', 'publicPdf.assetId': asset._id, ...publicationFilter() }); break;
      case 'Certificate': released = !!await Certificate.exists({ _id: asset.entityId, releaseReview: 'approved', 'publicFile.assetId': asset._id, ...publicationFilter() }); break;
    }
    if (!released || (isDownload && (asset.entityType !== 'Report' || String(asset.entityId) !== value || asset.format !== 'pdf'))) throw missing();
    const types: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf' };
    if (!types[asset.format]) throw missing();
    const response = await provider.read(asset);
    if (!response.ok || !response.body) throw unavailable();
    res.setHeader('Content-Type', types[asset.format]!);
    res.setHeader('Content-Disposition', `${asset.format === 'pdf' ? 'attachment' : 'inline'}; filename="hrpf-${value}.${asset.format}"`);
    if (req.method === 'HEAD') { await response.body.cancel(); res.end(); return; }
    await pipeline(Readable.fromWeb(response.body as import('node:stream/web').ReadableStream), res);
    if (isDownload) await Report.updateOne({ _id: value }, { $inc: { downloadCount: 1 } });
  };
  router.get('/public-assets/:id', stream);
  router.get('/reports/:id/download', stream);
  return router;
}
