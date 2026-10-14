import type { Metadata } from "next";

interface PageMetaOptions {
  title: string;
  description: string;
  /** Path used for the canonical URL (e.g. "/about"). */
  path?: string;
  /** Existing public image used when this page is shared. */
  image?: string | null;
  imageAlt?: string;
}

export const SITE_URL = "https://hrpf.org";
export const DEFAULT_SOCIAL_IMAGE = "/images/hrpf/home-hero.webp";
export const DEFAULT_SOCIAL_IMAGE_ALT =
  "Human Rights Protection Foundation Pakistan community advocacy";

export function createSocialImage(image?: string | null, imageAlt?: string) {
  const isDefault = !image;
  return {
    url: new URL(image || DEFAULT_SOCIAL_IMAGE, SITE_URL).toString(),
    alt: imageAlt || DEFAULT_SOCIAL_IMAGE_ALT,
    ...(isDefault
      ? { width: 1280, height: 720, type: "image/webp" }
      : {}),
  };
}

/**
 * Builds consistent per-page metadata using the site-wide title template
 * defined in the root layout ("%s | Human Rights Protection Foundation").
 */
export function createMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
}: PageMetaOptions): Metadata {
  const socialImage = createSocialImage(image, imageAlt);
  return {
    title,
    description,
    alternates: path ? { canonical: path } : undefined,
    openGraph: {
      title: `${title} | Human Rights Protection Foundation`,
      description,
      type: "website",
      url: path,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Human Rights Protection Foundation`,
      description,
      images: [socialImage],
    },
  };
}
