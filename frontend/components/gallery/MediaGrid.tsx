"use client";
import TranslationText from "@/components/translation/TranslationText";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, X, ZoomIn, ZoomOut, ExternalLink } from "lucide-react";
import AppImage from "@/components/shared/AppImage";
import type { PublicGalleryImage } from "@/lib/public-collections";
export default function MediaGrid({
  items
}: {
  items: PublicGalleryImage[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const item = index === null ? null : items[index];
  function move(step: number) {
    setIndex(value => value === null ? null : (value + step + items.length) % items.length);
    setZoom(1);
  }
  return <>
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((image, position) => <li key={image.id} className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-lg">
        <button type="button" className="relative block aspect-[4/3] w-full overflow-hidden bg-soft-gray focus-visible:outline-4 focus-visible:outline-teal" aria-label={`View full image: ${image.title}`} onClick={() => {
          setIndex(position);
          setZoom(1);
          dialog.current?.showModal();
        }}>
          <AppImage src={image.file} alt={image.alt || image.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain p-3 transition-transform duration-300 group-hover:scale-105" />
          <span className="absolute bottom-3 right-3 rounded-full bg-navy p-2 text-white"><Expand size={18} aria-hidden="true" /></span>
        </button>
        <div className="p-5 sm:p-6"><p className="eyebrow text-teal-dark"><TranslationText>{image.mediaType === "newspaper" ? "Press archive" : image.mediaType === "graphic" ? "Media graphic" : "HRPF photographs"}</TranslationText></p><h2 className="mt-2 text-xl text-navy"><TranslationText>{image.title}</TranslationText></h2><Metadata item={image} />{image.caption && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted"><TranslationText>{image.caption}</TranslationText></p>}{image.treatment === "AI_RESTORATION" && <p className="mt-3 text-xs font-semibold text-muted"><TranslationText>AI-restored archive image</TranslationText></p>}</div>
      </li>)}
    </ul>
    <dialog ref={dialog} aria-labelledby="media-viewer-title" className="m-auto max-h-[95dvh] w-[95vw] max-w-6xl overflow-auto rounded-xl bg-white p-0 text-navy shadow-2xl backdrop:bg-navy/80" onClose={() => {
      setIndex(null);
      setZoom(1);
    }} onKeyDown={event => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
    }}>
      {item && <>
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-white px-4 py-3"><p className="text-sm font-semibold" aria-live="polite"><TranslationText>Image </TranslationText><TranslationText>{index! + 1}</TranslationText> <TranslationText>of </TranslationText><TranslationText>{items.length}</TranslationText></p><div className="flex items-center gap-2"><button type="button" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - 0.5))} className="rounded p-2 disabled:opacity-30"><ZoomOut size={20} /></button><button type="button" aria-label="Reset zoom" onClick={() => setZoom(1)} className="px-2 text-sm"><TranslationText>{Math.round(zoom * 100)}</TranslationText><TranslationText>%</TranslationText></button><button type="button" aria-label="Zoom in" disabled={zoom >= 4} onClick={() => setZoom(value => Math.min(4, value + 0.5))} className="rounded p-2 disabled:opacity-30"><ZoomIn size={20} /></button><button type="button" aria-label="Close image viewer" onClick={() => dialog.current?.close()} className="rounded p-2"><X size={22} /></button></div></div>
        <div className="relative bg-soft-gray"><div className="max-h-[65dvh] overflow-auto"><div className="relative" style={{
              width: `${zoom * 100}%`,
              height: `${zoom * 65}dvh`
            }}><AppImage src={item.file} alt={item.alt || item.title} fill sizes="95vw" className="object-contain" /></div></div>{items.length > 1 && <div className="absolute inset-x-3 bottom-3 flex justify-between"><button type="button" aria-label="Previous image" onClick={() => move(-1)} className="rounded-full bg-navy p-3 text-white"><ArrowLeft size={20} /></button><button type="button" aria-label="Next image" onClick={() => move(1)} className="rounded-full bg-navy p-3 text-white"><ArrowRight size={20} /></button></div>}</div>
        <div className="p-5 sm:p-7"><h2 id="media-viewer-title" className="text-2xl"><TranslationText>{item.title}</TranslationText></h2><Metadata item={item} />{item.caption && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted"><TranslationText>{item.caption}</TranslationText></p>}{item.treatment === "AI_RESTORATION" && <p className="mt-3 text-sm font-semibold"><TranslationText>AI-restored archive image</TranslationText></p>}<div className="mt-5 flex flex-wrap gap-5 text-sm font-semibold text-teal-dark"><a href={item.file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2"><TranslationText>Open full-size image</TranslationText><ExternalLink size={14} /></a>{safeSource(item.sourceUrl) && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"><TranslationText>Read original coverage</TranslationText></a>}</div></div>
      </>}
    </dialog>
  </>;
}
function Metadata({
  item
}: {
  item: PublicGalleryImage;
}) {
  return (item.sourceName || item.eventDate) && <p className="mt-2 text-xs text-muted"><TranslationText>{[item.sourceName, item.eventDate].filter(Boolean).join(" · ")}</TranslationText></p>;
}
function safeSource(value?: string) {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
