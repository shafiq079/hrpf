import type { CSSProperties } from "react";
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

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={style}
    >
      <AppImage
        src={backgroundImage || photo.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="hrpf-hero-image object-cover"
      />
      <div
        className={`absolute inset-0 hrpf-hero-overlay${centered ? " hrpf-hero-overlay-centered" : ""}`}
      />
    </div>
  );
}
