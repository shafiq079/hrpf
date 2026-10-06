import { z } from "zod";
import { projectMediaInput } from "./project-details.js";

const copy = z.string().trim().max(10000);
const line = z.string().trim().min(1).max(500);
const sourceUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Use an HTTPS source link without credentials");
export const blogDetailsInput = z
  .object({
    category: z.string().trim().max(80).optional(),
    authorName: z.string().trim().max(100).optional(),
    authorRole: z.string().trim().max(150).optional(),
    intro: copy.optional(),
    coverCaption: z.string().trim().max(500).optional(),
    takeaways: z.array(line).max(8).default([]),
    sections: z
      .array(
        z
          .object({
            heading: z.string().trim().min(1).max(150),
            body: copy.min(1),
            bullets: z.array(line).max(20).default([]),
            quote: z.string().trim().max(2000).optional(),
            attribution: z.string().trim().max(200).optional(),
          })
          .strict()
          .refine(
            (value) => !value.quote || !!value.attribution,
            "Attribute each quotation",
          ),
      )
      .max(20)
      .default([]),
    conclusion: copy.optional(),
    sources: z
      .array(
        z
          .object({
            label: z.string().trim().min(1).max(200),
            url: sourceUrl.optional(),
            note: z.string().trim().max(1000).optional(),
          })
          .strict(),
      )
      .max(12)
      .default([]),
    seoTitle: z.string().trim().max(80).optional(),
    seoDescription: z.string().trim().max(170).optional(),
  })
  .strict();
export const blogMediaInput = {
  ...projectMediaInput,
  gallery: projectMediaInput.gallery.unwrap().max(12).optional(),
  documents: projectMediaInput.documents.unwrap().max(3).optional(),
};
export function blogReadingMinutes(row: {
  blocks?: { text?: string; items?: string[] }[];
  details?: Record<string, any>;
}) {
  const details = row.details ?? {};
  const content = [
    details.intro,
    details.conclusion,
    ...(details.takeaways ?? []),
    ...(row.blocks ?? []).flatMap((block) => [
      block.text,
      ...(block.items ?? []),
    ]),
    ...(details.sections ?? []).flatMap((section: any) => [
      section.heading,
      section.body,
      section.quote,
      ...(section.bullets ?? []),
    ]),
  ]
    .filter(Boolean)
    .join(" ");
  return Math.max(
    1,
    Math.ceil(content.trim().split(/\s+/u).filter(Boolean).length / 220),
  );
}
