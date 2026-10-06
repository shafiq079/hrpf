import "server-only";
import type { Project } from "@/data/projects";
import type { NewsArticle } from "@/data/news";
export type HomeProject = Project & {
  statusLabel?: string;
  startedLabel?: string;
};
export type HomeNews = NewsArticle & { dateLabel?: string };
type Result<T> =
  { status: "ok"; data: T[] } | { status: "unavailable"; data: [] };
export async function readHomeFeed<T>(
  path: "projects" | "news" | "blogs",
  limit = 3,
): Promise<Result<T>> {
  try {
    const base = new URL(
      process.env.INTERNAL_API_URL ?? "http://127.0.0.1:5000",
    );
    if (
      !["http:", "https:"].includes(base.protocol) ||
      base.username ||
      base.password ||
      base.pathname !== "/"
    )
      throw new Error("Invalid API origin");
    const response = await fetch(`${base.origin}/api/${path}?limit=${Math.min(48, Math.max(1, limit))}`, {
      cache: "no-store",
      credentials: "omit",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error("Unavailable");
    const body = await response.json();
    if (!Array.isArray(body.data)) throw new Error("Invalid feed");
    return { status: "ok", data: body.data };
  } catch {
    return { status: "unavailable", data: [] };
  }
}
export type ProjectRecord = {
  title: string;
  slug: string;
  summary: string;
  focusArea: string;
  status: Project["status"];
  location: string;
  startYear?: number;
  image?: string | null;
  imageAlt?: string;
};
export type NewsRecord = {
  category?: string;
  authorName?: string;
  readingMinutes?: number;
  imageAlt?: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  image?: string | null;
};
export function projectCard(row: ProjectRecord): HomeProject {
  return {
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    focusArea: row.focusArea,
    status: row.status,
    location: row.location,
    startYear: row.startYear ?? 0,
    startedLabel: row.startYear ? undefined : "HRPF programme",
    image: row.image ?? "/images/hrpf/home-about.webp",
    imageAlt: row.image
      ? (row.imageAlt || row.title)
      : "HRPF archive photograph illustrating the Foundation’s work",
    href: `/programmes/${row.slug}`,
    objectives: [],
    activities: [],
    outcomes: [],
    partners: [],
    gallery: [],
  } as HomeProject;
}
export function newsCard(row: NewsRecord): HomeNews {
  return {
    title: row.title,
    slug: row.slug,
    summary: row.excerpt,
    category: row.category || "HRPF Blogs",
    date: row.publishedAt,
    readingTime: row.readingMinutes ? `${row.readingMinutes} min read` : "Foundation update",
    image: row.image ?? "/images/hrpf/home-chairman.webp",
    imageAlt: row.image
      ? (row.imageAlt || row.title)
      : "HRPF archive photograph illustrating the Foundation’s work",
    href: `/blogs/${row.slug}`,
  } as HomeNews;
}

export async function readHomeDetail(path: "projects" | "news" | "blogs", slug: string, locale: "en" | "ur" = "en") {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100)
    return null;
  try {
    const base = new URL(
      process.env.INTERNAL_API_URL ?? "http://127.0.0.1:5000",
    );
    if (
      !["http:", "https:"].includes(base.protocol) ||
      base.username ||
      base.password ||
      base.pathname !== "/"
    )
      return null;
    const response = await fetch(`${base.origin}/api/${path}/${slug}?locale=${locale}`, {
      cache: "no-store",
      credentials: "omit",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;
    return (await response.json()).data;
  } catch {
    return null;
  }
}
