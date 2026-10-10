import { bumpPublicRevision } from '../services/public-cache.js';
import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import {
  TeamMember,
  User,
  Counter,
  Asset,
  AuditLog,
} from "../domain/models.js";
import { createAuth, type Principal } from "../security/auth.js";
import { can, permit } from "../security/permissions.js";
import { ApiError, validate } from "./errors.js";
import { bindProfilePhoto } from "../services/board-media.js";

const id = z.string().regex(/^[a-fA-F0-9]{24}$/);
export const teamInput = z.object({
  name: z.string().trim().min(1).max(150),
  designation: z.string().trim().min(1).max(200),
  responsibilities: z.string().trim().min(1).max(5000),
  reportingTo: z.string().trim().min(1).max(200),
  rank: z.number().int().min(1).max(100000).default(1),
  assetId: id,
}).strict();
export function reviewTeam(row: any) {
  if (!row.name?.trim() || !row.designation?.trim() ||
      !row.responsibilities?.trim() || !row.reportingTo?.trim() || !row.photo?.assetId)
    throw new ApiError(400, "REVIEW_REQUIRED", "Add the name, designation, responsibilities, reporting line and photograph before publication.");
}
export function teamContentRouter(auth: ReturnType<typeof createAuth>) {
  const router = Router();
  router.use("/team", auth.authenticate, permit("team"));
  const view = (row: any) => ({
    id: String(row._id),
    version: row.__v,
    status: row.isActive ? "published" : "draft",
    name: row.name,
    designation: row.designation,
    rank: row.rank,
    responsibilities: row.responsibilities,
    reportingTo: row.reportingTo,
    assetId: row.photo?.assetId?.toString() ?? null,
  });
  router.get("/team", async (req, res) => {
    const { page } = validate(
      z
        .object({ page: z.coerce.number().int().min(1).max(1000).default(1) })
        .strict(),
      req.query,
    );
    const rows = await TeamMember.find()
      .sort({ rank: 1, _id: 1 })
      .skip((page - 1) * 20)
      .limit(20)
      .lean();
    res.json({ data: rows.map(view), meta: { page, limit: 20 } });
  });
  router.get("/team/:id", async (req, res) => {
    validate(z.object({}).strict(), req.query);
    const row = await TeamMember.findById(validate(id, req.params.id)).lean();
    if (!row) throw new ApiError(404, "NOT_FOUND", "Team member not found.");
    res.json({ data: view(row) });
  });
  for (const method of ["post", "patch", "delete"] as const)
    router[method](
      method === "post" ? "/team" : "/team/:id",
      auth.csrf,
      async (req, res) => {
        const value =
          method === "post" ? undefined : validate(id, req.params.id);
        const input = validate<Record<string, any>>(
          method === "delete"
            ? z.object({ version: z.number().int().nonnegative() }).strict()
            : method === "patch"
              ? teamInput.extend({ version: z.number().int().nonnegative() })
              : teamInput,
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
            if (!actor || !can(actor.role, "team"))
              throw new ApiError(
                403,
                "FORBIDDEN",
                "Operational team administration access is required.",
              );
            const { version, assetId, ...fields } = input;
            const row =
              method === "post"
                ? new TeamMember(fields)
                : await TeamMember.findOne({
                    _id: value,
                    __v: version,
                  }).session(session);
            if (!row)
              throw new ApiError(
                409,
                "VERSION_CONFLICT",
                "Refresh this team member before changing it.",
              );
            if (method === "delete") {
              await TeamMember.deleteOne(
                { _id: row._id, __v: version },
                { session },
              );
              await Asset.updateMany(
                { entityType: "TeamMember", entityId: row._id },
                { $set: { visibility: "restricted" } },
                { session },
              );
            } else {
              row.set(fields);
              row.isActive = false;
              await bindProfilePhoto(
                row,
                assetId,
                principal.id,
                session,
                "restricted",
                "TeamMember",
              );
              if (method === "post") await row.save({ session });
              else {
                row.__v += 1;
                await row.validate();
                const changed = await TeamMember.replaceOne(
                  { _id: row._id, __v: version },
                  row.toObject(),
                  { session },
                );
                if (!changed.matchedCount)
                  throw new ApiError(
                    409,
                    "VERSION_CONFLICT",
                    "Refresh this team member before changing it.",
                  );
              }
            }
            await AuditLog.create(
              [
                {
                  actorId: principal.id,
                  action: "team." + method,
                  entityType: "TeamMember",
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
