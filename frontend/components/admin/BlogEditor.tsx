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
import { adminRequest } from "@/lib/admin-api";
import type { BlogDetail, BlogDetails, BlogSection } from "@/lib/blog-details";
import type { TextBlock } from "@/lib/project-details";
import BlogDetailView from "@/components/blogs/BlogDetailView";
type Photo = { assetId: string; alt: string; caption: string };
type Document = { assetId: string; label: string };
export type EditorRecord = {
  id?: string;
  version?: number;
  status?: string;
  title: { en: string; ur?: string };
  excerpt: { en: string; ur?: string };
  slug: string;
  locale: "en" | "ur";
  blocks: TextBlock[];
  details?: BlogDetails;
  tags?: string[];
  coverAssetId?: string | null;
  coverAlt?: string;
  gallery?: Photo[];
  documents?: Document[];
};
export const newBlog = (): EditorRecord => ({
  title: { en: "" },
  excerpt: { en: "" },
  slug: "",
  locale: "en",
  blocks: [],
  details: {},
  tags: [],
  gallery: [],
  documents: [],
});
const inputClass =
  "mt-2 w-full border border-border bg-white px-3 py-2.5 text-sm text-text disabled:bg-soft-gray";
const buttonClass =
  "inline-flex items-center justify-center gap-2 border border-border bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-teal disabled:opacity-50";
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block min-w-0 text-sm font-semibold text-navy">
      {label}
      {children}
      {hint && (
        <span className="mt-1.5 block text-xs font-normal leading-relaxed text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}
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
  maxLength = 500,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  max: number;
  maxLength?: number;
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
              maxLength={maxLength}
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

export default function BlogEditor({
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
  const sections = details.sections ?? [];
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
  function detail(values: Partial<BlogDetails>) {
    setForm((current) => ({
      ...current,
      details: { ...current.details, ...values },
    }));
    setReviewed(false);
  }
  function section(index: number, values: Partial<BlogSection>) {
    detail({
      sections: sections.map((item, i) =>
        i === index ? { ...item, ...values } : item,
      ),
    });
  }
  async function upload(
    files: FileList | null,
    kind: "image" | "pdf",
    element: HTMLInputElement,
  ) {
    if (!files?.length) return;
    const batch = Array.from(files);
    if (
      kind === "image" &&
      batch.length + gallery.length + (form.coverAssetId ? 1 : 0) > 13
    ) {
      setError("Use one cover and up to 12 gallery photos.");
      element.value = "";
      return;
    }
    if (kind === "pdf" && batch.length + documents.length > 3) {
      setError("Use up to 3 blog documents.");
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
                    "Blog photograph",
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
                        "Blog photograph",
                      caption: "",
                    },
                  ],
                },
        );
        setReviewed(false);
      }
      setNotice(
        "Files uploaded and scanned. Save the blog to keep them in your draft.",
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
  const savedStory: TextBlock[] =
    story.length || details.intro?.trim() || details.sections?.length
      ? story
      : [
          {
            type: "paragraph",
            text: form.excerpt[form.locale] || form.excerpt.en,
          },
        ];
  const savedDetails = details;
  const previewRow: BlogDetail = {
    title: form.title[form.locale] || form.title.en || "Blog title",
    excerpt: form.excerpt[form.locale] || form.excerpt.en,
    slug: form.slug,
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
    details: savedDetails,
    tags: form.tags,
  };
  async function save(publish: boolean) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const body = {
        title: form.title,
        excerpt: form.excerpt,
        slug: form.slug,
        locale: form.locale,
        blocks: savedStory,
        details: savedDetails,
        tags: form.tags ?? [],
        coverAssetId: form.coverAssetId ?? null,
        coverAlt: form.coverAlt ?? "",
        gallery,
        documents,
        ...(form.id ? { version: form.version } : {}),
      };
      const result = await adminRequest<{ id: string; version: number }>(
        form.id ? `/admin/blogs/${form.id}` : "/admin/blogs",
        { method: form.id ? "PATCH" : "POST", body: JSON.stringify(body) },
      );
      const saved = {
        ...form,
        blocks: savedStory,
        details: savedDetails,
        id: result.id,
        version: result.version,
        status: "draft",
      };
      setForm(saved);
      if (publish) {
        try {
          await adminRequest(`/admin/publication/blog/${result.id}`, {
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
          "Blog published.",
        );
      } else onSaved(saved, "Blog draft saved.");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "The blog could not be saved.",
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
      >
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Blog editor</p>
            <h1 className="mt-2 text-3xl">
              {form.id ? "Edit blog" : "Add blog"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Tell a complete story with clear sections, photographs and
              sources.
            </p>
          </div>
          <button
            type="button"
            className={buttonClass}
            disabled={busy || uploading}
            onClick={() => setPreview(true)}
          >
            <Eye size={18} aria-hidden="true" />
            Preview page
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
        {notice && (
          <p
            role="status"
            className="mb-5 border-l-4 border-teal bg-soft-gray p-4 text-sm"
          >
            {notice}
          </p>
        )}
        <fieldset disabled={busy || uploading} className="space-y-6">
          <Section
            title="Article essentials"
            description="The title and excerpt also appear on blog cards. Leave the public author blank to use HRPF Pakistan."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="English title">
                <input
                  className={inputClass}
                  required
                  maxLength={200}
                  value={form.title.en}
                  onChange={(event) =>
                    patch({ title: { ...form.title, en: event.target.value } })
                  }
                />
              </Field>
              <Field label="Article language">
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
            </div>
            {form.locale === "ur" && (
              <Field label="Urdu title">
                <input
                  className={inputClass}
                  required
                  maxLength={200}
                  dir="rtl"
                  value={form.title.ur ?? ""}
                  onChange={(event) =>
                    patch({ title: { ...form.title, ur: event.target.value } })
                  }
                />
              </Field>
            )}
            <Field
              label="Page URL"
              hint="Use lowercase words separated by hyphens, e.g. safer-communities."
            >
              <input
                className={inputClass}
                required
                maxLength={100}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                value={form.slug}
                onChange={(event) => patch({ slug: event.target.value })}
              />
            </Field>
            <Field label="English excerpt">
              <textarea
                className={inputClass}
                required
                rows={3}
                maxLength={1000}
                value={form.excerpt.en}
                onChange={(event) =>
                  patch({
                    excerpt: { ...form.excerpt, en: event.target.value },
                  })
                }
              />
            </Field>
            {form.locale === "ur" && (
              <Field label="Urdu excerpt">
                <textarea
                  className={inputClass}
                  required
                  rows={3}
                  maxLength={1000}
                  dir="rtl"
                  value={form.excerpt.ur ?? ""}
                  onChange={(event) =>
                    patch({
                      excerpt: { ...form.excerpt, ur: event.target.value },
                    })
                  }
                />
              </Field>
            )}
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Category">
                <input
                  className={inputClass}
                  maxLength={80}
                  placeholder="Community advocacy"
                  value={details.category ?? ""}
                  onChange={(event) => detail({ category: event.target.value })}
                />
              </Field>
              <Field label="Public author name">
                <input
                  className={inputClass}
                  maxLength={100}
                  value={details.authorName ?? ""}
                  onChange={(event) =>
                    detail({ authorName: event.target.value })
                  }
                />
              </Field>
              <Field label="Public author role">
                <input
                  className={inputClass}
                  maxLength={150}
                  value={details.authorRole ?? ""}
                  onChange={(event) =>
                    detail({ authorRole: event.target.value })
                  }
                />
              </Field>
            </div>
            <TextList
              label="Topics / tags"
              items={form.tags ?? []}
              onChange={(items) => patch({ tags: items })}
              max={12}
              maxLength={50}
            />
          </Section>
          <Section
            title="Story and key takeaways"
            description="Write in plain text. Add a new section for each part of the story; quotations need an attribution."
          >
            <Field label="Introduction">
              <textarea
                className={inputClass}
                rows={5}
                maxLength={10000}
                value={details.intro ?? ""}
                onChange={(event) => detail({ intro: event.target.value })}
              />
            </Field>
            <TextList
              label="Key takeaways"
              items={details.takeaways ?? []}
              onChange={(items) => detail({ takeaways: items })}
              max={8}
            />
            {form.blocks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl">Existing article text</h3>
                <p className="text-sm text-muted">
                  This text remains part of the article. You can edit it or move
                  the story into sections below.
                </p>
                {form.blocks.map((block, i) => (
                  <div key={i} className="border border-border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {block.type} {i + 1}
                      </span>
                      <button
                        type="button"
                        className={buttonClass}
                        aria-label={`Remove text block ${i + 1}`}
                        onClick={() =>
                          patch({
                            blocks: form.blocks.filter((_, n) => n !== i),
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <textarea
                      aria-label={`Article text block ${i + 1}`}
                      className={inputClass}
                      rows={4}
                      maxLength={10000}
                      value={
                        block.type === "list"
                          ? (block.items?.join("\n") ?? "")
                          : (block.text ?? "")
                      }
                      onChange={(event) =>
                        patch({
                          blocks: form.blocks.map((item, n) =>
                            n === i
                              ? block.type === "list"
                                ? {
                                    ...item,
                                    items: event.target.value.split("\n"),
                                  }
                                : { ...item, text: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            )}
            {sections.map((item, i) => (
              <div
                key={i}
                className="space-y-4 border border-border bg-off-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl">Section {i + 1}</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={buttonClass}
                      disabled={i === 0}
                      aria-label={`Move section ${i + 1} up`}
                      onClick={() =>
                        detail({ sections: moveItem(sections, i, -1) })
                      }
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      className={buttonClass}
                      disabled={i === sections.length - 1}
                      aria-label={`Move section ${i + 1} down`}
                      onClick={() =>
                        detail({ sections: moveItem(sections, i, 1) })
                      }
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      className={buttonClass}
                      aria-label={`Remove section ${i + 1}`}
                      onClick={() =>
                        detail({ sections: sections.filter((_, n) => n !== i) })
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <Field label="Section heading">
                  <input
                    className={inputClass}
                    required
                    maxLength={150}
                    value={item.heading}
                    onChange={(event) =>
                      section(i, { heading: event.target.value })
                    }
                  />
                </Field>
                <Field label="Section text">
                  <textarea
                    className={inputClass}
                    required
                    rows={6}
                    maxLength={10000}
                    value={item.body}
                    onChange={(event) =>
                      section(i, { body: event.target.value })
                    }
                  />
                </Field>
                <TextList
                  label={`Section ${i + 1} bullet points`}
                  items={item.bullets ?? []}
                  onChange={(items) => section(i, { bullets: items })}
                  max={20}
                />
                <Field label="Quotation (optional)">
                  <textarea
                    className={inputClass}
                    rows={3}
                    maxLength={2000}
                    value={item.quote ?? ""}
                    onChange={(event) =>
                      section(i, { quote: event.target.value })
                    }
                  />
                </Field>
                <Field label="Quotation attribution">
                  <input
                    className={inputClass}
                    required={!!item.quote?.trim()}
                    maxLength={200}
                    value={item.attribution ?? ""}
                    onChange={(event) =>
                      section(i, { attribution: event.target.value })
                    }
                  />
                </Field>
              </div>
            ))}
            <button
              type="button"
              className={buttonClass}
              disabled={sections.length >= 20}
              onClick={() =>
                detail({
                  sections: [
                    ...sections,
                    { heading: "", body: "", bullets: [] },
                  ],
                })
              }
            >
              <Plus size={16} />
              Add section
            </button>
            <Field label="Closing thoughts">
              <textarea
                className={inputClass}
                rows={5}
                maxLength={10000}
                value={details.conclusion ?? ""}
                onChange={(event) => detail({ conclusion: event.target.value })}
              />
            </Field>
          </Section>
          <Section
            title="Cover and photographs"
            description="Upload one cover and up to 12 gallery photographs (JPG, PNG or WebP, up to 5 MB each). Include useful image descriptions and explain any archive imagery."
          >
            <label className={buttonClass}>
              <Upload size={16} />
              Upload photographs
              <input
                type="file"
                className="sr-only"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  void upload(event.target.files, "image", event.target)
                }
              />
            </label>
            {form.coverAssetId && (
              <div className="space-y-4 border border-border p-5">
                <Image
                  src={`/api/admin/assets/${form.coverAssetId}/content`}
                  alt={form.coverAlt || "Cover preview"}
                  width={480}
                  height={300}
                  unoptimized
                  className="h-48 w-full object-contain"
                />
                <Field label="Cover image description">
                  <input
                    className={inputClass}
                    required
                    maxLength={300}
                    value={form.coverAlt ?? ""}
                    onChange={(event) =>
                      patch({ coverAlt: event.target.value })
                    }
                  />
                </Field>
                <Field label="Cover caption">
                  <textarea
                    className={inputClass}
                    rows={2}
                    maxLength={500}
                    value={details.coverCaption ?? ""}
                    onChange={(event) =>
                      detail({ coverCaption: event.target.value })
                    }
                  />
                </Field>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => patch({ coverAssetId: null, coverAlt: "" })}
                >
                  Remove cover
                </button>
              </div>
            )}
            {gallery.map((photo, i) => (
              <div
                key={photo.assetId}
                className="space-y-4 border border-border p-5"
              >
                <Image
                  src={`/api/admin/assets/${photo.assetId}/content`}
                  alt={photo.alt}
                  width={320}
                  height={200}
                  unoptimized
                  className="h-36 w-full object-contain"
                />
                <Field label={`Photograph ${i + 1} description`}>
                  <input
                    required
                    className={inputClass}
                    maxLength={300}
                    value={photo.alt}
                    onChange={(event) =>
                      patch({
                        gallery: gallery.map((item, n) =>
                          n === i ? { ...item, alt: event.target.value } : item,
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Caption">
                  <textarea
                    className={inputClass}
                    rows={2}
                    maxLength={500}
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
                    onClick={() =>
                      patch({
                        coverAssetId: photo.assetId,
                        coverAlt: photo.alt,
                        details: { ...details, coverCaption: photo.caption },
                        gallery: [
                          ...(form.coverAssetId
                            ? [
                                {
                                  assetId: form.coverAssetId,
                                  alt: form.coverAlt || "Blog cover",
                                  caption: details.coverCaption || "",
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
                    disabled={i === 0}
                    aria-label={`Move photograph ${i + 1} up`}
                    onClick={() => patch({ gallery: moveItem(gallery, i, -1) })}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={i === gallery.length - 1}
                    aria-label={`Move photograph ${i + 1} down`}
                    onClick={() => patch({ gallery: moveItem(gallery, i, 1) })}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() =>
                      patch({ gallery: gallery.filter((_, n) => n !== i) })
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </Section>
          <Section
            title="Sources and supporting documents"
            description="Add references readers can check. HTTPS source links are optional; upload up to 3 public PDFs, up to 10 MB each."
          >
            {(details.sources ?? []).map((source, i) => (
              <div key={i} className="space-y-3 border border-border p-5">
                <Field label={`Source ${i + 1} title`}>
                  <input
                    className={inputClass}
                    required
                    maxLength={200}
                    value={source.label}
                    onChange={(event) =>
                      detail({
                        sources: (details.sources ?? []).map((item, n) =>
                          n === i
                            ? { ...item, label: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="HTTPS source link">
                  <input
                    type="url"
                    pattern="https://.*"
                    className={inputClass}
                    maxLength={2000}
                    value={source.url ?? ""}
                    onChange={(event) =>
                      detail({
                        sources: (details.sources ?? []).map((item, n) =>
                          n === i
                            ? { ...item, url: event.target.value || undefined }
                            : item,
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Source note">
                  <textarea
                    className={inputClass}
                    rows={2}
                    maxLength={1000}
                    value={source.note ?? ""}
                    onChange={(event) =>
                      detail({
                        sources: (details.sources ?? []).map((item, n) =>
                          n === i
                            ? { ...item, note: event.target.value }
                            : item,
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
                      sources: (details.sources ?? []).filter(
                        (_, n) => n !== i,
                      ),
                    })
                  }
                >
                  Remove source
                </button>
              </div>
            ))}
            <button
              type="button"
              className={buttonClass}
              disabled={(details.sources ?? []).length >= 12}
              onClick={() =>
                detail({ sources: [...(details.sources ?? []), { label: "" }] })
              }
            >
              <Plus size={16} />
              Add source
            </button>
            <div>
              <label className={buttonClass}>
                <Upload size={16} />
                Upload PDFs
                <input
                  type="file"
                  className="sr-only"
                  multiple
                  accept="application/pdf"
                  onChange={(event) =>
                    void upload(event.target.files, "pdf", event.target)
                  }
                />
              </label>
            </div>
            {documents.map((document, i) => (
              <div
                key={document.assetId}
                className="flex flex-wrap items-end gap-3"
              >
                <div className="min-w-0 flex-1">
                  <Field label={`Document ${i + 1} label`}>
                    <input
                      className={inputClass}
                      required
                      maxLength={150}
                      value={document.label}
                      onChange={(event) =>
                        patch({
                          documents: documents.map((item, n) =>
                            n === i
                              ? { ...item, label: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                  </Field>
                </div>
                <a
                  href={`/api/admin/assets/${document.assetId}/content`}
                  target="_blank"
                  rel="noopener"
                  className={buttonClass}
                >
                  Preview PDF
                </a>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() =>
                    patch({ documents: documents.filter((_, n) => n !== i) })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </Section>
          <Section title="Search preview (optional)">
            <Field label="Search title">
              <input
                className={inputClass}
                maxLength={80}
                value={details.seoTitle ?? ""}
                onChange={(event) => detail({ seoTitle: event.target.value })}
              />
            </Field>
            <Field label="Search description">
              <textarea
                className={inputClass}
                rows={2}
                maxLength={170}
                value={details.seoDescription ?? ""}
                onChange={(event) =>
                  detail({ seoDescription: event.target.value })
                }
              />
            </Field>
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
                I have reviewed the story, quotations, photos and documents and
                confirm they are suitable for public release.
              </span>
            </label>
            <p className="mt-3 text-xs text-muted">
              Saving changes to a published blog returns it to draft. Choose
              Save & publish to display the reviewed version.
            </p>
          </div>
        </fieldset>
        <div className="sticky bottom-0 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 border border-border bg-white/95 p-4 backdrop-blur">
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
            Back to blogs
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
        ref={dialog}
        onCancel={() => setPreview(false)}
        onClose={() => setPreview(false)}
        className="fixed inset-0 m-auto h-[95dvh] max-h-[95dvh] w-[min(1400px,96vw)] max-w-none overflow-auto bg-off-white p-0 backdrop:bg-navy/70"
      >
        <div className="sticky top-0 z-30 flex items-center justify-between bg-white px-5 py-3 shadow-sm">
          <span className="text-sm font-semibold">Blog page preview</span>
          <button
            type="button"
            className={buttonClass}
            onClick={() => setPreview(false)}
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>
        {preview && (
          <div dir={form.locale === "ur" ? "rtl" : undefined}>
            <BlogDetailView blog={previewRow} preview locale={form.locale} />
          </div>
        )}
      </dialog>
    </>
  );
}
