import Image from "next/image";
import ImagePlaceholder from "./ImagePlaceholder";

/*
  Real documentary-style photography is stored under `public/images/`.
  Sources: free Unsplash License photos (for development/demo use).
  Replace with approved, licensed organisational photography before production.
*/
const IMAGES_AVAILABLE = true;

interface AppImageProps {
  src: string;
  alt: string;
  /** Fill the (relatively positioned) parent. Provide `sizes` when true. */
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Thin wrapper around next/image that degrades gracefully to a branded
 * placeholder while real assets are pending. Keeps every call site identical.
 */
export default function AppImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  className = "",
}: AppImageProps) {
  if (!IMAGES_AVAILABLE) {
    return <ImagePlaceholder fileName={src} alt={alt} className={className} />;
  }

  if (fill) {
    return (
      <Image
        src={src}
        unoptimized={src.startsWith("/api/public-assets/")}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      unoptimized={src.startsWith("/api/public-assets/")}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
