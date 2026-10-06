"use client";

import { useState } from "react";
import { Play, Tv, ExternalLink, X } from "lucide-react";
import AppImage from "@/components/shared/AppImage";
import type { PublicInterview } from "@/lib/public-collections";
export default function InterviewGrid({
  items
}: {
  items: PublicInterview[];
}) {
  return <ul className="grid items-start gap-7 md:grid-cols-2">{items.map(item => <li key={item.id}><InterviewCard item={item} /></li>)}</ul>;
}
function InterviewCard({
  item
}: {
  item: PublicInterview;
}) {
  const [playing, setPlaying] = useState(false);
  return <article className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
    {playing ? <div><div className="relative aspect-video bg-navy"><iframe src={item.embedUrl} title={item.title} className="absolute inset-0 h-full w-full" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div><button type="button" onClick={() => setPlaying(false)} className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-teal-dark"><X size={16} />Close player</button></div> : <button type="button" aria-label={`Watch interview: ${item.title}`} className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-navy focus-visible:outline-4 focus-visible:outline-teal" onClick={() => setPlaying(true)}>
      {item.thumbnail ? <AppImage src={item.thumbnail} alt={item.thumbnailAlt || item.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-75" /> : <Tv size={76} className="text-white/20" aria-hidden="true" />}<span className="absolute flex size-16 items-center justify-center rounded-full bg-teal text-white shadow-lg"><Play size={26} aria-hidden="true" /></span>
    </button>}
    <div className="p-6"><p className="eyebrow text-teal-dark">TV interviews</p><h2 className="mt-2 text-2xl">{item.title}</h2>{(item.sourceName || item.eventDate) && <p className="mt-2 text-xs text-muted">{[item.sourceName, item.eventDate].filter(Boolean).join(" · ")}</p>}{item.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">{item.description}</p>}<a href={item.watchUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-dark">Watch on {item.provider === "youtube" ? "YouTube" : "Vimeo"}<ExternalLink size={14} /></a><p className="mt-3 text-xs leading-relaxed text-muted">The video provider loads when you open the player.</p></div>
  </article>;
}
