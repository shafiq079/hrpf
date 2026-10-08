import type { ImageLoaderProps } from 'next/image';

/** Finite variants prevent arbitrary provider transformations; originals stay available to viewers. */
export function managedImageLoader({ src, width }: ImageLoaderProps): string {
  const size = width <= 480 ? 480 : width <= 960 ? 960 : 1440;
  return `${src}?w=${size}`;
}
export const isManagedImage = (src: string) => /^\/api\/public-assets\/[a-fA-F0-9]{24}$/.test(src);
