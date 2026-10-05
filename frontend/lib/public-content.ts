import "server-only";
import { cache } from "react";
export type Block = {
  type: "paragraph" | "heading" | "list";
  text?: string;
  items?: string[];
};
export type Content = {
  key?: string;
  title: string;
  blocks: Block[];
  description?: string;
  excerpt?: string;
};
export type Board = {
  name: string;
  slug: string;
  designation: string;
  slotLabel?: string;
  rank: number;
  bio: string;
  photo: string | null;
};
export type Article = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
};
export type GalleryImage = {
  id: string;
  title: string;
  file: string;
  alt: string;
  caption: string;
  category: string;
  treatment: string;
  width?: number;
  height?: number;
};
export type Resource = {
  id: string;
  title: string;
  file: string;
  download?: string;
  year?: number;
  summary?: string;
  pages?: number;
  issuer?: string;
  reference?: string;
  issuedAt?: string;
  validFrom?: string;
  expiresAt?: string;
};
export type Settings = {
  identity?: {
    name: string;
    shortName: string;
    type: string;
    website: string;
    visionLine: string;
  };
  contact?: {
    address: string;
    postalCode: string;
    phone: string;
    landline: string;
    emails: string[];
  };
  socialLinks?: Record<string, string>;
  donations?: {
    accountTitle: string;
    bank: string;
    branch: string;
    accountNumber: string;
    iban: string;
    jazzCash: string;
  };
};
export type Result<T> =
  | {
      status: "ok";
      data: T;
      meta?: { page: number; limit: number; total: number; pages: number };
    }
  | { status: "missing" | "unavailable" };
const origin = new URL(process.env.INTERNAL_API_URL ?? "http://127.0.0.1:5000");
if (
  !["http:", "https:"].includes(origin.protocol) ||
  origin.username ||
  origin.password ||
  origin.pathname !== "/" ||
  origin.search ||
  origin.hash
)
  throw new Error(
    "INTERNAL_API_URL must be an HTTP(S) origin without credentials or a path",
  );
export async function publicRead<T>(path: string): Promise<Result<T>> {
  try {
    const response = await fetch(`${origin.origin}/api/${path}`, {
      cache: "no-store",
      credentials: "omit",
      signal: AbortSignal.timeout(4000),
    });
    if (response.status === 404) return { status: "missing" };
    if (!response.ok) return { status: "unavailable" };
    const body = await response.json();
    if (!body || typeof body !== "object" || !("data" in body))
      return { status: "unavailable" };
    return {
      status: "ok",
      data: body.data as T,
      ...(body.meta ? { meta: body.meta } : {}),
    };
  } catch {
    return { status: "unavailable" };
  }
}
export const publicSettings = cache(() =>
  publicRead<Settings>("settings/public"),
);
export function pageNumber(value?: string | string[]) {
  const n = Number(typeof value === "string" ? value : "1");
  return Number.isInteger(n) && n >= 1 && n <= 1000 ? n : 1;
}
