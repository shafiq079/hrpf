import type { Metadata } from "next";

interface PageMetaOptions {
  title: string;
  description: string;
  /** Path used for the canonical URL (e.g. "/about"). */
  path?: string;
}

/**
 * Builds consistent per-page metadata using the site-wide title template
 * defined in the root layout ("%s | Human Rights Protection Foundation").
 */
export function createMetadata({
  title,
  description,
  path,
}: PageMetaOptions): Metadata {
  return {
    title,
    description,
    alternates: path ? { canonical: path } : undefined,
    openGraph: {
      title: `${title} | Human Rights Protection Foundation`,
      description,
      type: "website",
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Human Rights Protection Foundation`,
      description,
    },
  };
}
