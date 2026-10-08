"use client";
import { useState, type FormEvent } from "react";
import { Plus, Trash2, Upload, ArrowLeft } from "lucide-react";
import { ManualUrduNote } from "@/components/admin/AdminField";
import { adminRequest } from "@/lib/admin-api";
import PersonProfile from "@/components/people/PersonProfile";

type Localized = { en: string; ur?: string };
export type BoardRecord = {
  id?: string;
  version?: number;
  status?: "draft" | "published";
  name: string;
  slug: string;
  designation: string;
  rank: number;
  bio: Localized;
  sections: { heading: Localized; body: Localized }[];
  showOnBoard: boolean;
  showOnTeam: boolean;
  photoAlt: string;
  photoZoom: number;
  assetId: string | null;
};
export const newProfile = (): BoardRecord => ({
  name: "",
  slug: "",
  designation: "",
  rank: 1,
  bio: { en: "" },
  sections: [],
  showOnBoard: true,
  showOnTeam: false,
  photoAlt: "",
  photoZoom: 1,
  assetId: null,
});
const inputClass =
  "mt-2 w-full rounded border border-border bg-white px-3 py-2.5 text-sm font-normal";
export default function BoardEditor({
  initial,
  onCancel,
  onSaved,
}: {
  initial: BoardRecord;
  onCancel: () => void;
  onSaved: (message: string) => void;
}) {
  const [record, setRecord] = useState<BoardRecord>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [preview, setPreview] = useState(false);
  const [staged, setStaged] = useState<string | null>(null);
  const change = (fields: Partial<BoardRecord>) => {
    setRecord((previous) => ({ ...previous, ...fields }));
    setReviewed(false);
  };
  const failureText = (failure: unknown) =>
    failure instanceof Error
      ? failure.message
      : "The change could not be completed.";
  async function discardStaged(id: string | null) {
    if (id)
      await adminRequest("/admin/assets/" + id, {
        method: "DELETE",
        body: "{}",
      });
  }
  async function cancel() {
    setBusy(true);
    setError("");
    try {
      await discardStaged(staged);
      onCancel();
    } catch (failure) {
      setError(failureText(failure));
    } finally {
      setBusy(false);
    }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Use a JPG, PNG or WebP photograph up to 5 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const result = await adminRequest<{ assetId: string }>(
        "/admin/assets?purpose=content",
        { method: "POST", body: form },
      );
      const previous = staged;
      setStaged(result.assetId);
      change({ assetId: result.assetId });
      await discardStaged(previous);
    } catch (failure) {
      setError(failureText(failure));
    } finally {
      setBusy(false);
    }
  }
  async function removePhoto() {
    setBusy(true);
    setError("");
    try {
      await discardStaged(staged);
      setStaged(null);
      change({ assetId: null, photoAlt: "", photoZoom: 1 });
    } catch (failure) {
      setError(failureText(failure));
    } finally {
      setBusy(false);
    }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const publish =
      (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ===
      "publish";
    if (publish && !reviewed) {
      setError("Review the profile before publication.");
      return;
    }
    if (!record.showOnBoard && !record.showOnTeam) {
      setError("Choose at least one page for this profile.");
      return;
    }
    setBusy(true);
    setError("");
    const { id, version, ...fields } = record;
    const payload = { ...fields } as Partial<BoardRecord>;
    delete payload.status;
    try {
      const saved = await adminRequest<{ id: string; version: number }>(
        id ? "/admin/board/" + id : "/admin/board",
        {
          method: id ? "PATCH" : "POST",
          body: JSON.stringify({ ...payload, ...(id ? { version } : {}) }),
        },
      );
      setRecord((previous) => ({ ...previous, ...saved, status: "draft" }));
      setStaged(null);
      if (publish)
        await adminRequest("/admin/publication/board/" + saved.id, {
          method: "POST",
          body: JSON.stringify({
            version: saved.version,
            action: "publish",
            releaseReviewed: true,
          }),
        });
      onSaved(publish ? "Profile published." : "Profile saved as a draft.");
    } catch (failure) {
      setReviewed(false);
      setError(failureText(failure));
    } finally {
      setBusy(false);
    }
  }
  function sectionField(
    index: number,
    key: "heading" | "body",
    locale: "en" | "ur",
    value: string,
  ) {
    change({
      sections: record.sections.map((section, i) =>
        i === index
          ? { ...section, [key]: { ...section[key], [locale]: value } }
          : section,
      ),
    });
  }
  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => void cancel()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-dark"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          All profiles
        </button>
        <button
          type="button"
          onClick={() => setPreview((value) => !value)}
          className="rounded border border-border px-4 py-2 text-sm font-semibold"
        >
          {preview ? "Hide preview" : "Preview profile"}
        </button>
      </div>
      <h1 className="font-serif text-3xl text-navy">
        {record.id ? "Edit profile" : "Add profile"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Saving changes creates a private draft. Publish after reviewing the
        biography, page placement and photograph.
      </p>
      {error && (
        <p
          role="alert"
          className="mt-5 border-l-4 border-red bg-red/5 p-4 text-sm"
        >
          {error}
        </p>
      )}
      {preview && (
        <div data-public-preview className="mt-8 rounded-lg border border-border bg-off-white p-6 sm:p-9">
          <p className="eyebrow mb-6">Private profile preview</p>
          <PersonProfile
            person={{
              ...record,
              name: record.name || "Profile name",
              slug: record.slug || "profile",
              bio: record.bio.en,
              photo: record.assetId
                ? "/api/admin/assets/" + record.assetId + "/content?preview=1"
                : null,
              sections: record.sections.map((section) => ({
                heading: section.heading.en,
                body: section.body.en,
              })),
            }}
          />
        </div>
      )}
      <form onSubmit={(event) => void save(event)} className="mt-8 space-y-7">
        <fieldset disabled={busy} className="space-y-7 disabled:opacity-60">
          <section className="rounded-lg border border-border bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-navy">Profile details</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Full name
                <input
                  required
                  maxLength={150}
                  value={record.name}
                  onChange={(event) => change({ name: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                Role or designation
                <input
                  required
                  maxLength={200}
                  value={record.designation}
                  onChange={(event) =>
                    change({ designation: event.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                Profile URL identifier
                <input
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  maxLength={100}
                  value={record.slug}
                  onChange={(event) => change({ slug: event.target.value })}
                  className={inputClass}
                />
                <span className="mt-1 block text-xs font-normal text-muted">
                  Lowercase words separated by dashes.
                </span>
              </label>
              <label className="text-sm font-semibold">
                Display order
                <input
                  required
                  type="number"
                  min={1}
                  max={100000}
                  step={1}
                  value={record.rank}
                  onChange={(event) =>
                    change({ rank: Number(event.target.value) })
                  }
                  className={inputClass}
                />
                <span className="mt-1 block text-xs font-normal text-muted">
                  Lower numbers appear first.
                </span>
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={record.showOnBoard}
                  onChange={(event) =>
                    change({ showOnBoard: event.target.checked })
                  }
                />
                Board of Directors
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={record.showOnTeam}
                  onChange={(event) =>
                    change({ showOnTeam: event.target.checked })
                  }
                />
                Our Team
              </label>
            </div>
          </section>
          <section className="rounded-lg border border-border bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-navy">Biography</h2>
            <label className="mt-5 block text-sm font-semibold">
              Introduction
              <textarea
                required
                maxLength={10000}
                rows={5}
                value={record.bio.en}
                onChange={(event) =>
                  change({ bio: { ...record.bio, en: event.target.value } })
                }
                className={inputClass}
              />
              <span className="mt-1 block text-xs font-normal text-muted">
                Shown on the profile and shortened on listing cards. Add
                detailed sections below.
              </span>
            </label>
            <details className="mt-5">
              <summary className="cursor-pointer text-sm font-semibold text-teal-dark">
                Manual Urdu introduction (optional)
              </summary>
              <ManualUrduNote />
              <label className="mt-3 block text-sm">
                Urdu introduction
                <textarea
                  dir="rtl"
                  lang="ur"
                  maxLength={10000}
                  rows={4}
                  value={record.bio.ur ?? ""}
                  onChange={(event) =>
                    change({ bio: { ...record.bio, ur: event.target.value } })
                  }
                  className={inputClass}
                />
              </label>
            </details>
          </section>
          <section className="rounded-lg border border-border bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-2xl text-navy">
                Full profile sections
              </h2>
              <button
                type="button"
                disabled={record.sections.length >= 16}
                onClick={() =>
                  change({
                    sections: [
                      ...record.sections,
                      { heading: { en: "" }, body: { en: "" } },
                    ],
                  })
                }
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-dark"
              >
                <Plus size={17} aria-hidden="true" />
                Add section
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">
              Use headings for professional background, responsibilities and
              contributions. Separate paragraphs with a blank line.
            </p>
            <div className="mt-6 space-y-6">
              {record.sections.map((section, index) => (
                <div
                  key={index}
                  className="rounded border border-border bg-off-white p-5"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">
                      Section {index + 1}
                    </h3>
                    <div className="flex gap-4 text-sm">
                      <button
                        type="button"
                        disabled={index === 0}
                        className="text-teal-dark disabled:opacity-40"
                        onClick={() => {
                          const sections = [...record.sections];
                          [sections[index - 1], sections[index]] = [
                            sections[index],
                            sections[index - 1],
                          ];
                          change({ sections });
                        }}
                      >
                        Move up
                      </button>
                      <button
                        type="button"
                        disabled={index === record.sections.length - 1}
                        className="text-teal-dark disabled:opacity-40"
                        onClick={() => {
                          const sections = [...record.sections];
                          [sections[index + 1], sections[index]] = [
                            sections[index],
                            sections[index + 1],
                          ];
                          change({ sections });
                        }}
                      >
                        Move down
                      </button>
                      <button
                        type="button"
                        aria-label={"Remove section " + (index + 1)}
                        onClick={() =>
                          change({
                            sections: record.sections.filter(
                              (_, i) => i !== index,
                            ),
                          })
                        }
                        className="text-red-dark"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                  <label className="block text-sm font-semibold">
                    Heading
                    <input
                      required
                      maxLength={150}
                      value={section.heading.en}
                      onChange={(event) =>
                        sectionField(index, "heading", "en", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="mt-4 block text-sm font-semibold">
                    Section text
                    <textarea
                      required
                      maxLength={10000}
                      rows={6}
                      value={section.body.en}
                      onChange={(event) =>
                        sectionField(index, "body", "en", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-teal-dark">
                      Manual Urdu section (optional)
                    </summary>
                    <ManualUrduNote />
                    <label className="mt-3 block text-sm">
                      Urdu heading
                      <input
                        dir="rtl"
                        lang="ur"
                        maxLength={150}
                        value={section.heading.ur ?? ""}
                        onChange={(event) =>
                          sectionField(
                            index,
                            "heading",
                            "ur",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </label>
                    <label className="mt-3 block text-sm">
                      Urdu text
                      <textarea
                        dir="rtl"
                        lang="ur"
                        rows={4}
                        maxLength={10000}
                        value={section.body.ur ?? ""}
                        onChange={(event) =>
                          sectionField(index, "body", "ur", event.target.value)
                        }
                        className={inputClass}
                      />
                    </label>
                  </details>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-border bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-navy">Photograph</h2>
            <p className="mt-3 text-sm text-muted">
              JPG, PNG or WebP up to 5 MB. Photographs are checked and remain
              private until publication.
            </p>
            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded border border-border px-4 py-3 text-sm font-semibold">
              <Upload size={17} aria-hidden="true" />
              {record.assetId ? "Replace photograph" : "Upload photograph"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  void upload(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
            {record.assetId && (
              <>
                <button
                  type="button"
                  onClick={() => void removePhoto()}
                  className="ml-5 text-sm text-red-dark"
                >
                  Remove photograph
                </button>
                <label className="mt-5 block text-sm font-semibold">
                  Photograph description
                  <input
                    required
                    maxLength={300}
                    value={record.photoAlt}
                    onChange={(event) =>
                      change({ photoAlt: event.target.value })
                    }
                    className={inputClass}
                  />
                </label>
                <label className="mt-5 block text-sm font-semibold">
                  Display zoom: {record.photoZoom.toFixed(1)}×
                  <input
                    type="range"
                    min={1}
                    max={2}
                    step={0.1}
                    value={record.photoZoom}
                    onChange={(event) =>
                      change({ photoZoom: Number(event.target.value) })
                    }
                    className="mt-3 block w-full max-w-sm"
                  />
                  <span className="mt-2 block text-xs font-normal text-muted">
                    Adjust framing in the preview. The uploaded image stays
                    unchanged.
                  </span>
                </label>
              </>
            )}
          </section>
          <label className="flex items-start gap-3 rounded-lg border border-border bg-white p-5 text-sm leading-relaxed">
            <input
              type="checkbox"
              className="mt-1"
              checked={reviewed}
              onChange={(event) => setReviewed(event.target.checked)}
            />
            I have reviewed the profile, role, page placement and photograph for
            public display.
          </label>
          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              value="draft"
              className="rounded border border-border bg-white px-5 py-3 text-sm font-semibold text-navy"
            >
              {busy ? "Saving…" : "Save draft"}
            </button>
            <button
              type="submit"
              value="publish"
              disabled={!reviewed}
              className="rounded bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-40"
            >
              Save and publish
            </button>
            <button
              type="button"
              onClick={() => void cancel()}
              className="px-4 py-3 text-sm text-muted"
            >
              Cancel
            </button>
          </div>
        </fieldset>
      </form>
    </>
  );
}
