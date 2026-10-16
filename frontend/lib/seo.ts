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
// A static JPEG is readable by Meta's link crawler without the API or image optimizer.
export const DEFAULT_SOCIAL_IMAGE = "/images/social/v1/hrpf-share.jpg";
export const DEFAULT_SOCIAL_IMAGE_ALT =
  "Human Rights Protection Foundation Pakistan community advocacy";

export function createSocialImage(image?: string | null, imageAlt?: string) {
  const isDefault = !image;
  const url = new URL(image || DEFAULT_SOCIAL_IMAGE, SITE_URL).toString();
  return {
    url,
    secureUrl: url,
    alt: isDefault ? DEFAULT_SOCIAL_IMAGE_ALT : imageAlt || DEFAULT_SOCIAL_IMAGE_ALT,
    ...(isDefault
      ? { width: 1280, height: 720, type: "image/jpeg" }
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
      siteName: "Human Rights Protection Foundation",
      url: path,
      // Keep the page's cover first, with a compatible public backup for crawlers.
      images: image ? [socialImage, createSocialImage()] : [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Human Rights Protection Foundation`,
      description,
      images: [socialImage],
    },
  };
}
