import type { CSSProperties } from "react";
import { getImageProps } from "next/image";
import AppImage from "./AppImage";
import {
  heroImages,
  type HeroImage,
  type HeroImageKey,
} from "@/data/hero-images";

/** Decorative photography, responsive subject framing and a text-safe overlay. */
export default function HeroBackdrop({
  image,
  backgroundImage,
  centered = false,
}: {
  image: HeroImageKey;
  backgroundImage?: string | null;
  centered?: boolean;
}) {
  const photo: HeroImage = heroImages[image];
  const position = backgroundImage ? "50% 50%" : photo.position;
  const style = {
    "--hero-position": position,
    "--hero-mobile-position": backgroundImage
      ? position
      : (photo.mobilePosition ?? position),
  } as CSSProperties;
  const variants = backgroundImage ? undefined : photo.variants;
  const common = {
    alt: "",
    sizes: "100vw",
    loading: "eager" as const,
    fetchPriority: "high" as const,
  };
  const desktop = variants
    ? getImageProps({ ...common, ...variants.desktop }).props
    : undefined;
  const mobile = variants
    ? getImageProps({ ...common, ...variants.mobile }).props
    : undefined;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={style}
    >
      {desktop && mobile ? (
        <picture>
          <source media="(min-width: 1024px)" srcSet={desktop.srcSet} sizes="100vw" />
          {/* Next.js optimizes both srcSets; the browser loads only the selected composition. */}
          <img
            {...mobile}
            alt=""
            className="hrpf-hero-image hrpf-hero-art-directed absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      ) : (
        <AppImage
          src={backgroundImage || photo.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hrpf-hero-image object-cover"
        />
      )}
      <div
        className={`absolute inset-0 hrpf-hero-overlay${centered ? " hrpf-hero-overlay-centered" : ""}`}
      />
    </div>
  );
}
