"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import Container from "@/components/shared/Container";
import { adminRequest } from "@/lib/admin-api";

type User = { name: string; email: string; role: string };
type Row = {
  id: string;
  version: number;
  reference: string;
  name: string;
  category: string;
  province: string;
  district: string;
  status: string;
  assigneeId: string | null;
  createdAt: string;
};
type Detail = Row & {
  fatherName: string;
  email: string;
  phone: string;
  address: string;
  cnic: string;
  description: string;
  priorProceedings: boolean;
  priorProceedingsDetails: string;
  consent: { version: string; acceptedAt: string };
  files: {
    id: string;
    name: string;
    label: string;
    bytes: number;
    format: string;
  }[];
  notes: { body: string; actorId: string; at: string }[];
  history: { from: string; to: string; at: string }[];
  emailDeliveries: {
    id: string;
    audience: string;
    status: string;
    attempts: number;
    errorCode?: string;
    sentAt?: string;
  }[];
};
type Listing = { rows: Row[]; page: number; pages: number; total: number };
const statuses = [
  "new",
  "triaged",
  "assigned",
  "in_progress",
  "needs_info",
  "resolved",
  "closed",
];
const transitions: Record<string, string[]> = {
  new: ["triaged", "closed"],
  triaged: ["assigned", "in_progress", "needs_info", "closed"],
  assigned: ["in_progress", "needs_info", "closed"],
  in_progress: ["needs_info", "resolved", "closed"],
  needs_info: ["triaged", "assigned", "in_progress", "closed"],
  resolved: ["closed", "in_progress"],
  closed: ["triaged"],
};
const label = (value: string) => value.replaceAll("_", " ");
const date = (value: string) => new Date(value).toLocaleString("en-GB");
const control =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm";
const button =
  "rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy/5 disabled:opacity-50";
export default function ComplaintConsole() {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [listing, setListing] = useState<Listing>({
      rows: [],
      page: 1,
      pages: 0,
      total: 0,
    }),
    [page, setPage] = useState(1),
    [status, setStatus] = useState(""),
    [query, setQuery] = useState(""),
    [revision, setRevision] = useState(0);
  const [detail, setDetail] = useState<Detail | null>(null),
    [reviewers, setReviewers] = useState<{ id: string; name: string }[]>([]),
    [nextStatus, setNextStatus] = useState(""),
    [assignee, setAssignee] = useState(""),
    [note, setNote] = useState("");
  const acting = useRef(false);
  const allowed =
      !!user && ["super_admin", "admin", "case_manager"].includes(user.role),
    canRetry = !!user && ["super_admin", "admin"].includes(user.role);
  useEffect(() => {
    let active = true;
    adminRequest<{ user: User }>("/auth/me")
      .then((result) => {
        if (active) setUser(result.user);
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
    const search = new URLSearchParams({ page: String(page) });
    if (status) search.set("status", status);
    if (query) search.set("q", query);
    adminRequest<Listing>(`/admin/complaints?${search}`)
      .then((result) => {
        if (active) setListing(result);
      })
      .catch((failure) => {
        if (active) setError(failure.message);
      });
    return () => {
      active = false;
    };
  }, [allowed, page, status, query, revision]);
  useEffect(() => {
    if (!allowed) return;
    let active = true;
    adminRequest<{ id: string; name: string }[]>("/admin/complaints/reviewers")
      .then((result) => {
        if (active) setReviewers(result);
      })
      .catch((failure) => {
        if (active) setError(failure.message);
      });
    return () => {
      active = false;
    };
  }, [allowed, revision]);
  async function action(work: () => Promise<void>) {
    if (acting.current) return;
    acting.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "The request could not be completed.",
      );
    } finally {
      acting.current = false;
      setBusy(false);
    }
  }
  async function open(id: string) {
    const result = await adminRequest<Detail>(`/admin/complaints/${id}`);
    setDetail(result);
    setNextStatus(result.status);
    setAssignee(result.assigneeId ?? "");
    setNote("");
  }
  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    void action(async () => {
      const result = await adminRequest<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: fields.get("email"),
          password: fields.get("password"),
        }),
      });
      setUser(result.user);
    });
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail) return;
    const current = detail;
    void action(async () => {
      await adminRequest(`/admin/complaints/${current.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          version: current.version,
          status: nextStatus,
          assigneeId: assignee || null,
          note,
        }),
      });
      await open(current.id);
      setRevision((value) => value + 1);
      setNotice(
        "Review saved. Internal notes and status changes are not sent to the complainant.",
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
          <h1 className="mt-2 font-serif text-3xl font-semibold text-navy">
            Complaint review
          </h1>
        </div>
        {user && (
          <button
            disabled={busy}
            className={button}
            onClick={() =>
              void action(async () => {
                await adminRequest("/auth/logout", {
                  method: "POST",
                  body: "{}",
                });
                setUser(null);
                setDetail(null);
                setListing({ rows: [], page: 1, pages: 0, total: 0 });
              })
            }
          >
            Sign out
          </button>
        )}
      </div>
      {allowed && <AdminNavigation contentAllowed={canRetry} />}
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-md border border-red/30 bg-red/5 p-4 text-sm text-red-dark"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mb-5 rounded-md bg-teal/10 p-4 text-sm text-teal-dark"
        >
          {notice}
        </p>
      )}
      {loading ? (
        <p>Loading complaint management…</p>
      ) : !user ? (
        <form
          onSubmit={login}
          className="max-w-md space-y-5 rounded-lg border border-border bg-white p-6"
        >
          <p className="text-sm text-muted">
            Sign in with your administrator or case-manager account.
          </p>
          <label className="block text-sm">
            Email
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              className={`${control} mt-2`}
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={`${control} mt-2`}
            />
          </label>
          <button disabled={busy} className={button}>
            Sign in
          </button>
        </form>
      ) : !allowed ? (
        <p role="alert">Your account cannot review complaints.</p>
      ) : detail ? (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              disabled={busy}
              className={button}
              onClick={() => {
                setDetail(null);
                setError("");
                setNotice("");
              }}
            >
              Back to complaints
            </button>
            <button
              disabled={busy}
              className={button}
              onClick={() => void action(() => open(detail.id))}
            >
              Reload latest details
            </button>
          </div>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="min-w-0 rounded-lg border border-border bg-white p-6">
              <h2 className="font-serif text-2xl text-navy">
                {detail.reference}
              </h2>
              <p className="mt-2 text-sm capitalize text-teal-dark">
                {label(detail.status)} · {date(detail.createdAt)}
              </p>
              <dl className="mt-6 space-y-5">
                {[
                  ["Full name", detail.name],
                  ["Father’s name", detail.fatherName],
                  ["CNIC", detail.cnic],
                  ["Email", detail.email],
                  ["Phone", detail.phone],
                  ["Province / region", detail.province],
                  ["District", detail.district],
                  ["Address", detail.address],
                  ["Category", detail.category],
                  ["Complaint details", detail.description],
                  [
                    "Previous proceedings",
                    detail.priorProceedings ? "Yes" : "No",
                  ],
                  [
                    "Previous proceedings details",
                    detail.priorProceedingsDetails || "Not applicable",
                  ],
                  [
                    "Consent",
                    `${detail.consent.version} · ${date(detail.consent.acceptedAt)}`,
                  ],
                ].map(([title, value]) => (
                  <div key={title}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {title}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-8 font-semibold text-navy">
                Private attachments
              </h3>
              <ul className="mt-3 space-y-3">
                {detail.files.map((file) => (
                  <li key={file.id}>
                    <a
                      href={`/api/admin/assets/${file.id}/content`}
                      className="text-sm font-semibold text-teal-dark underline"
                    >
                      {file.label}: {file.name}
                    </a>
                    <span className="ml-2 text-xs text-muted">
                      {Math.ceil(file.bytes / 1024)} KB
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <div className="space-y-6">
              <form
                onSubmit={save}
                className="rounded-lg border border-border bg-white p-6"
              >
                <h2 className="font-semibold text-navy">
                  Review and assignment
                </h2>
                <fieldset disabled={busy} className="mt-4 space-y-5">
                  <label className="block text-sm">
                    Status
                    <select
                      value={nextStatus}
                      onChange={(event) => setNextStatus(event.target.value)}
                      className={`${control} mt-2`}
                    >
                      {[detail.status, ...transitions[detail.status]].map(
                        (value) => (
                          <option key={value} value={value}>
                            {label(value)}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="block text-sm">
                    Assigned reviewer
                    <select
                      value={assignee}
                      onChange={(event) => setAssignee(event.target.value)}
                      className={`${control} mt-2`}
                    >
                      <option value="">Unassigned</option>
                      {assignee &&
                        !reviewers.some((value) => value.id === assignee) && (
                          <option value={assignee}>
                            Previously assigned reviewer (inactive)
                          </option>
                        )}
                      {reviewers.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    Internal review note *
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      required
                      maxLength={5000}
                      rows={5}
                      className={`${control} mt-2`}
                    />
                  </label>
                  <button className={button} type="submit">
                    Save review
                  </button>
                </fieldset>
              </form>
              <section className="rounded-lg border border-border bg-white p-6">
                <h2 className="font-semibold text-navy">
                  Submission email copies
                </h2>
                <p className="mt-2 text-xs text-muted">
                  Sent means accepted by the email transport. It does not
                  confirm inbox delivery.
                </p>
                <ul className="mt-4 space-y-4">
                  {detail.emailDeliveries.map((mail) => (
                    <li key={mail.id} className="text-sm">
                      <p className="capitalize">
                        {mail.audience} copy: {mail.status}
                      </p>
                      <p className="text-xs text-muted">
                        Attempts: {mail.attempts}
                        {mail.sentAt ? ` · ${date(mail.sentAt)}` : ""}
                      </p>
                      {canRetry && mail.status === "failed" && (
                        <button
                          className="mt-2 text-xs font-semibold text-teal-dark underline"
                          disabled={busy}
                          onClick={() =>
                            void action(async () => {
                              await adminRequest(
                                `/admin/outbox/${mail.id}/retry`,
                                { method: "POST", body: "{}" },
                              );
                              await open(detail.id);
                              setNotice(
                                "Email retry queued. The worker will send the complete original submission.",
                              );
                            })
                          }
                        >
                          Retry failed email
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-border bg-white p-6">
              <h2 className="font-semibold text-navy">Internal notes</h2>
              <ul className="mt-4 space-y-4">
                {detail.notes.map((item, index) => (
                  <li key={index}>
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {item.body}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {date(item.at)} ·{" "}
                      {reviewers.find((value) => value.id === item.actorId)
                        ?.name || "HRPF reviewer"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-border bg-white p-6">
              <h2 className="font-semibold text-navy">Status history</h2>
              <ol className="mt-4 space-y-4">
                {detail.history.map((item, index) => (
                  <li key={index} className="text-sm capitalize">
                    {label(item.from)} → {label(item.to)}
                    <p className="text-xs text-muted">{date(item.at)}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </>
      ) : (
        <>
          <form
            className="mb-6 grid items-end gap-4 sm:grid-cols-[1fr_240px_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              const values = new FormData(event.currentTarget);
              setQuery(String(values.get("reference") || "").trim());
              setStatus(String(values.get("status") || ""));
              setPage(1);
            }}
          >
            <label className="block text-sm">
              Reference prefix
              <input
                name="reference"
                maxLength={80}
                defaultValue={query}
                placeholder="HRPF-C-"
                className={`${control} mt-2`}
              />
            </label>
            <label className="block text-sm">
              Status
              <select
                name="status"
                defaultValue={status}
                className={`${control} mt-2`}
              >
                <option value="">All statuses</option>
                {statuses.map((value) => (
                  <option key={value} value={value}>
                    {label(value)}
                  </option>
                ))}
              </select>
            </label>
            <button className={button}>Filter</button>
          </form>
          <p className="mb-4 text-sm text-muted">
            {listing.total} complaint{listing.total === 1 ? "" : "s"}
          </p>
          <ul className="space-y-3">
            {listing.rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-white p-5"
              >
                <div>
                  <h2 className="font-semibold text-navy">{row.reference}</h2>
                  <p className="mt-1 text-sm">
                    {row.name} · {row.category}
                  </p>
                  <p className="mt-1 text-xs capitalize text-muted">
                    {label(row.status)} · {row.district}, {row.province} ·{" "}
                    {date(row.createdAt)}
                  </p>
                </div>
                <button
                  disabled={busy}
                  onClick={() => void action(() => open(row.id))}
                  className={button}
                >
                  Review complaint
                </button>
              </li>
            ))}
          </ul>
          {!listing.rows.length && (
            <p className="rounded-lg border border-border bg-white p-6 text-sm text-muted">
              No complaints match this filter.
            </p>
          )}
          <div className="mt-6 flex items-center gap-4">
            <button
              disabled={page <= 1 || busy}
              onClick={() => setPage((value) => value - 1)}
              className={button}
            >
              Previous
            </button>
            <span className="text-sm">
              Page {page} of {listing.pages || 1}
            </span>
            <button
              disabled={page >= listing.pages || busy}
              onClick={() => setPage((value) => value + 1)}
              className={button}
            >
              Next
            </button>
          </div>
        </>
      )}
    </Container>
  );
}
