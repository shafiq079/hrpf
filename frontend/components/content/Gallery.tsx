"use client";
import { useEffect, useRef, useState } from "react";
import AppImage from "@/components/shared/AppImage";
import type { GalleryImage } from "@/lib/public-content";
export default function Gallery({ images }: { images: GalleryImage[] }) {
  const [selected, setSelected] = useState<number | null>(null),
    [zoom, setZoom] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (selected === null || !element) return;
    if (!element.open) element.showModal();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [selected]);
  const image = selected === null ? null : images[selected];
  function move(offset: number) {
    setSelected((n) =>
      n === null ? null : (n + offset + images.length) % images.length,
    );
    setZoom(false);
  }
  return (
    <>
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        {images.map((item, index) => (
          <figure
            key={item.id}
            className="mb-6 break-inside-avoid border border-border bg-white"
          >
            <button
              type="button"
              onClick={() => {
                setSelected(index);
                setZoom(false);
              }}
              className="block w-full text-left"
              aria-label={`Open image: ${item.alt || item.title}`}
            >
              <AppImage
                src={item.file}
                alt={item.alt}
                width={item.width ?? 800}
                height={item.height ?? 600}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full"
              />
            </button>
            <figcaption className="p-4">
              <h2 className="font-serif text-lg text-navy">{item.title}</h2>
              {item.caption && (
                <p className="mt-2 text-sm text-muted">{item.caption}</p>
              )}
              {item.treatment === "AI_RESTORATION" && (
                <p className="mt-2 text-xs text-muted">AI-restored image</p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      <dialog
        ref={dialog}
        onClose={() => setSelected(null)}
        aria-label="Gallery image viewer"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") move(1);
          if (event.key === "ArrowLeft") move(-1);
        }}
        className="m-auto max-h-[95dvh] w-[min(95vw,1200px)] max-w-none bg-white p-4 text-navy backdrop:bg-navy-dark/90"
      >
        {image && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">
                {image.title} · {(selected ?? 0) + 1} / {images.length}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setZoom((v) => !v)}
                  aria-pressed={zoom}
                  className="border border-border px-3 py-2"
                >
                  {zoom ? "Fit image" : "Zoom image"}
                </button>
                <button
                  type="button"
                  onClick={() => dialog.current?.close()}
                  className="bg-navy px-3 py-2 text-white"
                  autoFocus
                >
                  Close
                </button>
              </div>
            </div>
            <div className="max-h-[70dvh] overflow-auto">
              <AppImage
                src={image.file}
                alt={image.alt}
                width={image.width ?? 1200}
                height={image.height ?? 900}
                className={
                  zoom
                    ? "h-auto max-w-none"
                    : "mx-auto h-auto max-h-[65dvh] w-auto max-w-full object-contain"
                }
              />
            </div>
            <p className="mt-3 text-sm text-muted">{image.caption}</p>
            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={() => move(-1)}
                className="border border-border px-4 py-2"
              >
                Previous image
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                className="border border-border px-4 py-2"
              >
                Next image
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
