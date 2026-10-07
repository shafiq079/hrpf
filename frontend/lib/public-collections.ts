import "server-only";

export type CollectionKind = "blogs" | "projects" | "gallery" | "interviews" | "reports" | "certificates" | "board" | "team";
export type PublicCollection<T> = { status: "ok" | "unavailable"; data: T[]; page: number; pages: number };
export function collectionPage(value: string | string[] | undefined): number {
  const page = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : 1;
  return Number.isInteger(page) && page >= 1 && page <= 1000 ? page : 1;
}
/** Only public endpoints; never forward session cookies. */
export async function readPublicCollection<T>(kind: CollectionKind, page = 1, category?: "media-coverage" | "in-action", limit = 12, locale: "en" | "ur" = "en", q = ""): Promise<PublicCollection<T>> {
  try {
    const base = new URL(process.env.INTERNAL_API_URL ?? "http://127.0.0.1:5000");
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.pathname !== "/" || base.search || base.hash) throw new Error("Invalid API origin");
    const url = new URL(`/api/${kind}`, base);
    url.searchParams.set("page", String(page)); url.searchParams.set("limit", String(Math.min(48, Math.max(1, limit))));
    url.searchParams.set("locale", locale);
    if (q) url.searchParams.set("q", q.slice(0,80));
    if (category) url.searchParams.set("category", category);
    const response = await fetch(url, { cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(4000) });
    if (!response.ok) throw new Error("Unavailable");
    const body = await response.json();
    if (!Array.isArray(body.data)) throw new Error("Invalid public collection");
    const pages = Number.isInteger(body.meta?.pages) && body.meta.pages >= 0 ? Math.min(body.meta.pages, 1000) : (body.data.length ? 1 : 0);
    return { status: "ok", data: body.data, page, pages };
  } catch { return { status: "unavailable", data: [], page, pages: 0 }; }
}
export type PublicDocument = { id: string; title: string; summary: string; releaseNote?: string; file: string; view: string; download: string; format: string; bytes?: number };
export type PublicReport = PublicDocument & { year?: number; slug: string; pages?: number; edition?: "complete" | "public-edition"; coverageStart?: string; coverageEnd?: string };
export type PublicCertificate = PublicDocument & { issuer?: string; reference?: string; issuedAt?: string; validFrom?: string; expiresAt?: string };
export type PublicGalleryImage = { id: string; title: string; file: string; alt: string; caption: string; category: "media-coverage" | "in-action"; treatment?: "ORIGINAL" | "AI_RESTORATION"; mediaType?: "newspaper" | "photo" | "graphic"; sourceName?: string; sourceUrl?: string; eventDate?: string; width?: number; height?: number };
export type PublicInterview = { id: string; title: string; description: string; provider: "youtube" | "vimeo"; watchUrl: string; embedUrl: string; thumbnail: string | null; thumbnailAlt: string; sourceName?: string; eventDate?: string };
export type PublicBoardMember = { name: string; slug: string; designation: string; rank?: number; bio: string; photo: string | null; photoAlt?: string; photoZoom?: number; showOnBoard?: boolean; showOnTeam?: boolean; sections?: { heading: string; body: string }[] };
