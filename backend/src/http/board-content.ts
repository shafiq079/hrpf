import { bumpPublicRevision } from '../services/public-cache.js';
import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import {
  BoardMember,
  User,
  Counter,
  Asset,
  AuditLog,
} from "../domain/models.js";
import { createAuth, type Principal } from "../security/auth.js";
import { can, permit } from "../security/permissions.js";
import { ApiError, validate } from "./errors.js";
import { bindBoardPhoto } from "../services/board-media.js";

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
export const boardInput = z
  .object({
    name: z.string().trim().min(1).max(150),
    slug: z
      .string()
      .trim()
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    designation: z.string().trim().min(1).max(200),
    rank: z.number().int().min(1).max(100000),
    bio: localized(10000).default({ en: "" }),
    sections: z
      .array(
        z
          .object({
            heading: localized(150, true),
            body: localized(10000, true),
          })
          .strict(),
      )
      .max(16)
      .default([]),
    showOnBoard: z.boolean().default(true),
    showOnTeam: z.boolean().default(false),
    photoAlt: z.string().trim().max(300).default(""),
    photoZoom: z.number().min(1).max(2).default(1),
    assetId: id.nullable().optional(),
  })
  .strict();
export function reviewBoard(row: any) {
  if (
    (row.showOnBoard === false && !row.showOnTeam) ||
    !row.bio?.en?.trim() ||
    (row.photo && !row.photoAlt?.trim())
  )
    throw new ApiError(
      400,
      "REVIEW_REQUIRED",
      "Review the biography, page placement and photograph description before publication.",
    );
}
export function boardContentRouter(auth: ReturnType<typeof createAuth>) {
  const router = Router();
  router.use("/board", auth.authenticate, permit("board"));
  const view = (row: any) => ({
    id: String(row._id),
    version: row.__v,
    status: row.isActive ? "published" : "draft",
    name: row.name,
    slug: row.slug,
    designation: row.designation,
    rank: row.rank,
    bio: row.bio ?? { en: "" },
    sections: row.sections ?? [],
    showOnBoard: row.showOnBoard !== false,
    showOnTeam: row.showOnTeam === true,
    photoAlt: row.photoAlt ?? "",
    photoZoom: row.photoZoom ?? 1,
    assetId: row.photo?.assetId?.toString() ?? null,
  });
  router.get("/board", async (req, res) => {
    const { page } = validate(
      z
        .object({ page: z.coerce.number().int().min(1).max(1000).default(1) })
        .strict(),
      req.query,
    );
    const rows = await BoardMember.find()
      .sort({ rank: 1, _id: 1 })
      .skip((page - 1) * 20)
      .limit(20)
      .lean();
    res.json({ data: rows.map(view), meta: { page, limit: 20 } });
  });
  router.get("/board/:id", async (req, res) => {
    validate(z.object({}).strict(), req.query);
    const row = await BoardMember.findById(validate(id, req.params.id)).lean();
    if (!row) throw new ApiError(404, "NOT_FOUND", "Profile not found.");
    res.json({ data: view(row) });
  });
  for (const method of ["post", "patch", "delete"] as const)
    router[method](
      method === "post" ? "/board" : "/board/:id",
      auth.csrf,
      async (req, res) => {
        const value =
          method === "post" ? undefined : validate(id, req.params.id);
        const input = validate<Record<string, any>>(
          method === "delete"
            ? z.object({ version: z.number().int().nonnegative() }).strict()
            : method === "patch"
              ? boardInput.extend({ version: z.number().int().nonnegative() })
              : boardInput,
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
            if (!actor || !can(actor.role, "board"))
              throw new ApiError(
                403,
                "FORBIDDEN",
                "Profile administration access is required.",
              );
            const { version, assetId, ...fields } = input;
            const row =
              method === "post"
                ? new BoardMember(fields)
                : await BoardMember.findOne({
                    _id: value,
                    __v: version,
                  }).session(session);
            if (!row)
              throw new ApiError(
                409,
                "VERSION_CONFLICT",
                "Refresh this profile before changing it.",
              );
            if (method === "delete") {
              await BoardMember.deleteOne(
                { _id: row._id, __v: version },
                { session },
              );
              await Asset.updateMany(
                { entityType: "BoardMember", entityId: row._id },
                { $set: { visibility: "restricted" } },
                { session },
              );
            } else {
              row.set(fields);
              row.isActive = false;
              await bindBoardPhoto(
                row,
                assetId,
                principal.id,
                session,
                "restricted",
              );
              if (method === "post") await row.save({ session });
              else {
                row.__v += 1;
                await row.validate();
                const changed = await BoardMember.replaceOne(
                  { _id: row._id, __v: version },
                  row.toObject(),
                  { session },
                );
                if (!changed.matchedCount)
                  throw new ApiError(
                    409,
                    "VERSION_CONFLICT",
                    "Refresh this profile before changing it.",
                  );
              }
            }
            await AuditLog.create(
              [
                {
                  actorId: principal.id,
                  action: "board." + method,
                  entityType: "BoardMember",
                  entityId: row.id,
                  outcome: "success",
                  requestId: res.locals.requestId,
                  changedFields:
                    method === "delete"
                      ? ["deleted"]
                      : [...Object.keys(fields), "photo"],
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
  return router;
}
