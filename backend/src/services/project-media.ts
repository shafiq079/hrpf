import mongoose from "mongoose";
import { Asset } from "../domain/models.js";
import { ApiError } from "../http/errors.js";

type MediaInput = {
  coverAssetId?: string | null | undefined;
  gallery?: { assetId: string; alt: string; caption?: string }[] | undefined;
  documents?: { assetId: string; label: string }[] | undefined;
};
// Binding is part of the content transaction. A saved draft retains its media,
// but neither public URLs nor Cloudinary delivery are released until publication.
export async function bindContentMedia(
  row: any,
  input: MediaInput,
  actorId: string,
  session: mongoose.ClientSession,
  visibility: "public" | "restricted",
  entityType: "Project" | "BlogPost" | "GalleryItem" | "VideoInterview" = "Project",
) {
  const coverId =
    input.coverAssetId === undefined
      ? row.cover?.assetId?.toString()
      : input.coverAssetId;
  const gallery: NonNullable<MediaInput["gallery"]> =
    input.gallery ??
    (row.gallery ?? []).map((item: any) => ({
      assetId: item.asset.assetId.toString(),
      alt: item.alt,
      caption: item.caption,
    }));
  const documents: NonNullable<MediaInput["documents"]> =
    input.documents ??
    (row.documents ?? []).map((item: any) => ({
      assetId: item.asset.assetId.toString(),
      label: item.label,
    }));
  const requests = [
    ...(coverId ? [{ assetId: coverId, kind: "image" }] : []),
    ...gallery.map((item) => ({ assetId: item.assetId, kind: "image" })),
    ...documents.map((item) => ({ assetId: item.assetId, kind: "pdf" })),
  ];
  if (
    new Set(requests.map((item) => item.assetId.toLowerCase())).size !==
    requests.length
  )
    throw new ApiError(
      400,
      "INVALID_ASSET",
      "Each content file must appear only once.",
    );
  const refs = new Map<string, Record<string, unknown>>();
  for (const request of requests) {
    const asset = await Asset.findOne({
      _id: request.assetId,
      purpose: "content",
      deliveryType: "authenticated",
      scanStatus: { $in: ['clean', 'type_checked'] },
      resourceType: request.kind === "pdf" ? "raw" : "image",
      format:
        request.kind === "pdf"
          ? "pdf"
          : { $in: ["jpg", "jpeg", "png", "webp"] },
      $or: [
        {
          claimStatus: "staged",
          ownerId: actorId,
          stagingExpiresAt: { $gt: new Date() },
        },
        { claimStatus: "claimed", entityType, entityId: row._id },
      ],
    }).session(session);
    if (!asset)
      throw new ApiError(
        400,
        "INVALID_ASSET",
        "Use a validated bound file or your own unexpired uploaded file.",
      );
    asset.visibility = visibility;
    asset.claimStatus = "claimed";
    asset.entityType = entityType;
    asset.entityId = row._id;
    asset.set("stagingExpiresAt", undefined);
    await asset.save({ session });
    refs.set(request.assetId, {
      assetId: asset._id,
      publicId: asset.publicId,
      resourceType: asset.resourceType,
      deliveryType: asset.deliveryType,
      format: asset.format,
      bytes: asset.bytes,
      width: asset.width,
      height: asset.height,
      version: asset.version,
      sha256: asset.sha256,
    });
  }
  await Asset.updateMany(
    {
      entityType,
      entityId: row._id,
      _id: { $nin: requests.map((item) => item.assetId) },
    },
    { $set: { visibility: "restricted" } },
    { session },
  );
  row.cover = coverId ? refs.get(coverId) : undefined;
  row.gallery = gallery.map((item) => ({
    asset: refs.get(item.assetId),
    alt: item.alt,
    caption: item.caption,
  }));
  row.documents = documents.map((item) => ({
    asset: refs.get(item.assetId),
    label: item.label,
  }));
}
export const bindProjectMedia = bindContentMedia;
