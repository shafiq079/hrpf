import { bumpPublicRevision } from '../services/public-cache.js';
import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import {
  Project,
  BlogPost,
  User,
  Counter,
  AuditLog,
  Asset,
} from "../domain/models.js";
import { createAuth, type Principal } from "../security/auth.js";
import { permit, can } from "../security/permissions.js";
import { ApiError, validate } from "./errors.js";
import { projectDetailsInput, projectMediaInput } from "./project-details.js";
import { bindProjectMedia } from "../services/project-media.js";
import { blogDetailsInput, blogMediaInput } from "./blog-details.js";
import { projectWorkAreas, workAreaSlugs } from "../domain/work-areas.js";
const localized = z
  .object({
    en: z.string().trim().min(1).max(10000),
    ur: z.string().max(10000).optional(),
  })
  .strict();
const blocks = z
  .array(
    z
      .object({
        type: z.enum(["paragraph", "heading", "list"]),
        text: z.string().max(10000).optional(),
        items: z.array(z.string().max(1000)).max(100).optional(),
      })
      .strict()
      .refine(
        (v) => (v.type === "list" ? !!v.items?.length : !!v.text?.trim()),
        "Provide text or list items",
      ),
  )
  .min(1)
  .max(100);
const common = {
  title: localized,
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
  locale: z.enum(["en", "ur"]).default("en"),
  blocks,
};
export const projectInput = z
  .object({
    ...common,
    summary: localized,
    details: projectDetailsInput.optional(),
    ...projectMediaInput,
    focusArea: z.string().trim().min(1).max(150),
    workAreas: z.array(z.enum(workAreaSlugs)).max(8).refine(values => new Set(values).size === values.length, "Select each work page once").optional(),
    location: z.string().trim().min(1).max(150),
    projectStatus: z.enum([
      "Ongoing",
      "Completed",
      "Proposed",
      "Emergency Response",
    ]),
    startYear: z.number().int().min(1900).max(2200).optional(),
  })
  .strict();
export const newsInput = z.object({ ...common,
  blocks: z.array(blocks.element).max(100),
  title: localized.extend({ en: z.string().trim().min(1).max(200), ur: z.string().trim().max(200).optional() }),
  excerpt: localized.extend({ en: z.string().trim().min(1).max(1000), ur: z.string().trim().max(1000).optional() }),
  details: blogDetailsInput.optional(), ...blogMediaInput,
  tags: z.array(z.string().trim().min(1).max(50)).max(12).refine(tags => new Set(tags.map(tag => tag.toLowerCase())).size === tags.length, "Use distinct tags").optional(),
}).strict();
const id = z.string().regex(/^[a-fA-F0-9]{24}$/);
export function managedContentRouter(auth: ReturnType<typeof createAuth>) {
  const router = Router();
  router.use(["/projects", "/blogs", "/news"], auth.authenticate, permit("content"));
  // Blogs is canonical; the legacy news API operates on the same BlogPost records.
  for (const kind of ["projects", "blogs", "news"] as const) {
    const model = (
        kind === "projects" ? Project : BlogPost
      ) as mongoose.Model<any>,
      schema = kind === "projects" ? projectInput : newsInput,
      entity = kind === "projects" ? "Project" : "BlogPost";
    router.get(`/${kind}`, async (req, res) => {
      const { page } = validate(
        z
          .object({ page: z.coerce.number().int().min(1).max(1000).default(1) })
          .strict(),
        req.query,
      );
      const rows = await model
        .find()
        .sort({ _id: 1 })
        .skip((page - 1) * 20)
        .limit(20)
        .select(kind === "projects" ? "__v title slug summary projectStatus status focusArea workAreas location locale" : "__v title slug excerpt status locale details.category")
        .lean();
      res.json({
        data: rows.map(({ _id, __v, ...r }: any) => ({
          id: String(_id),
          version: __v,
          ...r,
          ...(kind === "projects" ? { workAreas: projectWorkAreas(r) } : {}),
        })),
        meta: { page, limit: 20 },
      });
    });
    router.get(`/${kind}/:id`, async (req, res) => {
      const row = await model.findById(validate(id, req.params.id)).lean();
      if (!row) throw new ApiError(404, "NOT_FOUND", "Content not found.");
      const { _id, __v, cover, gallery, documents, sourceReferences: _sources, ...fields } = row;
      const safeFields = kind === "projects" ? fields : Object.fromEntries(["title", "slug", "locale", "excerpt", "blocks", "details", "tags", "coverAlt", "status", "publishedAt"].map(key => [key, row[key]]));
      res.json({ data: { id: String(_id), version: __v, ...safeFields,
        ...(kind === "projects" ? { workAreas: projectWorkAreas(row) } : {}),
        coverAssetId: cover?.assetId?.toString() ?? null,
        gallery: (gallery ?? []).map((item: any) => ({ assetId: String(item.asset.assetId), alt: item.alt, caption: item.caption ?? "" })),
        documents: (documents ?? []).map((item: any) => ({ assetId: String(item.asset.assetId), label: item.label })),
      } });
    });
    for (const method of ["post", "patch", "delete"] as const)
      router[method](
        method === "post" ? `/${kind}` : `/${kind}/:id`,
        auth.csrf,
        async (req, res) => {
          const value =
            method === "post" ? undefined : validate(id, req.params.id);
          const input = validate<Record<string, any>>(
            method === "post"
              ? schema
              : method === "patch"
                ? schema.extend({ version: z.number().int().nonnegative() })
                : z
                    .object({ version: z.number().int().nonnegative() })
                    .strict(),
            req.body,
          ) as Record<string, any>;
          const principal = res.locals.principal as Principal;
          const result = await mongoose.connection.transaction(async (tx) => {
            await bumpPublicRevision(tx);
            await Counter.findOneAndUpdate(
              { key: "security:user-governance" },
              { $inc: { sequence: 1 } },
              { session: tx, upsert: true },
            );
            const actor = await User.findOne({
              _id: principal.id,
              active: true,
            }).session(tx);
            if (!actor || !can(actor.role, "content"))
              throw new ApiError(
                403,
                "FORBIDDEN",
                "You do not have permission for this action.",
              );
            const { version, coverAssetId, gallery, documents, ...fields } = input;
            let row =
              method === "post"
                ? new model({ ...fields, ...(kind === "projects" ? { workAreas: fields.workAreas ?? [] } : {}) })
                : await model.findOne({ _id: value, __v: version }).session(tx);
            if (!row)
              throw new ApiError(
                409,
                "VERSION_CONFLICT",
                "Refresh this record before changing it.",
              );
            if (method === "delete")
              await model.deleteOne(
                { _id: row._id, __v: version },
                { session: tx },
              );
            else {
              if (method === "patch") {
                row.set(fields);
                if (kind === "projects") { row.startYear = fields.startYear; row.details = fields.details; }
                row.status = "draft";
                row.reviewStatus = "pending";
                row.publishedAt = undefined;
                row.__v += 1;
              }
              await bindProjectMedia(row, { coverAssetId, gallery, documents }, principal.id, tx, "restricted", entity);
              if (method === "post") await row.save({ session: tx });
              else {
                await row.validate();
                const replaced = await model.replaceOne(
                  { _id: row._id, __v: version },
                  row.toObject(),
                  { session: tx },
                );
                if (!replaced.matchedCount)
                  throw new ApiError(
                    409,
                    "VERSION_CONFLICT",
                    "Refresh this record before changing it.",
                  );
              }
            }
            if (method !== "post")
              await Asset.updateMany(
                { entityType: entity, entityId: row._id },
                { $set: { visibility: "restricted" } },
                { session: tx },
              );
            await AuditLog.create(
              [
                {
                  actorId: principal.id,
                  action: `${kind}.${method}`,
                  entityType: entity,
                  entityId: row._id,
                  requestId: res.locals.requestId,
                  outcome: "success",
                  changedFields: Object.keys(fields),
                },
              ],
              { session: tx },
            );
            return {
              id: String(row._id),
              version: row.__v,
              status: method === "delete" ? "deleted" : "draft",
            };
          });
          res.status(method === "post" ? 201 : 200).json({ data: result });
        },
      );
  }
  return router;
}
