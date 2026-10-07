import mongoose from "mongoose";
import { Asset } from "../domain/models.js";
import { ApiError } from "../http/errors.js";

export async function bindBoardPhoto(
  row: any,
  assetId: string | null | undefined,
  actorId: string,
  session: mongoose.ClientSession,
  visibility: "public" | "restricted",
) {
  const value =
    assetId === undefined ? row.photo?.assetId?.toString() : assetId;
  let ref;
  if (value) {
    const asset = await Asset.findOne({
      _id: value,
      purpose: "content",
      scanStatus: { $in: ['clean', 'type_checked'] },
      deliveryType: "authenticated",
      resourceType: "image",
      format: { $in: ["jpg", "jpeg", "png", "webp"] },
      $or: [
        {
          claimStatus: "staged",
          ownerId: actorId,
          stagingExpiresAt: { $gt: new Date() },
        },
        {
          claimStatus: "claimed",
          entityType: "BoardMember",
          entityId: row._id,
        },
      ],
    }).session(session);
    if (!asset)
      throw new ApiError(
        400,
        "INVALID_ASSET",
        "Use your own clean, unexpired photograph or this profile’s bound photograph.",
      );
    asset.set({
      visibility,
      claimStatus: "claimed",
      entityType: "BoardMember",
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
      entityType: "BoardMember",
      entityId: row._id,
      ...(value ? { _id: { $ne: value } } : {}),
    },
    { $set: { visibility: "restricted" } },
    { session },
  );
  row.photo = ref;
}
