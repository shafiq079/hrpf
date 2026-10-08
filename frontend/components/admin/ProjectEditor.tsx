"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Save,
  Upload,
  X,
} from "lucide-react";
import { AdminField as Field, ManualUrduNote } from "@/components/admin/AdminField";
import { adminRequest } from "@/lib/admin-api";
import type {
  ProjectDetail,
  ProjectDetails,
  TextBlock,
} from "@/lib/project-details";
import ProjectDetailView from "@/components/projects/ProjectDetailView";

type Localized = { en: string; ur?: string };
type Photo = { assetId: string; alt: string; caption: string };
type Document = { assetId: string; label: string };
export type EditorRecord = {
  id?: string;
  version?: number;
  status?: string;
  title: Localized;
  summary: Localized;
  slug: string;
  locale: "en" | "ur";
  focusArea: string;
  location: string;
  projectStatus: ProjectDetail["status"];
  startYear?: number;
  coverAssetId?: string | null;
  coverAlt?: string;
  blocks: TextBlock[];
  details?: ProjectDetails;
  gallery?: Photo[];
  documents?: Document[];
};
export const newProject = (): EditorRecord => ({
  title: { en: "" },
  summary: { en: "" },
  slug: "",
  locale: "en",
  focusArea: "",
  location: "",
  projectStatus: "Proposed",
  blocks: [],
  details: {},
  gallery: [],
  documents: [],
});
const inputClass =
  "mt-2 w-full border border-border bg-white px-3 py-2.5 text-base font-normal text-text disabled:bg-soft-gray";
const buttonClass =
  "inline-flex items-center justify-center gap-2 border border-border bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-teal disabled:opacity-50";
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-border bg-white p-5 sm:p-8">
      <h2 className="text-2xl">{title}</h2>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      )}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}
function TextList({
  label,
  items,
  onChange,
  max,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  max: number;
}) {
  return (
    <div>
      <h3 className="font-sans text-sm font-semibold">{label}</h3>
      <div className="mt-3 space-y-2">
        {items.map((item, i) => (
          <div className="flex gap-2" key={i}>
            <input
              aria-label={`${label} ${i + 1}`}
              value={item}
              maxLength={500}
              required
              className={inputClass + " mt-0"}
              onChange={(event) =>
                onChange(
                  items.map((value, n) =>
                    n === i ? event.target.value : value,
                  ),
                )
              }
            />
            <button
              className={buttonClass}
              type="button"
              aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
              onClick={() => onChange(items.filter((_, n) => n !== i))}
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button
        className={buttonClass + " mt-3"}
        type="button"
        disabled={items.length >= max}
        onClick={() => onChange([...items, ""])}
      >
        <Plus size={16} aria-hidden="true" />
        Add item
      </button>
    </div>
  );
}
function moveItem<T>(items: T[], index: number, offset: number) {
  const next = [...items];
  [next[index], next[index + offset]] = [next[index + offset], next[index]];
  return next;
}

export default function ProjectEditor({
  initial,
  onSaved,
  onCancel,
}: {
  initial: EditorRecord;
  onSaved: (record: EditorRecord, message: string) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const details = form.details ?? {};
  const gallery = form.gallery ?? [];
  const documents = form.documents ?? [];
  useEffect(() => {
    if (preview) dialog.current?.showModal();
    else dialog.current?.close();
  }, [preview]);
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);
  function patch(values: Partial<EditorRecord>) {
    setForm((current) => ({ ...current, ...values }));
    setReviewed(false);
  }
  function detail(values: Partial<ProjectDetails>) {
    setForm((current) => ({
      ...current,
      details: { ...current.details, ...values },
    }));
    setReviewed(false);
  }
  const list = (
    key: "objectives" | "activities" | "outcomes" | "partners",
    label: string,
    max: number,
  ) => (
    <TextList
      label={label}
      items={details[key] ?? []}
      onChange={(items) => detail({ [key]: items })}
      max={max}
    />
  );
  async function upload(
    files: FileList | null,
    kind: "image" | "pdf",
    element: HTMLInputElement,
  ) {
    if (!files?.length) return;
    const batch = Array.from(files);
    if (
      kind === "image" &&
      batch.length + gallery.length + (form.coverAssetId ? 1 : 0) > 21
    ) {
      setError("Use one cover and up to 20 gallery photos.");
      element.value = "";
      return;
    }
    if (kind === "pdf" && batch.length + documents.length > 5) {
      setError("Use up to 5 project documents.");
      element.value = "";
      return;
    }
    setUploading(true);
    setError("");
    setNotice("");
    try {
      for (const file of batch) {
        const limit = kind === "image" ? 5 : 10;
        const accepted =
          kind === "image"
            ? ["image/jpeg", "image/png", "image/webp"]
            : ["application/pdf"];
        if (!accepted.includes(file.type) || file.size > limit * 1024 * 1024)
          throw new Error(
            `Use ${kind === "image" ? "JPG, PNG or WebP" : "PDF"} files up to ${limit} MB each.`,
          );
        const body = new FormData();
        body.append("file", file);
        const result = await adminRequest<{ assetId: string }>(
          "/admin/assets?purpose=content",
          { method: "POST", body },
        );
        setForm((current) =>
          kind === "pdf"
            ? {
                ...current,
                documents: [
                  ...(current.documents ?? []),
                  {
                    assetId: result.assetId,
                    label: file.name.replace(/\.pdf$/i, "").slice(0, 150),
                  },
                ],
              }
            : !current.coverAssetId
              ? {
                  ...current,
                  coverAssetId: result.assetId,
                  coverAlt:
                    current.title[current.locale] ||
                    current.title.en ||
                    "Project photograph",
                }
              : {
                  ...current,
                  gallery: [
                    ...(current.gallery ?? []),
                    {
                      assetId: result.assetId,
                      alt:
                        current.title[current.locale] ||
                        current.title.en ||
                        "Project photograph",
                      caption: "",
                    },
                  ],
                },
        );
        setReviewed(false);
      }
      setNotice(
        "Files uploaded and checked. Save the project to keep them in your draft.",
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      element.value = "";
    }
  }
  const story = form.blocks.filter((block) =>
    block.type === "list"
      ? block.items?.some((item) => item.trim())
      : block.text?.trim(),
  );
  const savedStory: TextBlock[] = story.length
    ? story
    : [
        {
          type: "paragraph",
          text: form.summary[form.locale] || form.summary.en,
        },
      ];
  const previewRow: ProjectDetail = {
    title: form.title[form.locale] || form.title.en || "Project title",
    summary: form.summary[form.locale] || form.summary.en,
    slug: form.slug,
    focusArea: form.focusArea,
    location: form.location,
    status: form.projectStatus,
    startYear: form.startYear,
    image: form.coverAssetId
      ? `/api/admin/assets/${form.coverAssetId}/content`
      : null,
    imageAlt: form.coverAlt,
    gallery: gallery.map((photo) => ({
      image: `/api/admin/assets/${photo.assetId}/content`,
      alt: photo.alt,
      caption: photo.caption,
    })),
    documents: documents.map((document) => ({
      file: `/api/admin/assets/${document.assetId}/content`,
      label: document.label,
    })),
    blocks: savedStory,
    details,
  };
  async function save(publish: boolean) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const body = {
        title: form.title,
        summary: form.summary,
        slug: form.slug,
        locale: form.locale,
        focusArea: form.focusArea,
        location: form.location,
        projectStatus: form.projectStatus,
        ...(form.startYear ? { startYear: form.startYear } : {}),
        blocks: savedStory,
        details,
        coverAssetId: form.coverAssetId ?? null,
        coverAlt: form.coverAlt ?? "",
        gallery,
        documents,
        ...(form.id ? { version: form.version } : {}),
      };
      const result = await adminRequest<{ id: string; version: number }>(
        form.id ? `/admin/projects/${form.id}` : "/admin/projects",
        { method: form.id ? "PATCH" : "POST", body: JSON.stringify(body) },
      );
      const saved = {
        ...form,
        id: result.id,
        version: result.version,
        status: "draft",
      };
      setForm(saved);
      if (publish) {
        try {
          await adminRequest(`/admin/publication/project/${result.id}`, {
            method: "POST",
            body: JSON.stringify({
              version: result.version,
              action: "publish",
              releaseReviewed: true,
            }),
          });
        } catch (failure) {
          throw new Error(
            `Your draft was saved, but publication failed. ${failure instanceof Error ? failure.message : "Please try again."}`,
          );
        }
        onSaved(
          { ...saved, version: result.version + 1, status: "published" },
          "Project published.",
        );
      } else onSaved(saved, "Project draft saved.");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "The project could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const action = (
            event.nativeEvent as SubmitEvent
          ).submitter?.getAttribute("value");
          void save(action === "publish");
        }}
        className="space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Project editor</p>
            <h1 className="mt-2 text-3xl">
              {form.id ? "Edit project" : "Add a project"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Build the story one section at a time. Optional sections appear
              only when filled.
            </p>
          </div>
          <button
            type="button"
            className={buttonClass}
            onClick={() => setPreview(true)}
          >
            <Eye size={17} aria-hidden="true" />
            Preview page
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="border-l-4 border-red bg-red/5 p-4 text-sm"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="border-l-4 border-teal bg-soft-gray p-4 text-sm"
          >
            {notice}
          </p>
        )}
        <fieldset disabled={busy || uploading} className="min-w-0 space-y-6">
          <Section
            title="Project essentials"
            description="These details appear in project cards and at the top of the project page."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Project title (English)">
                <input
                  required
                  maxLength={200}
                  className={inputClass}
                  value={form.title.en}
                  onChange={(event) =>
                    patch({ title: { ...form.title, en: event.target.value } })
                  }
                />
              </Field>
              <Field
                label="Page address"
                hint="Use lowercase words separated by hyphens, for example clean-water-support."
              >
                <input
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  maxLength={100}
                  className={inputClass}
                  value={form.slug}
                  onChange={(event) => patch({ slug: event.target.value })}
                />
              </Field>
              <Field label="Focus area" hint="Use the work-page names. Separate related fields with commas, for example Children's Rights, Education and Awareness.">
                <input
                  required
                  maxLength={150}
                  className={inputClass}
                  value={form.focusArea}
                  onChange={(event) => patch({ focusArea: event.target.value })}
                />
              </Field>
              <Field label="Location">
                <input
                  required
                  maxLength={150}
                  className={inputClass}
                  value={form.location}
                  onChange={(event) => patch({ location: event.target.value })}
                />
              </Field>
              <Field label="Project status">
                <select
                  className={inputClass}
                  value={form.projectStatus}
                  onChange={(event) =>
                    patch({
                      projectStatus: event.target
                        .value as EditorRecord["projectStatus"],
                    })
                  }
                >
                  {[
                    "Proposed",
                    "Ongoing",
                    "Completed",
                    "Emergency Response",
                  ].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
              <Field label="Start year (optional)">
                <input
                  type="number"
                  min={1900}
                  max={2200}
                  className={inputClass}
                  value={form.startYear ?? ""}
                  onChange={(event) =>
                    patch({
                      startYear: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                />
              </Field>
              <Field
                label="Project period (optional)"
                hint="For example March–September 2026. Only add dates you can confirm."
              >
                <input
                  maxLength={150}
                  className={inputClass}
                  value={details.period ?? ""}
                  onChange={(event) => detail({ period: event.target.value })}
                />
              </Field>
              <Field label="Who the project supports (optional)">
                <input
                  maxLength={500}
                  className={inputClass}
                  value={details.targetCommunity ?? ""}
                  onChange={(event) =>
                    detail({ targetCommunity: event.target.value })
                  }
                />
              </Field>
            </div>
            <Field
              label="Short summary (English)"
              hint="A concise introduction for the project card and page header."
            >
              <textarea
                required
                maxLength={1000}
                rows={3}
                className={inputClass}
                value={form.summary.en}
                onChange={(event) =>
                  patch({
                    summary: { ...form.summary, en: event.target.value },
                  })
                }
              />
            </Field>
            <details open={form.locale === "ur" || undefined} className="border-t border-border pt-4">
              <summary className="cursor-pointer text-sm font-semibold text-navy">
                Manual Urdu content (optional)
              </summary>
              <ManualUrduNote />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Original content language" hint="Keep English for automatic website translation. Choose Urdu only if you are writing the complete project in Urdu.">
                  <select
                    className={inputClass}
                    value={form.locale}
                    onChange={(event) =>
                      patch({ locale: event.target.value as "en" | "ur" })
                    }
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                  </select>
                </Field>
                <Field label="Project title (Urdu)">
                  <input
                    dir="rtl" lang="ur"
                    required={form.locale === "ur"}
                    maxLength={200}
                    className={inputClass}
                    value={form.title.ur ?? ""}
                    onChange={(event) =>
                      patch({
                        title: { ...form.title, ur: event.target.value },
                      })
                    }
                  />
                </Field>
                <Field label="Short summary (Urdu)">
                  <textarea
                    dir="rtl" lang="ur"
                    required={form.locale === "ur"}
                    maxLength={1000}
                    rows={3}
                    className={inputClass}
                    value={form.summary.ur ?? ""}
                    onChange={(event) =>
                      patch({
                        summary: { ...form.summary, ur: event.target.value },
                      })
                    }
                  />
                </Field>
              </div>
              <p className="mt-3 text-xs text-muted">
                This setting changes the project’s original publication language.
                Selecting Urdu requires an Urdu title, summary and story. Urdu originals use a separate Urdu URL and do not appear in the main English listing.
              </p>
            </details>
          </Section>
          <Section
            title="Photos and gallery"
            description="Add one cover and up to 20 gallery photos. JPG, PNG or WebP, up to 5 MB each. Write a clear description for every photo and add captions where useful."
          >
            <label className={buttonClass + " cursor-pointer"}>
              <Upload size={17} aria-hidden="true" />
              Upload photos
              <input
                className="sr-only"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  void upload(event.target.files, "image", event.currentTarget)
                }
              />
            </label>
            {form.coverAssetId && (
              <div className="grid gap-5 border border-border p-4 sm:grid-cols-[180px_1fr]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={`/api/admin/assets/${form.coverAssetId}/content`}
                    alt={form.coverAlt || "Project cover"}
                    fill
                    unoptimized
                    sizes="180px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <p className="eyebrow">Cover photograph</p>
                  <Field label="Image description">
                    <input
                      required
                      maxLength={300}
                      className={inputClass}
                      value={form.coverAlt ?? ""}
                      onChange={(event) =>
                        patch({ coverAlt: event.target.value })
                      }
                    />
                  </Field>
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() => patch({ coverAssetId: null, coverAlt: "" })}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Remove cover
                  </button>
                </div>
              </div>
            )}
            {gallery.map((photo, i) => (
              <div
                key={photo.assetId}
                className="grid gap-4 border border-border p-4 sm:grid-cols-[140px_1fr]"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={`/api/admin/assets/${photo.assetId}/content`}
                    alt={photo.alt}
                    fill
                    unoptimized
                    sizes="140px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <Field label={`Photo ${i + 1} description`}>
                    <input
                      required
                      maxLength={300}
                      className={inputClass}
                      value={photo.alt}
                      onChange={(event) =>
                        patch({
                          gallery: gallery.map((item, n) =>
                            n === i
                              ? { ...item, alt: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="Caption (optional)">
                    <input
                      maxLength={500}
                      className={inputClass}
                      value={photo.caption}
                      onChange={(event) =>
                        patch({
                          gallery: gallery.map((item, n) =>
                            n === i
                              ? { ...item, caption: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={buttonClass}
                      aria-label={`Move photo ${i + 1} up`}
                      disabled={i === 0}
                      onClick={() =>
                        patch({ gallery: moveItem(gallery, i, -1) })
                      }
                    >
                      <ArrowUp size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={buttonClass}
                      aria-label={`Move photo ${i + 1} down`}
                      disabled={i === gallery.length - 1}
                      onClick={() =>
                        patch({ gallery: moveItem(gallery, i, 1) })
                      }
                    >
                      <ArrowDown size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={buttonClass}
                      onClick={() =>
                        patch({
                          coverAssetId: photo.assetId,
                          coverAlt: photo.alt,
                          gallery: [
                            ...(form.coverAssetId
                              ? [
                                  {
                                    assetId: form.coverAssetId,
                                    alt: form.coverAlt || form.title.en,
                                    caption: "",
                                  },
                                ]
                              : []),
                            ...gallery.filter((_, n) => n !== i),
                          ],
                        })
                      }
                    >
                      Use as cover
                    </button>
                    <button
                      type="button"
                      className={buttonClass}
                      aria-label={`Remove photo ${i + 1}`}
                      onClick={() =>
                        patch({ gallery: gallery.filter((_, n) => n !== i) })
                      }
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Section>
          <Section
            title="Background and approach"
            description="Tell visitors why this project matters and how the Foundation responds. Separate paragraphs with a blank line."
          >
            {(["overview", "challenge", "approach"] as const).map((key) => (
              <Field
                key={key}
                label={
                  {
                    overview: "About this project",
                    challenge: "The challenge",
                    approach: "Our approach",
                  }[key]
                }
              >
                <textarea
                  rows={5}
                  maxLength={10000}
                  className={inputClass}
                  value={details[key] ?? ""}
                  onChange={(event) => detail({ [key]: event.target.value })}
                />
              </Field>
            ))}
          </Section>
          <Section title="Objectives, activities and outcomes">
            {list("objectives", "Objectives", 20)}
            {list("activities", "Activities", 30)}
            {list("outcomes", "Outcomes", 20)}
          </Section>
          <Section
            title="Timeline and milestones"
            description="Add key stages in the order you want them displayed."
          >
            {(details.milestones ?? []).map((item, i) => (
              <div key={i} className="space-y-3 border border-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Date or period">
                    <input
                      required
                      maxLength={150}
                      className={inputClass}
                      value={item.period}
                      onChange={(event) =>
                        detail({
                          milestones: details.milestones!.map((value, n) =>
                            n === i
                              ? { ...value, period: event.target.value }
                              : value,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="Milestone title">
                    <input
                      required
                      maxLength={500}
                      className={inputClass}
                      value={item.title}
                      onChange={(event) =>
                        detail({
                          milestones: details.milestones!.map((value, n) =>
                            n === i
                              ? { ...value, title: event.target.value }
                              : value,
                          ),
                        })
                      }
                    />
                  </Field>
                </div>
                <Field label="Details (optional)">
                  <textarea
                    rows={2}
                    maxLength={2000}
                    className={inputClass}
                    value={item.description ?? ""}
                    onChange={(event) =>
                      detail({
                        milestones: details.milestones!.map((value, n) =>
                          n === i
                            ? { ...value, description: event.target.value }
                            : value,
                        ),
                      })
                    }
                  />
                </Field>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={i === 0}
                    aria-label={`Move milestone ${i + 1} up`}
                    onClick={() =>
                      detail({
                        milestones: moveItem(details.milestones!, i, -1),
                      })
                    }
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={i === details.milestones!.length - 1}
                    aria-label={`Move milestone ${i + 1} down`}
                    onClick={() =>
                      detail({
                        milestones: moveItem(details.milestones!, i, 1),
                      })
                    }
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() =>
                      detail({
                        milestones: details.milestones!.filter(
                          (_, n) => n !== i,
                        ),
                      })
                    }
                  >
                    Remove milestone
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className={buttonClass}
              disabled={(details.milestones?.length ?? 0) >= 20}
              onClick={() =>
                detail({
                  milestones: [
                    ...(details.milestones ?? []),
                    { period: "", title: "", description: "" },
                  ],
                })
              }
            >
              <Plus size={16} />
              Add milestone
            </button>
          </Section>
          <Section
            title="Impact figures"
            description="Optional. Add only figures you can verify, such as people reached or facilities improved. Include a source or measurement note."
          >
            {(details.metrics ?? []).map((item, i) => (
              <div key={i} className="space-y-3 border border-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Value">
                    <input
                      required
                      maxLength={80}
                      className={inputClass}
                      value={item.value}
                      onChange={(event) =>
                        detail({
                          metrics: details.metrics!.map((value, n) =>
                            n === i
                              ? { ...value, value: event.target.value }
                              : value,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="What it measures">
                    <input
                      required
                      maxLength={150}
                      className={inputClass}
                      value={item.label}
                      onChange={(event) =>
                        detail({
                          metrics: details.metrics!.map((value, n) =>
                            n === i
                              ? { ...value, label: event.target.value }
                              : value,
                          ),
                        })
                      }
                    />
                  </Field>
                </div>
                <Field label="Source or measurement note">
                  <input
                    maxLength={500}
                    className={inputClass}
                    value={item.source ?? ""}
                    onChange={(event) =>
                      detail({
                        metrics: details.metrics!.map((value, n) =>
                          n === i
                            ? { ...value, source: event.target.value }
                            : value,
                        ),
                      })
                    }
                  />
                </Field>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() =>
                    detail({
                      metrics: details.metrics!.filter((_, n) => n !== i),
                    })
                  }
                >
                  Remove figure
                </button>
              </div>
            ))}
            <button
              type="button"
              className={buttonClass}
              disabled={(details.metrics?.length ?? 0) >= 8}
              onClick={() =>
                detail({
                  metrics: [
                    ...(details.metrics ?? []),
                    { value: "", label: "", source: "" },
                  ],
                })
              }
            >
              <Plus size={16} />
              Add impact figure
            </button>
          </Section>
          <Section title="Partners and supporting documents">
            {list("partners", "Partners", 20)}
            <label className={buttonClass + " cursor-pointer"}>
              <Upload size={17} />
              Upload PDFs
              <input
                className="sr-only"
                type="file"
                multiple
                accept="application/pdf"
                onChange={(event) =>
                  void upload(event.target.files, "pdf", event.currentTarget)
                }
              />
            </label>
            <p className="text-xs text-muted">
              Up to 5 PDFs, 10 MB each. Only upload documents intended for
              public release.
            </p>
            {documents.map((document, i) => (
              <div key={document.assetId} className="flex items-end gap-3">
                <div className="min-w-0 flex-1">
                  <Field label={`Document ${i + 1} title`}>
                    <input
                      required
                      maxLength={150}
                      className={inputClass}
                      value={document.label}
                      onChange={(event) =>
                        patch({
                          documents: documents.map((value, n) =>
                            n === i
                              ? { ...value, label: event.target.value }
                              : value,
                          ),
                        })
                      }
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  className={buttonClass}
                  aria-label={`Remove document ${i + 1}`}
                  onClick={() =>
                    patch({ documents: documents.filter((_, n) => n !== i) })
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </Section>
          <Section
            title="Additional sections"
            description="Add sections such as challenges faced, lessons learned, next steps or a community story. The heading and text will appear together on the project page."
          >
            {(details.sections ?? []).map((item, i) => (
              <div key={i} className="space-y-3 border border-border p-4">
                <Field label="Section heading">
                  <input
                    required
                    maxLength={150}
                    className={inputClass}
                    value={item.heading}
                    onChange={(event) =>
                      detail({
                        sections: details.sections!.map((value, n) =>
                          n === i
                            ? { ...value, heading: event.target.value }
                            : value,
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Section content">
                  <textarea
                    required
                    maxLength={10000}
                    rows={5}
                    className={inputClass}
                    value={item.body}
                    onChange={(event) =>
                      detail({
                        sections: details.sections!.map((value, n) =>
                          n === i
                            ? { ...value, body: event.target.value }
                            : value,
                        ),
                      })
                    }
                  />
                </Field>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={i === 0}
                    aria-label={`Move section ${i + 1} up`}
                    onClick={() =>
                      detail({ sections: moveItem(details.sections!, i, -1) })
                    }
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={i === details.sections!.length - 1}
                    aria-label={`Move section ${i + 1} down`}
                    onClick={() =>
                      detail({ sections: moveItem(details.sections!, i, 1) })
                    }
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() =>
                      detail({
                        sections: details.sections!.filter((_, n) => n !== i),
                      })
                    }
                  >
                    Remove section
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className={buttonClass}
              disabled={(details.sections?.length ?? 0) >= 12}
              onClick={() =>
                detail({
                  sections: [
                    ...(details.sections ?? []),
                    { heading: "", body: "" },
                  ],
                })
              }
            >
              <Plus size={16} />
              Add section
            </button>
          </Section>
          <Section
            title="Project story"
            description="Keep existing project text here, or add paragraphs, subheadings and lists for a more detailed story."
          >
            {form.blocks.map((block, i) => (
              <div key={i} className="space-y-3 border border-border p-4">
                <Field label={`Content block ${i + 1}`}>
                  <select
                    className={inputClass}
                    value={block.type}
                    onChange={(event) =>
                      patch({
                        blocks: form.blocks.map((value, n) =>
                          n === i
                            ? {
                                type: event.target.value as TextBlock["type"],
                                text: value.text ?? "",
                                items: value.items ?? [],
                              }
                            : value,
                        ),
                      })
                    }
                  >
                    <option value="paragraph">Paragraph</option>
                    <option value="heading">Subheading</option>
                    <option value="list">Bullet list</option>
                  </select>
                </Field>
                {block.type === "list" ? (
                  <TextList
                    label="Bullet points"
                    items={block.items ?? []}
                    max={100}
                    onChange={(items) =>
                      patch({
                        blocks: form.blocks.map((value, n) =>
                          n === i ? { type: "list", items } : value,
                        ),
                      })
                    }
                  />
                ) : (
                  <textarea
                    aria-label={`Content block ${i + 1} text`}
                    rows={block.type === "heading" ? 2 : 4}
                    maxLength={10000}
                    className={inputClass}
                    value={block.text ?? ""}
                    onChange={(event) =>
                      patch({
                        blocks: form.blocks.map((value, n) =>
                          n === i
                            ? { ...value, text: event.target.value }
                            : value,
                        ),
                      })
                    }
                  />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={i === 0}
                    aria-label={`Move block ${i + 1} up`}
                    onClick={() =>
                      patch({ blocks: moveItem(form.blocks, i, -1) })
                    }
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={i === form.blocks.length - 1}
                    aria-label={`Move block ${i + 1} down`}
                    onClick={() =>
                      patch({ blocks: moveItem(form.blocks, i, 1) })
                    }
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() =>
                      patch({ blocks: form.blocks.filter((_, n) => n !== i) })
                    }
                  >
                    Remove block
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className={buttonClass}
              disabled={form.blocks.length >= 100}
              onClick={() =>
                patch({
                  blocks: [...form.blocks, { type: "paragraph", text: "" }],
                })
              }
            >
              <Plus size={16} />
              Add content block
            </button>
          </Section>
          <div className="border border-border bg-soft-gray p-5">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-teal"
                checked={reviewed}
                onChange={(event) => setReviewed(event.target.checked)}
              />
              <span>
                I have reviewed the text, photos and documents and confirm they
                are suitable for public release.
              </span>
            </label>
            <p className="mt-3 text-xs text-muted">
              Saving changes to a published project returns it to draft. Choose
              Save & publish to make the reviewed version visible again.
            </p>
          </div>
        </fieldset>
        <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border border-border bg-white/95 p-4 backdrop-blur">
          <button
            type="button"
            className={buttonClass}
            disabled={busy || uploading}
            onClick={() => {
              if (
                window.confirm(
                  "Leave the editor? Unsaved changes will be lost.",
                )
              )
                onCancel();
            }}
          >
            Back to projects
          </button>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              value="draft"
              className={buttonClass}
              disabled={busy || uploading}
            >
              <Save size={16} />
              {busy ? "Saving…" : uploading ? "Uploading…" : "Save draft"}
            </button>
            <button
              type="submit"
              value="publish"
              disabled={busy || uploading || !reviewed}
              className="bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-50"
            >
              Save & publish
            </button>
          </div>
        </div>
      </form>
      <dialog
        data-public-preview
        ref={dialog}
        onCancel={() => setPreview(false)}
        onClose={() => setPreview(false)}
        className="fixed inset-0 m-auto h-[95dvh] max-h-[95dvh] w-[min(1400px,96vw)] max-w-none overflow-auto bg-off-white p-0 backdrop:bg-navy/70"
      >
        <div className="sticky top-0 z-30 flex items-center justify-between bg-white px-5 py-3 shadow-sm">
          <span className="text-sm font-semibold">Project page preview</span>
          <button
            type="button"
            className={buttonClass}
            onClick={() => setPreview(false)}
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>
        {preview && <ProjectDetailView project={previewRow} />}
      </dialog>
    </>
  );
}
