import { ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
  /** The expected final image path, shown as a label for editors. */
  fileName: string;
  alt: string;
  className?: string;
}

/**
 * Tasteful branded placeholder shown while real photography is pending.
 * Uses the institutional navy/teal palette instead of a broken image.
 * The parent element controls the aspect ratio.
 */
export default function ImagePlaceholder({
  fileName,
  alt,
  className = "",
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-navy text-center ${className}`}
    >
      {/* Subtle diagonal texture so the placeholder reads as intentional. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(21,156,150,0.18) 0px, rgba(21,156,150,0.18) 2px, transparent 2px, transparent 12px)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-2 px-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal/20 text-teal">
          <ImageIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-xs font-medium tracking-wide text-white/70">
          Image placeholder
        </span>
        <span className="max-w-[85%] break-all text-[11px] text-white/45">
          {fileName}
        </span>
      </div>
    </div>
  );
}
