"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { adminRequest } from "@/lib/admin-api";
import { videoLink } from "@/lib/video-links";
import MediaGrid from "@/components/gallery/MediaGrid";
import InterviewGrid from "@/components/gallery/InterviewGrid";
export type MediaKind = "gallery" | "interviews";
type Localized = {
  en: string;
  ur?: string;
};
export type MediaRecord = {
  id?: string;
  version: number;
  status: string;
  title: Localized;
  sourceName: string;
  eventDate?: string;
  sortOrder: number;
  assetId: string | null;
  category: "media-coverage" | "in-action";
  mediaType: "newspaper" | "photo" | "graphic";
  alt: Localized;
  caption: Localized;
  treatment: "ORIGINAL" | "AI_RESTORATION";
  sourceUrl: string;
  duplicate?: boolean;
  description: Localized;
  videoUrl: string;
  thumbnailAlt: string;
};
export function newMedia(): MediaRecord {
  return {
    version: 0,
    status: "draft",
    title: {
      en: ""
    },
    sourceName: "",
    sortOrder: 0,
    assetId: null,
    category: "media-coverage",
    mediaType: "newspaper",
    alt: {
      en: ""
    },
    caption: {
      en: ""
    },
    treatment: "ORIGINAL",
    sourceUrl: "",
    description: {
      en: ""
    },
    videoUrl: "",
    thumbnailAlt: ""
  };
}
const inputClass = "mt-2 w-full rounded border border-border bg-white px-3 py-2.5 text-sm font-normal";
export default function GalleryEditor({
  kind,
  initial,
  onCancel,
  onSaved
}: {
  kind: MediaKind;
  initial: MediaRecord;
  onCancel: () => void;
  onSaved: (message: string) => void;
}) {
  const [record, setRecord] = useState<MediaRecord>({
    ...newMedia(),
    ...initial
  });
  const [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(""),
    [reviewed, setReviewed] = useState(false);
  const preview = useRef<HTMLDialogElement>(null),
    staged = useRef<string | null>(null),
    form = useRef<HTMLFormElement>(null);
  const isImage = kind === "gallery";
  function update<K extends keyof MediaRecord>(key: K, value: MediaRecord[K]) {
    setRecord(current => ({
      ...current,
      [key]: value
    }));
    setReviewed(false);
  }
  function text(key: "title" | "alt" | "caption" | "description", value: string, locale: "en" | "ur" = "en") {
    setRecord(current => ({
      ...current,
      [key]: {
        ...current[key],
        [locale]: value
      }
    }));
    setReviewed(false);
  }
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    if (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WebP image up to 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const uploaded = await adminRequest<{
        assetId: string;
      }>("/admin/assets?purpose=content", {
        method: "POST",
        body
      });
      const previous = staged.current;
      staged.current = uploaded.assetId;
      update("assetId", uploaded.assetId);
      if (previous) await adminRequest(`/admin/assets/${previous}`, {
        method: "DELETE",
        body: "{}"
      }).catch(() => {});
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }
  async function save(publish: boolean) {
    if (busy || uploading || !form.current?.reportValidity()) return;
    if (publish && (!reviewed || isImage && !record.assetId || record.duplicate || !isImage && record.assetId && !record.thumbnailAlt.trim())) {
      setError("Review the record and its image description before publishing. Duplicate archive records cannot be published.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const common = {
        title: record.title,
        sourceName: record.sourceName,
        eventDate: record.eventDate || undefined,
        sortOrder: record.sortOrder,
        assetId: record.assetId
      };
      const input = isImage ? {
        ...common,
        category: record.category,
        mediaType: record.mediaType,
        alt: record.alt,
        caption: record.caption,
        treatment: record.treatment,
        sourceUrl: record.sourceUrl
      } : {
        ...common,
        description: record.description,
        videoUrl: record.videoUrl,
        thumbnailAlt: record.thumbnailAlt
      };
      const saved = await adminRequest<{
        id: string;
        version: number;
        status: string;
      }>(record.id ? `/admin/${kind}/${record.id}` : `/admin/${kind}`, {
        method: record.id ? "PATCH" : "POST",
        body: JSON.stringify({
          ...input,
          ...(record.id ? {
            version: record.version
          } : {})
        })
      });
      setRecord(current => ({
        ...current,
        ...saved
      }));
      staged.current = null;
      if (publish) await adminRequest(`/admin/publication/${isImage ? "gallery" : "interview"}/${saved.id}`, {
        method: "POST",
        body: JSON.stringify({
          version: saved.version,
          action: "publish",
          releaseReviewed: true
        })
      });
      onSaved(publish ? "Media published to the Gallery." : "Draft saved privately.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The record could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void save(false);
  }
  const file = record.assetId ? `/api/admin/assets/${record.assetId}/content` : null,
    video = videoLink(record.videoUrl);
  return <>
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Gallery management</p><h1 className="mt-2 text-3xl">{record.id ? "Edit" : "Add"} {isImage ? "archive image" : "TV interview"}</h1><p className="mt-3 text-sm text-muted">Saving an edit returns the record to a private draft. Publish after reviewing your changes.</p></div><button type="button" disabled={busy || uploading} onClick={onCancel} className="border border-border px-4 py-2 text-sm">Back to Gallery</button></div>
    {error && <p role="alert" className="mb-5 border-l-4 border-red bg-red/5 p-4 text-sm">{error}</p>}
    {record.duplicate && <p className="mb-5 border-l-4 border-gold bg-gold/10 p-4 text-sm">This source record is marked as a duplicate. Its archive status is preserved; use the primary record for publication.</p>}
    <form ref={form} onSubmit={submit} className="space-y-7">
      <fieldset disabled={busy || uploading} className="grid gap-5 rounded-lg border border-border bg-white p-5 sm:grid-cols-2 sm:p-7"><legend className="px-2 text-lg font-semibold">Story and context</legend>
        <Field label="Title"><input className={inputClass} required maxLength={200} value={record.title.en} onChange={e => text("title", e.target.value)} /></Field>
        <Field label="Publication or TV channel (optional)"><input className={inputClass} maxLength={200} value={record.sourceName} onChange={e => update("sourceName", e.target.value)} /></Field>
        <Field label="Coverage or event date (optional)"><input className={inputClass} type="date" value={record.eventDate ?? ""} onChange={e => update("eventDate", e.target.value)} /><span className="mt-2 block text-xs font-normal text-muted">Leave blank when the original date is unknown.</span></Field>
        <Field label="Display order"><input className={inputClass} type="number" required min={0} max={100000} step={1} value={record.sortOrder} onChange={e => update("sortOrder", Number(e.target.value))} /><span className="mt-2 block text-xs font-normal text-muted">Lower numbers appear first.</span></Field>
        {isImage ? <>
          <Field label="Collection"><select className={inputClass} value={record.category} onChange={e => update("category", e.target.value as MediaRecord["category"])}><option value="media-coverage">Press coverage</option><option value="in-action">HRPF photographs</option></select></Field>
          <Field label="Image type"><select className={inputClass} value={record.mediaType} onChange={e => update("mediaType", e.target.value as MediaRecord["mediaType"])}><option value="newspaper">Newspaper cutting</option><option value="photo">Photograph</option><option value="graphic">Graphic</option></select></Field>
          <Field label="Original coverage link (optional)"><input className={inputClass} type="url" maxLength={2000} placeholder="https://…" value={record.sourceUrl} onChange={e => update("sourceUrl", e.target.value)} /></Field>
          <Field label="Image treatment"><select className={inputClass} value={record.treatment} onChange={e => update("treatment", e.target.value as MediaRecord["treatment"])}><option value="ORIGINAL">Original / standard cleanup</option><option value="AI_RESTORATION">AI restoration — show a public label</option></select></Field>
          <div className="sm:col-span-2"><Field label="Caption and context"><textarea className={inputClass} rows={5} maxLength={2000} value={record.caption.en} onChange={e => text("caption", e.target.value)} /></Field></div>
        </> : <>
          <div className="sm:col-span-2"><Field label="Individual video link"><input className={inputClass} required type="url" maxLength={2000} placeholder="https://www.youtube.com/watch?v=…" value={record.videoUrl} onChange={e => update("videoUrl", e.target.value)} /><span className="mt-2 block text-xs font-normal text-muted">Use a public YouTube or Vimeo interview link. Channel links and embed HTML are not accepted.</span></Field></div>
          <div className="sm:col-span-2"><Field label="Interview introduction and topics"><textarea className={inputClass} rows={6} maxLength={6000} value={record.description.en} onChange={e => text("description", e.target.value)} /></Field></div>
        </>}
      </fieldset>
      <fieldset disabled={busy || uploading} className="rounded-lg border border-border bg-white p-5 sm:p-7"><legend className="px-2 text-lg font-semibold">{isImage ? "Archive image" : "Thumbnail (optional)"}</legend><label className="block text-sm font-semibold">Upload a JPG, PNG or WebP (up to 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-3 block w-full text-sm font-normal" onChange={e => {
            void upload(e.target.files?.[0]);
            e.target.value = "";
          }} /></label>{uploading && <p role="status" className="mt-3 text-sm">Uploading and checking image…</p>}{record.assetId && <p className="mt-4 text-sm text-teal-dark">An image is attached. Open Preview to inspect it. <button type="button" onClick={() => update("assetId", null)} className="ml-3 underline">Remove image</button></p>}<div className="mt-5"><Field label={isImage ? "Image description (alt text)" : "Thumbnail description (alt text)"}><input className={inputClass} required={isImage || !!record.assetId} maxLength={300} value={isImage ? record.alt.en : record.thumbnailAlt} onChange={e => isImage ? text("alt", e.target.value) : update("thumbnailAlt", e.target.value)} /></Field></div></fieldset>
      <details className="rounded-lg border border-border bg-white p-5 sm:p-7"><summary className="cursor-pointer text-sm font-semibold">Optional Urdu text</summary><fieldset disabled={busy || uploading} className="mt-5 grid gap-5"><Field label="Urdu title"><input className={inputClass} dir="rtl" maxLength={200} value={record.title.ur ?? ""} onChange={e => text("title", e.target.value, "ur")} /></Field>{isImage && <Field label="Urdu image description"><input className={inputClass} dir="rtl" maxLength={300} value={record.alt.ur ?? ""} onChange={e => text("alt", e.target.value, "ur")} /></Field>}<Field label={isImage ? "Urdu caption" : "Urdu introduction"}><textarea className={inputClass} dir="rtl" rows={5} maxLength={isImage ? 2000 : 6000} value={(isImage ? record.caption : record.description).ur ?? ""} onChange={e => text(isImage ? "caption" : "description", e.target.value, "ur")} /></Field></fieldset></details>
      <div className="rounded-lg border border-border bg-white p-5 sm:p-7"><label className="flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" checked={reviewed} disabled={busy || uploading} onChange={e => setReviewed(e.target.checked)} className="mt-1" />I have reviewed the text and media and approve this record for public display.</label><div className="mt-6 flex flex-wrap gap-3"><button type="button" disabled={busy || uploading} onClick={() => preview.current?.showModal()} className="border border-border px-5 py-3 text-sm font-semibold">Preview</button><button disabled={busy || uploading} className="bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy ? "Saving…" : "Save draft"}</button><button type="button" disabled={busy || uploading || !reviewed || !!record.duplicate} onClick={() => void save(true)} className="bg-teal-dark px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">Save and publish</button></div></div>
    </form>
    <dialog ref={preview} className="m-auto max-h-[90dvh] w-[95vw] max-w-4xl overflow-auto rounded-lg bg-off-white p-5 backdrop:bg-navy/80 sm:p-8" aria-label="Gallery preview"><div className="mb-6 flex items-center justify-between gap-3"><h2 className="text-2xl">Gallery preview</h2><button type="button" onClick={() => preview.current?.close()} className="border border-border bg-white px-4 py-2 text-sm">Close preview</button></div>{isImage ? file ? <MediaGrid items={[{
        ...record,
        id: record.id ?? "preview",
        title: record.title.en || "Untitled image",
        file,
        alt: record.alt.en,
        caption: record.caption.en
      }]} /> : <p>Attach an image to see its preview.</p> : video ? <InterviewGrid items={[{
        ...video,
        id: record.id ?? "preview",
        title: record.title.en || "Untitled interview",
        description: record.description.en,
        thumbnail: file,
        thumbnailAlt: record.thumbnailAlt,
        sourceName: record.sourceName,
        eventDate: record.eventDate
      }]} /> : <p>Enter a valid individual video link to preview the interview.</p>}</dialog>
  </>;
}
function Field({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return <label className="block text-sm font-semibold text-navy">{label}{children}</label>;
}
