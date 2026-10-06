import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Asset, AuditLog, BlogPost, BoardMember, Certificate, Counter, GalleryItem, Report, Setting, User, Project } from '../domain/models.js';
import { type Principal, createAuth } from '../security/auth.js';
import { can, type Permission } from '../security/permissions.js';
import { ApiError, validate } from './errors.js';
import { publicSettingSchemas } from './public-content.js';
import { bindProjectMedia } from '../services/project-media.js';
export const publicationInput = z.object({ version: z.number().int().nonnegative(), action: z.enum(['publish', 'withdraw']), releaseReviewed: z.literal(true), assetId: z.string().regex(/^[a-fA-F0-9]{24}$/).optional() }).strict();
const kinds = {
  blog: { model: BlogPost, permission: 'content', entity: 'BlogPost', field: 'cover' },
  project: { model: Project, permission: 'content', entity: 'Project', field: 'cover' },
  board: { model: BoardMember, permission: 'board', entity: 'BoardMember', field: 'photo' },
  gallery: { model: GalleryItem, permission: 'content', entity: 'GalleryItem', field: 'asset' },
  report: { model: Report, permission: 'content', entity: 'Report', field: 'publicPdf' },
  certificate: { model: Certificate, permission: 'certificates', entity: 'Certificate', field: 'publicFile' },
  setting: { model: Setting, permission: 'settings', entity: 'Setting', field: null },
} as const;
export function publicationRouter(auth: ReturnType<typeof createAuth>) {
  const router = Router();
  router.use(auth.authenticate);
  router.get('/:kind', async (req, res) => {
    const kind = validate(z.enum(['blog', 'project', 'board', 'gallery', 'report', 'certificate', 'setting']), req.params.kind);
    const query = validate(z.object({ page: z.coerce.number().int().min(1).max(1000).default(1) }).strict(), req.query), spec = kinds[kind];
    if (!can((res.locals.principal as Principal).role, spec.permission as Permission)) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission for this action.');
    const model = spec.model as mongoose.Model<any>;
    const rows = await model.find(kind === 'setting' ? { key: { $in: Object.keys(publicSettingSchemas) } } : {}).sort({ _id: 1 }).skip((query.page - 1) * 20).limit(20).select('_id __v key locale name title blocks designation rank bio alt caption category summary issuer reference issuedAt validFrom expiresAt reviewStatus releaseReview publishedAt isActive status visibility value provenance sourceReferences').lean();
    res.json({ data: rows.map(row => { const { _id, __v, ...fields } = row; if (kind === 'setting') { const parsed = publicSettingSchemas[row.key as keyof typeof publicSettingSchemas]?.safeParse(row.value); fields.value = parsed?.success ? parsed.data : null; } return { id: String(_id), version: __v, ...fields }; }), meta: { page: query.page, limit: 20 } });
  });
  router.post('/:kind/:id', auth.csrf, async (req, res) => {
    const kind = validate(z.enum(['blog', 'project', 'board', 'gallery', 'report', 'certificate', 'setting']), req.params.kind);
    const id = validate(z.string().regex(/^[a-fA-F0-9]{24}$/), req.params.id);
    const input = validate(publicationInput, req.body), spec = kinds[kind];
    const principal = res.locals.principal as Principal;
    if (!can(principal.role, spec.permission as Permission)) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission for this action.');
    const tx = await mongoose.startSession();
    try {
      await tx.withTransaction(async () => {
        await Counter.findOneAndUpdate({ key: 'security:user-governance' }, { $inc: { sequence: 1 } }, { session: tx, upsert: true });
        const actor = await User.findOne({ _id: principal.id, active: true }).session(tx);
        if (!actor || !can(actor.role, spec.permission as Permission)) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission for this action.');
        const model = spec.model as mongoose.Model<any>;
        const row = await model.findOne({ _id: id, __v: input.version }).session(tx);
        if (!row) throw new ApiError(409, 'VERSION_CONFLICT', 'Refresh this record before changing publication.');
        if (input.assetId && !spec.field) throw new ApiError(400, 'INVALID_ASSET', 'This record does not accept a file.');
        if (input.action === 'publish') {
          if (kind === 'setting') {
            const schema = publicSettingSchemas[row.key as keyof typeof publicSettingSchemas];
            if (!schema || !schema.safeParse(row.value).success) throw new ApiError(400, 'REVIEW_REQUIRED', 'Only valid approved public settings may be published.');
            row.visibility = 'public'; row.revision += 1;
          } else if (kind === 'board') row.isActive = true;
          else {
            if (kind === 'gallery' && (row.duplicateOf || !row.alt?.en?.trim())) throw new ApiError(400, 'REVIEW_REQUIRED', 'Review the image description and duplicate status first.');
            if (['blog', 'project'].includes(kind) && ((!row.blocks?.length && !(kind === 'blog' && (row.details?.intro?.trim() || row.details?.sections?.length))) || row.blocks.some((b: {type: string}) => b.type === 'image'))) throw new ApiError(400, 'REVIEW_REQUIRED', 'Provide reviewed article text; use the gallery for images.');
            if (['blog', 'project'].includes(kind)) row.status = 'published';
            if (['report', 'certificate'].includes(kind)) row.releaseReview = 'approved'; else row.reviewStatus = 'approved';
            row.publishedAt = new Date();
          }
          if (kind === 'project' || kind === 'blog') {
            await bindProjectMedia(row, { coverAssetId: input.assetId }, principal.id, tx, 'public', kind === 'blog' ? 'BlogPost' : 'Project');
          } else if (spec.field) {
            const fileId = input.assetId ?? row[spec.field]?.assetId;
            if (!fileId && !['board', 'blog', 'project'].includes(kind)) throw new ApiError(400, 'REVIEW_REQUIRED', 'Upload and review a public release file first.');
            if (fileId) {
              const asset = await Asset.findOne({ _id: fileId, deliveryType: 'authenticated', scanStatus: 'clean', purpose: kind === 'certificate' ? 'certificate' : 'content', $or: [{ claimStatus: 'staged', ownerId: principal.id, stagingExpiresAt: { $gt: new Date() } }, { claimStatus: 'claimed', entityType: spec.entity, entityId: row._id }] }).session(tx);
              if (!asset || (kind === 'report' && asset.format !== 'pdf') || (['board', 'gallery', 'blog', 'project'].includes(kind) && !['jpg', 'jpeg', 'png', 'webp'].includes(asset.format))) throw new ApiError(400, 'INVALID_ASSET', 'Use your own clean staged file or the file already bound to this record.');
              await Asset.updateMany({ entityType: spec.entity, entityId: row._id, _id: { $ne: asset._id } }, { $set: { visibility: 'restricted' } }, { session: tx });
              asset.visibility = 'public'; asset.claimStatus = 'claimed'; asset.entityType = spec.entity; asset.entityId = row._id; asset.set('stagingExpiresAt', undefined);
              await asset.save({ session: tx });
              row[spec.field] = { assetId: asset._id, publicId: asset.publicId, resourceType: asset.resourceType, deliveryType: asset.deliveryType, format: asset.format, bytes: asset.bytes, width: asset.width, height: asset.height, version: asset.version, sha256: asset.sha256 };
            }
          }
        } else {
          if (input.assetId) throw new ApiError(400, 'INVALID_ASSET', 'Withdrawal does not accept a replacement file.');
          if (kind === 'setting') { row.visibility = 'private'; row.revision += 1; }
          else if (kind === 'board') row.isActive = false;
          else { row.publishedAt = undefined; if (['blog', 'project'].includes(kind)) row.status = 'draft'; if (['report', 'certificate'].includes(kind)) row.releaseReview = 'pending'; else row.reviewStatus = 'pending'; }
          await Asset.updateMany({ entityType: spec.entity, entityId: row._id }, { $set: { visibility: 'restricted' } }, { session: tx });
        }
        row.__v += 1;
        // Use an atomic conditional replacement rather than query setters that bypass validation.
        await row.validate();
        const result = await model.replaceOne({ _id: row._id, __v: input.version }, row.toObject(), { session: tx });
        if (!result.matchedCount) throw new ApiError(409, 'VERSION_CONFLICT', 'Refresh this record before changing publication.');
        await AuditLog.create([{ actorId: principal.id, action: `publication.${input.action}`, entityType: spec.entity, entityId: id, requestId: res.locals.requestId, outcome: 'success', changedFields: ['publication', ...(input.assetId ? [spec.field!] : [])] }], { session: tx });
      });
    } finally { await tx.endSession(); }
    res.json({ data: { status: input.action === 'publish' ? 'published' : 'withdrawn', version: input.version + 1 } });
  });
  return router;
}
