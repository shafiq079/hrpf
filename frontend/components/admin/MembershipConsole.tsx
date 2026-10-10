"use client";
/* eslint-disable @next/next/no-img-element -- Private evidence previews use the authenticated original-file stream. */
import { useEffect, useRef, useState, type FormEvent } from "react";
import AdminNavigation from "./AdminNavigation";
import Container from "@/components/shared/Container";
import { adminRequest } from "@/lib/admin-api";
import {
  answerLabels,
  importantNote,
  confirmationMessage,
  type Answers,
} from "@/lib/membership-registration";
type User = { name: string; role: string };
type Row = {
  id: string;
  version: number;
  reference: string;
  name: string;
  email: string;
  status: string;
  paymentStatus: string;
  amountPKR: number;
  createdAt: string;
};
type Attachment = {
  id: string;
  name: string;
  label: string;
  format: string;
  bytes: number;
};
type Detail = Row & {
  answers: Answers;
  files: Attachment[];
  formVersion: string;
  reviewedAt?: string;
  notes: { body: string; at: string; reviewer: string }[];
  history: {
    from: string;
    to: string;
    paymentFrom: string;
    paymentTo: string;
    at: string;
  }[];
  emailDeliveries: {
    id: string;
    audience: string;
    status: string;
    attempts: number;
    errorCode?: string;
  }[];
};
const statuses = [
  "pending",
  "under_review",
  "needs_info",
  "approved",
  "rejected",
  "withdrawn",
];
const paymentStatuses = ["unverified", "verified", "rejected"];
const label = (value: string) => value.replaceAll("_", " ");
const date = (value: string) => new Date(value).toLocaleString("en-GB");
const button =
  "min-h-11 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy/5 disabled:opacity-50";
const control =
  "mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm font-normal";
function AttachmentCard({ file }: { file: Attachment }) {
  const [show, setShow] = useState(false),
    [error, setError] = useState(false);
  const canPreview = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "bmp",
    "tif",
    "tiff",
    "pdf",
  ].includes(file.format);
  const url = `/api/admin/assets/${file.id}/content`;
  return (
    <article className="min-w-0 rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold text-navy">{file.label}</h3>
      <p className="mt-2 break-all text-sm" translate="no">
        {file.name}
      </p>
      <p className="mt-1 text-xs text-muted">
        {(file.bytes / 1024 / 1024).toFixed(2)} MB
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {canPreview && (
          <button
            type="button"
            className={button}
            onClick={() => {
              setShow((v) => !v);
              setError(false);
            }}
          >
            {show ? "Hide preview" : "Preview"}
          </button>
        )}
        <a href={url} className={button}>
          Download
        </a>
        <a
          href={`${url}?preview=1`}
          target="_blank"
          rel="noopener noreferrer"
          className={button}
        >
          Open file<span className="sr-only"> in new tab</span>
        </a>
      </div>
      {show &&
        (error ? (
          <p role="alert" className="mt-3 text-sm text-red-dark">
            Preview could not load. Reload your session or use Download.
          </p>
        ) : file.format === "pdf" ? (
          <iframe
            title={`${file.label}: ${file.name}`}
            src={`${url}?preview=1`}
            className="mt-4 h-96 w-full rounded border border-border"
          />
        ) : (
          <img
            src={`${url}?preview=1`}
            alt={file.label}
            className="mt-4 max-h-96 w-full rounded object-contain"
            onError={() => setError(true)}
          />
        ))}
    </article>
  );
}
export default function MembershipConsole() {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [listing, setListing] = useState<{
      rows: Row[];
      total: number;
      pages: number;
    }>({ rows: [], total: 0, pages: 0 }),
    [page, setPage] = useState(1),
    [status, setStatus] = useState(""),
    [query, setQuery] = useState(""),
    [revision, setRevision] = useState(0);
  const [detail, setDetail] = useState<Detail | null>(null),
    [nextStatus, setNextStatus] = useState("pending"),
    [payment, setPayment] = useState("unverified"),
    [note, setNote] = useState(""),
    [applicantMessage, setApplicantMessage] = useState("");
  const acting = useRef(false);
  const allowed = !!user && ["super_admin", "admin"].includes(user.role);
  useEffect(() => {
    let active = true;
    adminRequest<{ user: User }>("/auth/me")
      .then((r) => {
        if (active) setUser(r.user);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!allowed) return;
    let active = true;
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    if (query) params.set("q", query);
    adminRequest<typeof listing>(`/admin/membership-registrations?${params}`)
      .then((r) => {
        if (active) {
          setListing(r);
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setListing({ rows: [], total: 0, pages: 0 });
          setError(err.message);
        }
      });
    return () => {
      active = false;
    };
  }, [allowed, page, status, query, revision]);
  async function action(work: () => Promise<void>) {
    if (acting.current) return;
    acting.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The request could not be completed.",
      );
    } finally {
      setBusy(false);
      acting.current = false;
    }
  }
  async function open(id: string) {
    const row = await adminRequest<Detail>(
      `/admin/membership-registrations/${id}`,
    );
    setDetail(row);
    setNextStatus(row.status);
    setPayment(row.paymentStatus);
    setNote("");
    setApplicantMessage("");
  }
  function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    void action(async () => {
      const result = await adminRequest<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      setUser(result.user);
    });
  }
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!detail) return;
    const current = detail;
    const changed = nextStatus !== current.status;
    void action(async () => {
      await adminRequest(`/admin/membership-registrations/${current.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          version: current.version,
          status: nextStatus,
          paymentStatus: payment,
          note,
          applicantMessage,
        }),
      });
      await open(current.id);
      setRevision((v) => v + 1);
      setNotice(
        changed
          ? "Review saved. The applicant’s status update email has been queued."
          : "Review saved. The internal note is visible only to HRPF administrators.",
      );
    });
  }
  return (
    <Container className="py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-dark">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-navy">
            Membership applications
          </h1>
        </div>
        {user && (
          <button
            className={button}
            disabled={busy}
            onClick={() =>
              void action(async () => {
                await adminRequest("/auth/logout", {
                  method: "POST",
                  body: "{}",
                });
                setUser(null);
                setDetail(null);
                setListing({ rows: [], total: 0, pages: 0 });
              })
            }
          >
            Sign out
          </button>
        )}
      </div>
      {user && <AdminNavigation contentAllowed={allowed} />}
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-red-dark bg-white p-4 text-sm text-red-dark"
        >
          {error}
          {detail && (
            <button
              className="ml-3 min-h-11 font-semibold underline"
              disabled={busy}
              onClick={() => void action(() => open(detail.id))}
            >
              Reload application
            </button>
          )}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mb-5 rounded-lg border border-teal bg-white p-4 text-sm"
        >
          {notice}
        </p>
      )}
      {loading ? (
        <p>Loading administration…</p>
      ) : !user ? (
        <form
          onSubmit={login}
          className="max-w-md space-y-5 rounded-lg border border-border bg-white p-6"
        >
          <h2 className="text-xl">Sign in to review applications</h2>
          <label className="block text-sm font-semibold">
            Email
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              className={control}
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={control}
            />
          </label>
          <button disabled={busy} className={button}>
            Sign in
          </button>
        </form>
      ) : !allowed ? (
        <p>Membership applications can be reviewed by administrators only.</p>
      ) : detail ? (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <button
              disabled={busy}
              className={button}
              onClick={() => {
                setDetail(null);
                setNotice("");
                setError("");
              }}
            >
              Back to applications
            </button>
            <p className="text-sm text-muted">
              Submitted {date(detail.createdAt)}
            </p>
          </div>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-6">
              <section className="rounded-xl border border-border bg-white p-5 sm:p-8">
                <h2 className="text-xl font-semibold" translate="no">
                  {detail.reference}
                </h2>
                <p className="mt-3 text-sm capitalize">
                  Application: <strong>{label(detail.status)}</strong> ·
                  Payment: <strong>{label(detail.paymentStatus)}</strong>
                </p>
                <dl className="mt-6 divide-y divide-border">
                  {Object.entries(detail.answers).map(([key, value]) => (
                    <div key={key} className="py-4">
                      <dt className="text-sm font-semibold text-navy">
                        {answerLabels[key as keyof Answers] || key}
                      </dt>
                      {key === "importantNote" && (
                        <p className="mt-2 text-xs text-muted">
                          {importantNote}
                        </p>
                      )}
                      {key === "confirmationMessage" && (
                        <p className="mt-2 text-xs text-muted">
                          {confirmationMessage}
                        </p>
                      )}
                      <dd
                        translate="no"
                        dir="auto"
                        className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed"
                      >
                        {Array.isArray(value)
                          ? value.join("; ")
                          : value || "Not provided"}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 font-semibold">
                  Selected fees: PKR {detail.amountPKR.toLocaleString("en-PK")}
                </p>
              </section>
              <section className="rounded-xl border border-border bg-white p-5 sm:p-8">
                <h2 className="text-xl font-semibold">Submitted documents</h2>
                <p className="mt-2 text-sm text-muted">
                  Check the CNIC, photograph, payment screenshot and police
                  certificate before approval.
                </p>
                <div className="mt-5 space-y-4">
                  {detail.files.map((file) => (
                    <AttachmentCard key={file.id} file={file} />
                  ))}
                </div>
              </section>
            </div>
            <div className="min-w-0 space-y-6">
              <form
                onSubmit={save}
                className="space-y-5 rounded-xl border border-border bg-white p-5 sm:p-8"
              >
                <h2 className="text-xl font-semibold">Review application</h2>
                <p className="text-sm text-muted">
                  Approve only after verifying payment and the declaration.
                  Status changes send your message to the applicant; internal
                  notes stay private.
                </p>
                <label className="block text-sm font-semibold">
                  Payment verification
                  <select
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    className={control}
                  >
                    {paymentStatuses.map((s) => (
                      <option key={s} value={s}>
                        {label(s)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  Application status
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    className={control}
                  >
                    {statuses.map((s) => (
                      <option
                        key={s}
                        value={s}
                        disabled={
                          s === "approved" &&
                          (payment !== "verified" ||
                            detail.answers.certification !== "Yes")
                        }
                      >
                        {label(s)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  Internal review note (required)
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                    maxLength={2000}
                    rows={4}
                    className={control}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Message to applicant
                  {nextStatus !== detail.status
                    ? " (required)"
                    : " (sent only when status changes)"}
                  <textarea
                    value={applicantMessage}
                    onChange={(e) => setApplicantMessage(e.target.value)}
                    required={nextStatus !== detail.status}
                    maxLength={2000}
                    rows={4}
                    className={control}
                  />
                </label>
                <button className={button} disabled={busy}>
                  Save review
                </button>
              </form>
              <section className="rounded-xl border border-border bg-white p-5">
                <h2 className="font-semibold">Review notes</h2>
                <ul className="mt-4 space-y-4">
                  {detail.notes.map((n, i) => (
                    <li key={i}>
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {n.body}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {n.reviewer} · {date(n.at)}
                      </p>
                    </li>
                  ))}
                </ul>
                {!detail.notes.length && (
                  <p className="mt-3 text-sm text-muted">
                    No review notes yet.
                  </p>
                )}
              </section>
              <section className="rounded-xl border border-border bg-white p-5">
                <h2 className="font-semibold">Status history</h2>
                <ol className="mt-4 space-y-4">
                  {detail.history.map((h, i) => (
                    <li key={i} className="text-sm capitalize">
                      {label(h.from)} → {label(h.to)}
                      <p>
                        Payment: {h.paymentFrom} → {h.paymentTo}
                      </p>
                      <p className="mt-1 text-xs text-muted">{date(h.at)}</p>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="rounded-xl border border-border bg-white p-5">
                <h2 className="font-semibold">Email delivery</h2>
                <ul className="mt-4 space-y-3">
                  {detail.emailDeliveries.map((m) => (
                    <li key={m.id} className="text-sm capitalize">
                      {m.audience}: {m.status}{" "}
                      <span className="text-xs text-muted">
                        ({m.attempts} attempts)
                      </span>
                      {m.errorCode && (
                        <p className="mt-1 text-xs text-red-dark">
                          Delivery is unavailable. Check the email service
                          configuration.
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </>
      ) : (
        <>
          <form
            className="mb-6 grid items-end gap-4 sm:grid-cols-[1fr_220px_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              setQuery(String(data.get("q") || ""));
              setStatus(String(data.get("status") || ""));
              setPage(1);
            }}
          >
            <label className="text-sm font-semibold">
              Reference prefix
              <input
                name="q"
                maxLength={80}
                placeholder="HRPF-VR-"
                className={control}
              />
            </label>
            <label className="text-sm font-semibold">
              Application status
              <select name="status" className={control}>
                <option value="">All statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </label>
            <button className={button} disabled={busy}>
              Filter
            </button>
          </form>
          <p className="mb-4 text-sm text-muted">
            {listing.total} application{listing.total === 1 ? "" : "s"}
          </p>
          <ul className="space-y-3">
            {listing.rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-white p-5"
              >
                <div className="min-w-0">
                  <h2 className="font-semibold" translate="no">
                    {row.reference}
                  </h2>
                  <p className="mt-1 break-words text-sm" translate="no">
                    {row.name}
                  </p>
                  <p className="mt-1 text-xs capitalize text-muted">
                    {label(row.status)} · Payment {row.paymentStatus} · PKR{" "}
                    {row.amountPKR.toLocaleString("en-PK")} ·{" "}
                    {date(row.createdAt)}
                  </p>
                </div>
                <button
                  className={button}
                  disabled={busy}
                  onClick={() => void action(() => open(row.id))}
                >
                  Review application
                </button>
              </li>
            ))}
          </ul>
          {!listing.rows.length && !error && (
            <p className="rounded-lg border border-border bg-white p-5 text-sm text-muted">
              No applications match this filter.
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              disabled={page <= 1 || busy}
              className={button}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <p className="text-sm">
              Page {page} of {listing.pages || 1}
            </p>
            <button
              disabled={page >= listing.pages || busy}
              className={button}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </Container>
  );
}
