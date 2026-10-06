import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { GalleryItem, VideoInterview, Asset, Counter, User, AuditLog } from '../domain/models.js';
import { createAuth, type Principal } from '../security/auth.js';
import { can, permit } from '../security/permissions.js';
import { ApiError, validate } from './errors.js';
import { bindContentMedia } from '../services/project-media.js';
import { videoLink } from '../services/video-links.js';
const localized = (max: number, required = false) => z.object({
  en: required ? z.string().trim().min(1).max(max) : z.string().trim().max(max).default(''),
  ur: z.string().trim().max(max).optional()
}).strict();
const id = z.string().regex(/^[a-fA-F0-9]{24}$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, 'Use a valid calendar date').optional();
const common = {
  title: localized(200, true),
  sourceName: z.string().trim().max(200).default(''),
  eventDate: date,
  sortOrder: z.number().int().min(0).max(100000).default(0)
};
export const galleryInput = z.object({
  ...common,
  category: z.enum(['media-coverage', 'in-action']),
  mediaType: z.enum(['newspaper', 'photo', 'graphic']),
  alt: localized(300, true),
  caption: localized(2000),
  treatment: z.enum(['ORIGINAL', 'AI_RESTORATION']),
  sourceUrl: z.string().trim().max(2000).refine(v => {
    if (!v) return true;
    try {
      const u = new URL(v);
      return u.protocol === 'https:' && !u.username && !u.password;
    } catch {
      return false;
    }
  }, 'Use an HTTPS source link without credentials').default(''),
  assetId: id.nullable().optional()
}).strict();
export const interviewInput = z.object({
  ...common,
  description: localized(6000),
  videoUrl: z.string().trim().max(2000).refine(v => !!videoLink(v), 'Use an individual public YouTube or Vimeo video link'),
  thumbnailAlt: z.string().trim().max(300).default(''),
  assetId: id.nullable().optional()
}).strict();
const specs = {
  gallery: {
    model: GalleryItem,
    schema: galleryInput,
    entity: 'GalleryItem' as const,
    field: 'asset'
  },
  interviews: {
    model: VideoInterview,
    schema: interviewInput,
    entity: 'VideoInterview' as const,
    field: 'thumbnail'
  }
};
export function mediaContentRouter(auth: ReturnType<typeof createAuth>) {
  const router = Router();
  router.use(['/gallery', '/interviews'], auth.authenticate, permit('content'));
  for (const [kind, spec] of Object.entries(specs)) {
    const model = spec.model as mongoose.Model<any>;
    const view = (row: any) => ({
      id: String(row._id),
      version: row.__v,
      title: row.title,
      sourceName: row.sourceName ?? '',
      eventDate: row.eventDate?.toISOString().slice(0, 10),
      sortOrder: row.sortOrder,
      status: row.publishedAt && row.reviewStatus === 'approved' ? 'published' : 'draft',
      assetId: row[spec.field]?.assetId?.toString() ?? null,
      ...(kind === 'gallery' ? {
        category: row.category,
        mediaType: row.mediaType ?? row.sourceImageType ?? 'photo',
        alt: row.alt ?? {
          en: ''
        },
        caption: row.caption ?? {
          en: ''
        },
        treatment: row.treatment,
        sourceUrl: row.sourceUrl ?? '',
        duplicate: !!row.duplicateOf
      } : {
        description: row.description ?? {
          en: ''
        },
        videoUrl: row.videoUrl,
        thumbnailAlt: row.thumbnailAlt ?? ''
      })
    });
    router.get(`/${kind}`, async (req, res) => {
      const {
        page
      } = validate(z.object({
        page: z.coerce.number().int().min(1).max(1000).default(1)
      }).strict(), req.query);
      const rows = await model.find().sort({
        createdAt: -1,
        _id: 1
      }).skip((page - 1) * 20).limit(20).lean();
      res.json({
        data: rows.map(view),
        meta: {
          page,
          limit: 20
        }
      });
    });
    router.get(`/${kind}/:id`, async (req, res) => {
      const row = await model.findById(validate(id, req.params.id)).lean();
      if (!row) throw new ApiError(404, 'NOT_FOUND', 'This media record was not found.');
      res.json({
        data: view(row)
      });
    });
    for (const method of ['post', 'patch', 'delete'] as const) router[method](method === 'post' ? `/${kind}` : `/${kind}/:id`, auth.csrf, async (req, res) => {
      const value = method === 'post' ? undefined : validate(id, req.params.id);
      const input = validate<Record<string, any>>(method === 'delete' ? z.object({
        version: z.number().int().nonnegative()
      }).strict() : method === 'patch' ? spec.schema.extend({
        version: z.number().int().nonnegative()
      }) : spec.schema, req.body);
      const principal = res.locals.principal as Principal;
      const result = await mongoose.connection.transaction(async tx => {
        await Counter.findOneAndUpdate({
          key: 'security:user-governance'
        }, {
          $inc: {
            sequence: 1
          }
        }, {
          session: tx,
          upsert: true
        });
        const actor = await User.findOne({
          _id: principal.id,
          active: true
        }).session(tx);
        if (!actor || !can(actor.role, 'content')) throw new ApiError(403, 'FORBIDDEN', 'Content administration access is required.');
        const {
          version,
          assetId,
          ...fields
        } = input;
        if (kind === 'interviews' && method !== 'delete') fields.videoUrl = videoLink(fields.videoUrl)!.watchUrl;
        const row = method === 'post' ? new model(fields) : await model.findOne({
          _id: value,
          __v: version
        }).session(tx);
        if (!row) throw new ApiError(409, 'VERSION_CONFLICT', 'Refresh this record before changing it.');
        if (method === 'delete') await model.deleteOne({
          _id: row._id,
          __v: version
        }, {
          session: tx
        });else {
          row.set(fields);
          row.eventDate = fields.eventDate;
          row.reviewStatus = 'pending';
          row.publishedAt = undefined;
          // Reuse the existing clean, owned, unexpired image-binding contract.
          const media = {
            _id: row._id,
            cover: row[spec.field],
            gallery: [],
            documents: []
          };
          await bindContentMedia(media, {
            coverAssetId: assetId
          }, principal.id, tx, 'restricted', spec.entity);
          row[spec.field] = media.cover;
          if (method === 'post') await row.save({
            session: tx
          });else {
            row.__v += 1;
            await row.validate();
            const updated = await model.replaceOne({
              _id: row._id,
              __v: version
            }, row.toObject(), {
              session: tx
            });
            if (!updated.matchedCount) throw new ApiError(409, 'VERSION_CONFLICT', 'Refresh this record before changing it.');
          }
        }
        if (method === 'delete') await Asset.updateMany({
          entityType: spec.entity,
          entityId: row._id
        }, {
          $set: {
            visibility: 'restricted'
          }
        }, {
          session: tx
        });
        await AuditLog.create([{
          actorId: principal.id,
          action: `${kind}.${method}`,
          entityType: spec.entity,
          entityId: row._id,
          outcome: 'success',
          requestId: res.locals.requestId,
          changedFields: method === 'delete' ? ['deleted'] : [...Object.keys(fields), 'image']
        }], {
          session: tx
        });
        return {
          id: String(row._id),
          version: row.__v,
          status: method === 'delete' ? 'deleted' : 'draft'
        };
      });
      res.status(method === 'post' ? 201 : 200).json({
        data: result
      });
    });
  }
  return router;
}
