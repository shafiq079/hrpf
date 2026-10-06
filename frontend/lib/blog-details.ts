import type { TextBlock } from "./project-details";
export type BlogSection = {
  heading: string;
  body: string;
  bullets?: string[];
  quote?: string;
  attribution?: string;
};
export type BlogDetails = {
  category?: string;
  authorName?: string;
  authorRole?: string;
  intro?: string;
  coverCaption?: string;
  takeaways?: string[];
  sections?: BlogSection[];
  conclusion?: string;
  sources?: { label: string; url?: string; note?: string }[];
  seoTitle?: string;
  seoDescription?: string;
};
export type BlogDetail = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt?: string | null;
  category?: string;
  authorName?: string;
  readingMinutes?: number;
  image?: string | null;
  imageAlt?: string;
  blocks: TextBlock[];
  details?: BlogDetails;
  tags?: string[];
  gallery?: { image: string; alt: string; caption?: string }[];
  documents?: { file: string; label: string }[];
};
export function readingMinutes(blog: BlogDetail) {
  const details = blog.details ?? {};
  const words = [
    details.intro,
    details.conclusion,
    ...(details.takeaways ?? []),
    ...(blog.blocks ?? []).flatMap((block) => [
      block.text,
      ...(block.items ?? []),
    ]),
    ...(details.sections ?? []).flatMap((section) => [
      section.heading,
      section.body,
      section.quote,
      ...(section.bullets ?? []),
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .trim()
    .split(/\s+/u)
    .filter(Boolean).length;
  return blog.readingMinutes ?? Math.max(1, Math.ceil(words / 220));
}
