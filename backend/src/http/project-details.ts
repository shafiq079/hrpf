import { z } from "zod";

const line = z.string().trim().min(1).max(500);
const copy = z.string().trim().max(10000);
export const projectDetailsInput = z
  .object({
    overview: copy.optional(),
    challenge: copy.optional(),
    approach: copy.optional(),
    period: z.string().trim().max(150).optional(),
    targetCommunity: z.string().trim().max(500).optional(),
    objectives: z.array(line).max(20).default([]),
    activities: z.array(line).max(30).default([]),
    outcomes: z.array(line).max(20).default([]),
    partners: z.array(line).max(20).default([]),
    milestones: z
      .array(
        z
          .object({
            period: z.string().trim().min(1).max(150),
            title: line,
            description: z.string().trim().max(2000).optional(),
          })
          .strict(),
      )
      .max(20)
      .default([]),
    metrics: z
      .array(
        z
          .object({
            value: z.string().trim().min(1).max(80),
            label: z.string().trim().min(1).max(150),
            source: z.string().trim().max(500).optional(),
          })
          .strict(),
      )
      .max(8)
      .default([]),
    sections: z
      .array(
        z
          .object({
            heading: z.string().trim().min(1).max(150),
            body: copy.min(1),
          })
          .strict(),
      )
      .max(12)
      .default([]),
  })
  .strict();
export const projectMediaInput = {
  coverAssetId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/)
    .nullable()
    .optional(),
  coverAlt: z.string().trim().max(300).optional(),
  gallery: z
    .array(
      z
        .object({
          assetId: z.string().regex(/^[a-fA-F0-9]{24}$/),
          alt: z.string().trim().min(1).max(300),
          caption: z.string().trim().max(500).optional(),
        })
        .strict(),
    )
    .max(20)
    .optional(),
  documents: z
    .array(
      z
        .object({
          assetId: z.string().regex(/^[a-fA-F0-9]{24}$/),
          label: z.string().trim().min(1).max(150),
        })
        .strict(),
    )
    .max(5)
    .optional(),
};
