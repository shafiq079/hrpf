import { bumpPublicRevision } from '../services/public-cache.js';
import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import {
  Report,
  Certificate,
  User,
  Counter,
  Asset,
  AuditLog,
} from "../domain/models.js";
import { createAuth, type Principal } from "../security/auth.js";
import { can, permit } from "../security/permissions.js";
import { ApiError, validate } from "./errors.js";
import { bindDocumentFile } from "../services/document-media.js";

const localized = (max: number, required = false) =>
  z
    .object({
      en: required
        ? z.string().trim().min(1).max(max)
        : z.string().trim().max(max).default(""),
      ur: z.string().trim().max(max).optional(),
    })
    .strict();
const id = z.string().regex(/^[a-fA-F0-9]{24}$/);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      Number.isFinite(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
    "Use a valid calendar date",
  )
  .optional();
const common = {
  title: localized(200, true),
  summary: localized(4000).default({ en: "" }),
  releaseNote: localized(2000).default({ en: "" }),
  sortOrder: z.number().int().min(0).max(100000).default(0),
  assetId: id.nullable().optional(),
};
export const reportInput = z
  .object({
    ...common,
    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    year: z.number().int().min(1900).max(2200),
    coverageStart: date,
    coverageEnd: date,
    pages: z.number().int().min(1).max(10000).optional(),
    edition: z.enum(["complete", "public-edition"]).default("complete"),
  })
  .strict();
export const certificateInput = z
  .object({
    ...common,
    issuer: z.string().trim().min(1).max(300),
    reference: z.string().trim().max(300).default(""),
    issuedAt: date,
    validFrom: date,
    expiresAt: date,
  })
  .strict();
export function documentContentRouter(auth: ReturnType<typeof createAuth>) {
  const router = Router();
  const specs = {
    reports: {
      model: Report,
      input: reportInput,
      entity: "Report" as const,
      permission: "content" as const,
      field: "publicPdf",
      dates: ["coverageStart", "coverageEnd"],
    },
    certificates: {
      model: Certificate,
      input: certificateInput,
      entity: "Certificate" as const,
      permission: "certificates" as const,
      field: "publicFile",
      dates: ["issuedAt", "validFrom", "expiresAt"],
    },
  };
  for (const [kind, spec] of Object.entries(specs)) {
    const model = spec.model as mongoose.Model<any>;
    router.use(`/${kind}`, auth.authenticate, permit(spec.permission));
    const view = (row: any) => ({
      id: String(row._id),
      version: row.__v,
      status:
        row.publishedAt && row.releaseReview === "approved"
          ? "published"
          : "draft",
      title: row.title,
      summary: row.summary ?? { en: "" },
      releaseNote: row.releaseNote ?? { en: "" },
      sortOrder: row.sortOrder,
      assetId: row[spec.field]?.assetId?.toString() ?? null,
      format: row[spec.field]?.format,
      bytes: row[spec.field]?.bytes,
      ...Object.fromEntries(
        spec.dates.map((key) => [key, row[key]?.toISOString().slice(0, 10)]),
      ),
      ...(kind === "reports"
        ? {
            slug: row.slug,
            year: row.year,
            pages: row.pages,
            edition: row.edition ?? "complete",
          }
        : { issuer: row.issuer, reference: row.reference ?? "" }),
    });
    router.get(`/${kind}`, async (req, res) => {
      const { page } = validate(
        z
          .object({ page: z.coerce.number().int().min(1).max(1000).default(1) })
          .strict(),
        req.query,
      );
      const rows = await model
        .find()
        .sort({ sortOrder: 1, _id: 1 })
        .skip((page - 1) * 20)
        .limit(20)
        .lean();
      res.json({ data: rows.map(view), meta: { page, limit: 20 } });
    });
    router.get(`/${kind}/:id`, async (req, res) => {
      validate(z.object({}).strict(), req.query);
      const row = await model.findById(validate(id, req.params.id)).lean();
      if (!row) throw new ApiError(404, "NOT_FOUND", "Document not found.");
      res.json({ data: view(row) });
    });
    for (const method of ["post", "patch", "delete"] as const)
      router[method](
        method === "post" ? `/${kind}` : `/${kind}/:id`,
        auth.csrf,
        async (req, res) => {
          const value =
            method === "post" ? undefined : validate(id, req.params.id);
          const input = validate<Record<string, any>>(
            method === "delete"
              ? z.object({ version: z.number().int().nonnegative() }).strict()
              : method === "patch"
                ? spec.input.extend({ version: z.number().int().nonnegative() })
                : spec.input,
            req.body,
          );
          const principal = res.locals.principal as Principal;
          const result = await mongoose.connection.transaction(
            async (session) => {
              await bumpPublicRevision(session);
              await Counter.findOneAndUpdate(
                { key: "security:user-governance" },
                { $inc: { sequence: 1 } },
                { session, upsert: true },
              );
              const actor = await User.findOne({
                _id: principal.id,
                active: true,
              }).session(session);
              if (!actor || !can(actor.role, spec.permission))
                throw new ApiError(
                  403,
                  "FORBIDDEN",
                  "Document administration access is required.",
                );
              const { version, assetId, ...fields } = input;
              if (method !== "delete") {
                const start =
                  kind === "reports" ? fields.coverageStart : fields.validFrom;
                const end =
                  kind === "reports" ? fields.coverageEnd : fields.expiresAt;
                if (start && end && start > end)
                  throw new ApiError(
                    400,
                    "VALIDATION_ERROR",
                    "The end date must be on or after the start date.",
                  );
                if (
                  kind === "reports" &&
                  fields.edition === "public-edition" &&
                  !fields.releaseNote.en
                )
                  throw new ApiError(
                    400,
                    "VALIDATION_ERROR",
                    "Explain any omissions in the public edition.",
                  );
              }
              const row =
                method === "post"
                  ? new model(fields)
                  : await model
                      .findOne({ _id: value, __v: version })
                      .session(session);
              if (!row)
                throw new ApiError(
                  409,
                  "VERSION_CONFLICT",
                  "Refresh this document before changing it.",
                );
              if (method === "delete") {
                await model.deleteOne(
                  { _id: row._id, __v: version },
                  { session },
                );
                await Asset.updateMany(
                  { entityType: spec.entity, entityId: row._id },
                  { $set: { visibility: "restricted" } },
                  { session },
                );
              } else {
                row.set(fields);
                for (const key of spec.dates) row.set(key, fields[key]);
                if (kind === "reports") row.pages = fields.pages;
                row.releaseReview = "pending";
                row.publishedAt = undefined;
                await bindDocumentFile(
                  row,
                  assetId,
                  principal.id,
                  session,
                  "restricted",
                  spec.entity,
                );
                if (method === "post") await row.save({ session });
                else {
                  row.__v += 1;
                  await row.validate();
                  const result = await model.replaceOne(
                    { _id: row._id, __v: version },
                    row.toObject(),
                    { session },
                  );
                  if (!result.matchedCount)
                    throw new ApiError(
                      409,
                      "VERSION_CONFLICT",
                      "Refresh this document before changing it.",
                    );
                }
              }
              await AuditLog.create(
                [
                  {
                    actorId: principal.id,
                    action: `${kind}.${method}`,
                    entityType: spec.entity,
                    entityId: row.id,
                    outcome: "success",
                    requestId: res.locals.requestId,
                    changedFields:
                      method === "delete"
                        ? ["deleted"]
                        : [...Object.keys(fields), "publicFile"],
                  },
                ],
                { session },
              );
              return {
                id: row.id,
                version: row.__v,
                status: method === "delete" ? "deleted" : "draft",
              };
            },
          );
          res.status(method === "post" ? 201 : 200).json({ data: result });
        },
      );
  }
  return router;
}
