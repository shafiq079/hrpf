"use client";
import TranslationText from "@/components/translation/TranslationText";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AppImage from "@/components/shared/AppImage";

type Photo = { image: string; alt: string; caption?: string };
export default function ProjectGallery({ photos, label = "Project photographs" }: { photos: Photo[]; label?: string }) {
  const [index, setIndex] = useState(0);
  const touch = useRef<number | null>(null);
  const current = photos[index] ?? photos[0];
  if (!current) return null;
  const move = (step: number) =>
    setIndex((value) => (value + step + photos.length) % photos.length);
  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <div
        className="relative aspect-[16/10] overflow-hidden border border-border bg-navy"
        onTouchStart={(event) => {
          touch.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touch.current !== null) {
            const distance = event.changedTouches[0].clientX - touch.current;
            if (Math.abs(distance) > 50) move(distance > 0 ? -1 : 1);
            touch.current = null;
          }
        }}
      >
        <AppImage
          src={current.image}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 850px"
          className="object-contain"
        />
        {photos.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-navy to-transparent px-4 pb-4 pt-12">
            <button
              type="button"
              aria-label="Previous photograph"
              onClick={() => move(-1)}
              className="flex h-11 w-11 items-center justify-center border border-white/40 bg-navy/70 text-white hover:bg-teal-dark"
            >
              <ChevronLeft aria-hidden="true" size={22} />
            </button>
            <span
              className="text-sm font-medium text-white"
              aria-live="polite"
              aria-atomic="true"
            >
              <TranslationText>{index + 1}</TranslationText> <TranslationText>/ </TranslationText><TranslationText>{photos.length}</TranslationText>
            </span>
            <button
              type="button"
              aria-label="Next photograph"
              onClick={() => move(1)}
              className="flex h-11 w-11 items-center justify-center border border-white/40 bg-navy/70 text-white hover:bg-teal-dark"
            >
              <ChevronRight aria-hidden="true" size={22} />
            </button>
          </div>
        )}
      </div>
      {current.caption && (
        <p className="border-x border-b border-border bg-white px-5 py-3 text-sm leading-relaxed text-muted">
          <TranslationText>{current.caption}</TranslationText>
        </p>
      )}
      {photos.length > 1 && (
        <div
          className="mt-3 flex gap-3 overflow-x-auto pb-2"
          aria-label="Choose a photograph"
        >
          {photos.map((photo, i) => (
            <button
              key={photo.image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photograph ${i + 1}: ${photo.alt}`}
              aria-pressed={index === i}
              className={`relative h-20 w-28 shrink-0 overflow-hidden border-2 ${index === i ? "border-teal-dark" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <AppImage
                src={photo.image}
                alt=""
                fill
                sizes="112px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
