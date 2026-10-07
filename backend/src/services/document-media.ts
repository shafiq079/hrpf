import mongoose from "mongoose";
import { Asset } from "../domain/models.js";
import { ApiError } from "../http/errors.js";

export async function bindDocumentFile(
  row: any,
  assetId: string | null | undefined,
  actorId: string,
  session: mongoose.ClientSession,
  visibility: "public" | "restricted",
  entity: "Report" | "Certificate",
) {
  const field = entity === "Report" ? "publicPdf" : "publicFile";
  const original = entity === "Report" ? row.restrictedOriginal : row.original;
  const value =
    assetId === undefined ? row[field]?.assetId?.toString() : assetId;
  if (
    value &&
    original?.assetId?.toString().toLowerCase() ===
      value.toString().toLowerCase()
  )
    throw new ApiError(
      400,
      "INVALID_ASSET",
      "Upload a separate reviewed public copy; the restricted original cannot be released.",
    );
  if (!value && visibility === "public")
    throw new ApiError(
      400,
      "REVIEW_REQUIRED",
      "Upload and review a public release file first.",
    );
  let ref;
  if (value) {
    const asset = await Asset.findOne({
      _id: value,
      purpose: entity === "Report" ? "content" : "certificate",
      scanStatus: "clean",
      deliveryType: "authenticated",
      $or: [
        {
          claimStatus: "staged",
          ownerId: actorId,
          stagingExpiresAt: { $gt: new Date() },
        },
        { claimStatus: "claimed", entityType: entity, entityId: row._id },
      ],
    }).session(session);
    if (
      !asset ||
      asset.resourceType !== (asset.format === "pdf" ? "raw" : "image") ||
      (entity === "Report" &&
        (asset.format !== "pdf" || asset.resourceType !== "raw")) ||
      (entity === "Certificate" &&
        !["pdf", "jpg", "jpeg", "png", "webp"].includes(asset.format))
    )
      throw new ApiError(
        400,
        "INVALID_ASSET",
        "Use your own clean, unexpired file or this document’s bound public copy.",
      );
    asset.set({
      visibility,
      claimStatus: "claimed",
      entityType: entity,
      entityId: row._id,
      stagingExpiresAt: undefined,
    });
    await asset.save({ session });
    ref = {
      assetId: asset._id,
      publicId: asset.publicId,
      resourceType: asset.resourceType,
      deliveryType: asset.deliveryType,
      format: asset.format,
      bytes: asset.bytes,
      version: asset.version,
      sha256: asset.sha256,
      width: asset.width,
      height: asset.height,
    };
  }
  await Asset.updateMany(
    {
      entityType: entity,
      entityId: row._id,
      ...(value ? { _id: { $ne: value } } : {}),
    },
    { $set: { visibility: "restricted" } },
    { session },
  );
  row[field] = ref;
}
