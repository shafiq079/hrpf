"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { adminRequest } from "@/lib/admin-api";
import AppImage from "@/components/shared/AppImage";
import TeamMemberCard from "@/components/people/TeamMemberCard";

export type TeamRecord = {
  id?: string;
  version?: number;
  status?: "draft" | "published";
  name: string;
  designation: string;
  responsibilities: string;
  reportingTo: string;
  rank: number;
  assetId: string | null;
};
export const newTeamMember = (): TeamRecord => ({ name: "", designation: "", responsibilities: "", reportingTo: "", rank: 1, assetId: null });
const inputClass = "mt-2 w-full rounded border border-border bg-white px-3 py-3 text-sm font-normal leading-relaxed text-text";
const buttonClass = "min-h-11 cursor-pointer rounded px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50";

export default function TeamEditor({ initial, onCancel, onSaved }: { initial: TeamRecord; onCancel: () => void; onSaved: (message: string) => void }) {
  const [record, setRecord] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [staged, setStaged] = useState<string | null>(null);
  const photo = record.assetId ? `/api/admin/assets/${record.assetId}/content?preview=1` : null;
  const change = (fields: Partial<TeamRecord>) => setRecord(previous => ({ ...previous, ...fields }));
  const failureText = (failure: unknown) => failure instanceof Error ? failure.message : "The change could not be completed.";
  async function discardStaged(id: string | null) {
    if (id) await adminRequest(`/admin/assets/${id}`, { method: "DELETE", body: "{}" });
  }
  async function cancel() {
    setBusy(true); setError("");
    try { await discardStaged(staged); onCancel(); }
    catch (failure) { setError(failureText(failure)); }
    finally { setBusy(false); }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Choose a JPG, PNG or WebP photograph up to 5 MB."); return;
    }
    setBusy(true); setError("");
    try {
      const form = new FormData(); form.set("file", file);
      const result = await adminRequest<{ assetId: string }>("/admin/assets?purpose=content", { method: "POST", body: form });
      const previous = staged;
      setStaged(result.assetId); change({ assetId: result.assetId });
      await discardStaged(previous);
    } catch (failure) { setError(failureText(failure)); }
    finally { setBusy(false); }
  }
  async function deletePhoto() {
    setBusy(true); setError("");
    try { await discardStaged(staged); setStaged(null); change({ assetId: null }); }
    catch (failure) { setError(failureText(failure)); }
    finally { setBusy(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!record.assetId) { setError("Add a photograph before saving this team member."); return; }
    const publish = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "publish";
    setBusy(true); setError("");
    try {
      const fields = { name: record.name, designation: record.designation, responsibilities: record.responsibilities, reportingTo: record.reportingTo, rank: record.rank, assetId: record.assetId };
      const saved = await adminRequest<{ id: string; version: number }>(record.id ? `/admin/team/${record.id}` : "/admin/team", {
        method: record.id ? "PATCH" : "POST",
        body: JSON.stringify({ ...fields, ...(record.id ? { version: record.version } : {}) }),
      });
      setRecord(previous => ({ ...previous, ...saved, status: "draft" })); setStaged(null);
      if (publish) await adminRequest(`/admin/publication/team/${saved.id}`, { method: "POST", body: JSON.stringify({ version: saved.version, action: "publish", releaseReviewed: true }) });
      onSaved(publish ? "Team member published." : "Team member saved as a draft.");
    } catch (failure) { setError(failureText(failure)); }
    finally { setBusy(false); }
  }
  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <button type="button" disabled={busy} onClick={() => void cancel()} className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-teal-dark"><ArrowLeft size={17} aria-hidden="true" />All team members</button>
        <button type="button" disabled={busy} onClick={() => setPreview(value => !value)} className={`${buttonClass} border border-border`}>{preview ? "Hide preview" : "Preview card"}</button>
      </div>
      <h1 className="font-serif text-3xl text-navy">{record.id ? "Edit team member" : "Add team member"}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">All member details and the photograph are required. Save a draft, or publish to show this member on Our Team. Changes to a published member create a draft until published again.</p>
      {error && <p role="alert" className="mt-5 border-s-4 border-red bg-red/5 p-4 text-sm">{error}</p>}
      {preview && <div data-public-preview className="mt-8 max-w-sm"><p className="mb-4 text-sm font-semibold text-muted">Private card preview</p><TeamMemberCard member={{ ...record, id: record.id ?? "preview", photo }} /></div>}
      <form onSubmit={event => void save(event)} className="mt-8">
        <fieldset disabled={busy} className="rounded-lg border border-border bg-white p-5 disabled:opacity-60 sm:p-8">
          <legend className="sr-only">Operational team member details</legend>
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <div>
              <label htmlFor="team-photo" className="block text-sm font-semibold text-navy">Picture <span className="font-normal text-muted">(required)</span></label>
              {photo && <div className="relative mt-3 aspect-[4/5] max-w-[220px] overflow-hidden rounded border border-border"><AppImage src={photo} alt={record.name || "Team member photograph preview"} fill sizes="220px" className="object-cover object-top" /></div>}
              <input id="team-photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="team-photo-help" className="mt-4 w-full cursor-pointer text-xs file:mb-2 file:me-3 file:cursor-pointer file:rounded file:border-0 file:bg-navy file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white" onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }} />
              <p id="team-photo-help" className="mt-2 text-xs leading-relaxed text-muted">Choose a JPG, PNG or WebP up to 5 MB. The selected photo appears above. Upload another to replace it.</p>
              {photo && <button type="button" onClick={() => void deletePhoto()} className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-red-dark"><Trash2 size={16} aria-hidden="true" />Delete photo</button>}
            </div>
            <div className="grid content-start gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-navy">Full name<input required maxLength={150} value={record.name} onChange={event => change({ name: event.target.value })} className={inputClass} /></label>
              <label className="text-sm font-semibold text-navy">Designation<input required maxLength={200} value={record.designation} onChange={event => change({ designation: event.target.value })} className={inputClass} /></label>
              <label className="text-sm font-semibold text-navy sm:col-span-2">Responsibilities<textarea required maxLength={5000} rows={6} value={record.responsibilities} onChange={event => change({ responsibilities: event.target.value })} className={inputClass} /><span className="mt-1 block text-xs font-normal leading-relaxed text-muted">Describe this member’s responsibilities. Line breaks are preserved on the public card.</span></label>
              <label className="text-sm font-semibold text-navy">Reporting to<input required maxLength={200} value={record.reportingTo} onChange={event => change({ reportingTo: event.target.value })} className={inputClass} /><span className="mt-1 block text-xs font-normal text-muted">Enter the supervisor’s name or designation.</span></label>
              <label className="text-sm font-semibold text-navy">Display order<input required type="number" min={1} max={100000} step={1} value={record.rank} onChange={event => change({ rank: Number(event.target.value) })} className={inputClass} /><span className="mt-1 block text-xs font-normal text-muted">Lower numbers appear first.</span></label>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
            <button type="submit" value="draft" className={`${buttonClass} border border-border text-navy`}>Save draft</button>
            <button type="submit" value="publish" className={`${buttonClass} bg-navy text-white hover:bg-teal-dark`}>{busy ? "Saving…" : "Save and publish"}</button>
          </div>
        </fieldset>
      </form>
    </>
  );
}
