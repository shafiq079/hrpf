import type { MetadataRoute } from "next";
import { aboutSections } from "@/data/about";
import type { NewsRecord, ProjectRecord } from "@/lib/home-feed";
import { projectWorkPages } from "@/lib/project-focus";
import {
  readPublicCollection,
  type CollectionKind,
  type PublicBoardMember,
} from "@/lib/public-collections";
import { SITE_URL } from "@/lib/seo";

const staticPaths = [
  "/",
  "/about",
  ...aboutSections.map(({ slug }) => `/about/${slug}`),
  "/our-work",
  ...projectWorkPages.map(({ slug }) => `/our-work/${slug}`),
  "/projects",
  "/blogs",
  "/gallery",
  "/gallery/media-coverage",
  "/gallery/tv-interviews",
  "/impact",
  "/partner-with-us",
  "/become-a-member",
  "/contact",
  "/complaints",
  "/file-a-complaint",
  "/donate",
  "/privacy-policy",
  "/terms-of-use",
  "/safeguarding-policy",
  "/accessibility",
  "/faq",
];

async function readAll<T>(kind: CollectionKind): Promise<T[]> {
  const first = await readPublicCollection<T>(kind, 1, undefined, 48);
  if (first.status !== "ok" || first.pages <= 1) return first.data;

  const remaining = await Promise.all(
    Array.from({ length: first.pages - 1 }, (_, index) =>
      readPublicCollection<T>(kind, index + 2, undefined, 48),
    ),
  );
  return [first, ...remaining].flatMap((result) => result.data);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, blogs, people] = await Promise.all([
    readAll<ProjectRecord>("projects"),
    readAll<NewsRecord>("blogs"),
    readAll<PublicBoardMember>("board"),
  ]);

  const entries: MetadataRoute.Sitemap = [
    ...staticPaths.map((path) => ({ url: new URL(path, SITE_URL).toString() })),
    ...projects.map(({ slug }) => ({
      url: `${SITE_URL}/projects/${slug}`,
    })),
    ...blogs.map(({ slug, publishedAt }) => ({
      url: `${SITE_URL}/blogs/${slug}`,
      lastModified: publishedAt || undefined,
    })),
    ...people.map(({ slug }) => ({
      url: `${SITE_URL}/about/people/${slug}`,
    })),
  ];

  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
