"use client";

import { useRef, useState, type FormEvent } from "react";
import { AdminField as Field, ManualUrduNote } from "@/components/admin/AdminField";
import { adminRequest } from "@/lib/admin-api";
import DocumentGrid from "@/components/shared/DocumentGrid";
export type DocumentKind = "reports" | "certificates";
type Localized = { en: string; ur?: string };
export type DocumentRecord = {
  id?: string;
  version: number;
  status: string;
  title: Localized;
  summary: Localized;
  releaseNote: Localized;
  sortOrder: number;
  assetId: string | null;
  format?: string;
  bytes?: number;
  slug: string;
  year: number;
  pages?: number;
  coverageStart?: string;
  coverageEnd?: string;
  edition: "complete" | "public-edition";
  issuer: string;
  reference: string;
  issuedAt?: string;
  validFrom?: string;
  expiresAt?: string;
};
export function newDocument(kind: DocumentKind): DocumentRecord {
  return {
    version: 0,
    status: "draft",
    title: { en: "" },
    summary: { en: "" },
    releaseNote: { en: "" },
    sortOrder: 0,
    assetId: null,
    slug: "",
    year: new Date().getUTCFullYear(),
    edition: "complete",
    issuer: "",
    reference: "",
    format: kind === "reports" ? "pdf" : undefined,
  };
}
const inputClass =
  "mt-2 w-full rounded border border-border bg-white px-3 py-2.5 text-sm font-normal";
export default function DocumentEditor({
  kind,
  initial,
  onCancel,
  onSaved,
}: {
  kind: DocumentKind;
  initial: DocumentRecord;
  onCancel: () => void;
  onSaved: (message: string) => void;
}) {
  const [record, setRecord] = useState({ ...newDocument(kind), ...initial });
  const [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(""),
    [reviewed, setReviewed] = useState(false),
    [preview, setPreview] = useState(false);
  const staged = useRef<string | null>(null),
    form = useRef<HTMLFormElement>(null);
  const report = kind === "reports";
  function update<K extends keyof DocumentRecord>(
    key: K,
    value: DocumentRecord[K],
  ) {
    setRecord((r) => ({ ...r, [key]: value }));
    setReviewed(false);
  }
  function text(
    key: "title" | "summary" | "releaseNote",
    value: string,
    locale: "en" | "ur" = "en",
  ) {
    setRecord((r) => ({ ...r, [key]: { ...r[key], [locale]: value } }));
    setReviewed(false);
  }
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    const pdf = file.type === "application/pdf";
    if (
      (report && !pdf) ||
      !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(
        file.type,
      ) ||
      file.size > (pdf ? 10 : 5) * 1024 * 1024
    ) {
      setError(
        report
          ? "Choose a PDF up to 10 MB. Convert Word documents to PDF before uploading."
          : "Choose a PDF up to 10 MB or a JPG, PNG or WebP up to 5 MB.",
      );
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const result = await adminRequest<{
        assetId: string;
        format: string;
        bytes: number;
      }>(`/admin/assets?purpose=${report ? "content" : "certificate"}`, {
        method: "POST",
        body,
      });
      const previous = staged.current;
      staged.current = result.assetId;
      setRecord((r) => ({ ...r, ...result }));
      setReviewed(false);
      if (previous)
        await adminRequest(`/admin/assets/${previous}`, {
          method: "DELETE",
          body: "{}",
        }).catch(() => {});
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }
  async function save(publish: boolean) {
    if (busy || uploading || !form.current?.reportValidity()) return;
    if (publish && (!reviewed || !record.assetId)) {
      setError("Attach and review the public copy before publishing.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const common = {
        title: record.title,
        summary: record.summary,
        releaseNote: record.releaseNote,
        sortOrder: record.sortOrder,
        assetId: record.assetId,
      };
      const input = report
        ? {
            ...common,
            slug: record.slug,
            year: record.year,
            pages: record.pages,
            edition: record.edition,
            coverageStart: record.coverageStart || undefined,
            coverageEnd: record.coverageEnd || undefined,
          }
        : {
            ...common,
            issuer: record.issuer,
            reference: record.reference,
            issuedAt: record.issuedAt || undefined,
            validFrom: record.validFrom || undefined,
            expiresAt: record.expiresAt || undefined,
          };
      const saved = await adminRequest<{
        id: string;
        version: number;
        status: string;
      }>(record.id ? `/admin/${kind}/${record.id}` : `/admin/${kind}`, {
        method: record.id ? "PATCH" : "POST",
        body: JSON.stringify({
          ...input,
          ...(record.id ? { version: record.version } : {}),
        }),
      });
      setRecord((r) => ({ ...r, ...saved }));
      staged.current = null;
      if (publish)
        await adminRequest(
          `/admin/publication/${report ? "report" : "certificate"}/${saved.id}`,
          {
            method: "POST",
            body: JSON.stringify({
              version: saved.version,
              action: "publish",
              releaseReviewed: true,
            }),
          },
        );
      onSaved(
        publish ? "Document published." : "Document saved as a private draft.",
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Document could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void save(false);
  }
  const file = record.assetId
    ? `/api/admin/assets/${record.assetId}/content?preview=1`
    : "";
  const publicPreview = {
    id: record.id ?? "preview",
    title: record.title.en || "Untitled document",
    summary: record.summary.en,
    releaseNote: record.releaseNote.en,
    file,
    view: file,
    download: `/api/admin/assets/${record.assetId}/content`,
    format: record.format || "pdf",
    bytes: record.bytes,
  };
  const previewDocument = report
    ? {
        ...publicPreview,
        year: record.year,
        slug: record.slug,
        pages: record.pages,
        edition: record.edition,
        coverageStart: record.coverageStart,
        coverageEnd: record.coverageEnd,
      }
    : {
        ...publicPreview,
        issuer: record.issuer,
        reference: record.reference,
        issuedAt: record.issuedAt,
        validFrom: record.validFrom,
        expiresAt: record.expiresAt,
      };
  return (
    <>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Document management</p>
          <h1 className="mt-2 text-3xl">
            {record.id ? "Edit" : "Add"}{" "}
            {report ? "progress report" : "registration or certificate"}
          </h1>
          <p className="mt-3 text-sm text-muted">
            Saving an edit withdraws the published copy. Review your changes and
            publish it again when ready.
          </p>
        </div>
        <button
          type="button"
          disabled={busy || uploading}
          onClick={onCancel}
          className="border border-border px-4 py-2 text-sm"
        >
          Back to documents
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="mb-5 border-l-4 border-red bg-red/5 p-4 text-sm"
        >
          {error}
        </p>
      )}
      <form ref={form} onSubmit={submit} className="space-y-7">
        <fieldset
          disabled={busy || uploading}
          className="grid gap-5 rounded-xl border border-border bg-white p-6 sm:grid-cols-2"
        >
          <legend className="px-2 text-lg font-semibold">
            Document details
          </legend>
          <Field label="Title">
            <input
              required
              maxLength={200}
              className={inputClass}
              value={record.title.en}
              onChange={(e) => text("title", e.target.value)}
            />
          </Field>
          <Field label="Display order">
            <input
              required
              type="number"
              min={0}
              max={100000}
              step={1}
              className={inputClass}
              value={record.sortOrder}
              onChange={(e) => update("sortOrder", Number(e.target.value))}
            />
            <span className="mt-2 block text-xs font-normal text-muted">
              Lower numbers appear first.
            </span>
          </Field>
          {report ? (
            <>
              <Field label="Report year">
                <input
                  required
                  type="number"
                  min={1900}
                  max={2200}
                  step={1}
                  className={inputClass}
                  value={record.year}
                  onChange={(e) => update("year", Number(e.target.value))}
                />
              </Field>
              <Field label="Report identifier">
                <input
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  maxLength={100}
                  className={inputClass}
                  placeholder="progress-report-2026"
                  value={record.slug}
                  onChange={(e) => update("slug", e.target.value)}
                />
                <span className="mt-2 block text-xs font-normal text-muted">
                  Use a unique identifier with lowercase letters, numbers and
                  hyphens.
                </span>
              </Field>
              <Field label="Reporting period starts (optional)">
                <input
                  type="date"
                  className={inputClass}
                  value={record.coverageStart || ""}
                  onChange={(e) => update("coverageStart", e.target.value)}
                />
              </Field>
              <Field label="Reporting period ends (optional)">
                <input
                  type="date"
                  className={inputClass}
                  value={record.coverageEnd || ""}
                  onChange={(e) => update("coverageEnd", e.target.value)}
                />
              </Field>
              <Field label="PDF page count (optional)">
                <input
                  type="number"
                  min={1}
                  max={10000}
                  step={1}
                  className={inputClass}
                  value={record.pages ?? ""}
                  onChange={(e) =>
                    update(
                      "pages",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
              </Field>
              <Field label="Edition">
                <select
                  className={inputClass}
                  value={record.edition}
                  onChange={(e) =>
                    update(
                      "edition",
                      e.target.value as DocumentRecord["edition"],
                    )
                  }
                >
                  <option value="complete">Complete report</option>
                  <option value="public-edition">
                    Public edition with omissions
                  </option>
                </select>
              </Field>
            </>
          ) : (
            <>
              <Field label="Issuing organisation">
                <input
                  required
                  maxLength={300}
                  className={inputClass}
                  value={record.issuer}
                  onChange={(e) => update("issuer", e.target.value)}
                />
              </Field>
              <Field label="Reference or registration number (optional)">
                <input
                  maxLength={300}
                  className={inputClass}
                  value={record.reference}
                  onChange={(e) => update("reference", e.target.value)}
                />
              </Field>
              {(
                [
                  ["issuedAt", "Issue date (optional)"],
                  ["validFrom", "Valid from (optional)"],
                  ["expiresAt", "Valid until (optional)"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    type="date"
                    className={inputClass}
                    value={record[key] || ""}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </Field>
              ))}
              <p className="self-center text-xs leading-relaxed text-muted">
                Leave unreadable or unstated numbers and dates blank. Past
                validity dates remain visible as historical records.
              </p>
            </>
          )}
          <div className="sm:col-span-2">
            <Field label="Public summary">
              <textarea
                rows={5}
                maxLength={4000}
                className={inputClass}
                value={record.summary.en}
                onChange={(e) => text("summary", e.target.value)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes about the public copy">
              <textarea
                rows={4}
                required={report && record.edition === "public-edition"}
                maxLength={2000}
                className={inputClass}
                value={record.releaseNote.en}
                onChange={(e) => text("releaseNote", e.target.value)}
              />
              <span className="mt-2 block text-xs font-normal text-muted">
                Explain redactions, extracts, conversion or historical status.
                Required for a public edition.
              </span>
            </Field>
          </div>
        </fieldset>
        <fieldset
          disabled={busy || uploading}
          className="rounded-xl border border-border bg-white p-6"
        >
          <legend className="px-2 text-lg font-semibold">
            Reviewed public copy
          </legend>
          <p className="mb-4 text-sm leading-relaxed text-muted">
            Upload the copy that visitors should see. Remove private information
            before uploading. Files are checked and remain private until
            publication.
          </p>
          <label className="block text-sm font-semibold">
            {report
              ? "PDF, up to 10 MB"
              : "PDF, up to 10 MB; JPG, PNG or WebP, up to 5 MB"}
            <input
              type="file"
              accept={
                report
                  ? "application/pdf"
                  : "application/pdf,image/jpeg,image/png,image/webp"
              }
              className="mt-3 block w-full font-normal"
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {uploading && (
            <p role="status" className="mt-3 text-sm">
              Uploading and checking document…
            </p>
          )}
          {record.assetId && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <a
                href={file}
                target="_blank"
                rel="noopener"
                className="font-semibold text-teal-dark"
              >
                View attached public copy
              </a>
              <button
                type="button"
                onClick={() => {
                  update("assetId", null);
                  setPreview(false);
                }}
                className="underline"
              >
                Remove file
              </button>
            </div>
          )}
        </fieldset>
        <details className="rounded-xl border border-border bg-white p-6">
          <summary className="cursor-pointer text-sm font-semibold">
            Manual Urdu content (optional)
          </summary>
          <ManualUrduNote />
          <fieldset disabled={busy || uploading} className="mt-5 space-y-5">
            {(["title", "summary", "releaseNote"] as const).map((key) => (
              <Field
                key={key}
                label={`Urdu ${key === "releaseNote" ? "public copy notes" : key}`}
              >
                <textarea
                  dir="rtl" lang="ur"
                  rows={key === "title" ? 2 : 4}
                  maxLength={
                    key === "title" ? 200 : key === "summary" ? 4000 : 2000
                  }
                  className={inputClass}
                  value={record[key].ur || ""}
                  onChange={(e) => text(key, e.target.value, "ur")}
                />
              </Field>
            ))}
          </fieldset>
        </details>
        <div className="rounded-xl border border-border bg-white p-6">
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              disabled={busy || uploading}
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
              className="mt-1"
            />
            I have reviewed the public copy, its text and dates, and approve it
            for public viewing.
          </label>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || uploading}
              onClick={() => setPreview((v) => !v)}
              className="border border-border px-5 py-3 text-sm font-semibold"
            >
              {preview ? "Hide preview" : "Preview public card"}
            </button>
            <button
              disabled={busy || uploading}
              className="bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              {busy ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              disabled={busy || uploading || !reviewed || !record.assetId}
              onClick={() => void save(true)}
              className="bg-teal-dark px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Save and publish
            </button>
          </div>
        </div>
      </form>
      {preview && (
        <section data-public-preview className="mt-10" aria-label="Public document preview">
          <h2 className="mb-5 text-2xl">Public card preview</h2>
          {file ? (
            <DocumentGrid kind={kind} documents={[previewDocument]} />
          ) : (
            <p>Attach a public copy to preview this document.</p>
          )}
        </section>
      )}
    </>
  );
}
