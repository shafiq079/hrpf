"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { FolderOpen, Plus, LogOut, Pencil, ExternalLink } from "lucide-react";
import Container from "@/components/shared/Container";
import { adminRequest } from "@/lib/admin-api";
import DocumentEditor, {
  newDocument,
  type DocumentRecord,
  type DocumentKind,
} from "./DocumentEditor";

type User = { name: string; email: string; role: string };
type DocumentRow = DocumentRecord & { id: string };
export default function DocumentConsole() {
  const [kind, setKind] = useState<DocumentKind>("reports");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DocumentRow[]>([]);
  const [editor, setEditor] = useState<DocumentRecord | null>(null);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const allowed =
    !!user && ["super_admin", "admin", "editor"].includes(user.role);
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
  const loadDocuments = useCallback(async () => {
    try {
      setRows(await adminRequest<DocumentRow[]>(`/admin/${kind}?page=${page}`));
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Documents could not be loaded.",
      );
    } finally {
      setBusy(false);
    }
  }, [page, kind]);
  useEffect(() => {
    if (!allowed || editor) return;
    let active = true;
    adminRequest<DocumentRow[]>(`/admin/${kind}?page=${page}`)
      .then((result) => {
        if (active) setRows(result);
      })
      .catch((failure) => {
        if (active)
          setError(
            failure instanceof Error
              ? failure.message
              : "Documents could not be loaded.",
          );
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [allowed, editor, page, kind]);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const fields = new FormData(event.currentTarget);
    try {
      const result = await adminRequest<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: fields.get("email"),
          password: fields.get("password"),
        }),
      });
      setUser(result.user);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError("");
    try {
      await adminRequest("/auth/logout", { method: "POST", body: "{}" });
      setUser(null);
      setEditor(null);
      setRows([]);
      setNotice("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Sign-out failed.");
    } finally {
      setBusy(false);
    }
  }
  async function edit(id: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      setEditor(await adminRequest<DocumentRecord>(`/admin/${kind}/${id}`));
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Document could not be opened.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function act(row: DocumentRow, action: "withdraw" | "delete") {
    if (
      !window.confirm(
        action === "delete"
          ? `Delete “${row.title.en}”? This removes the record from the website.`
          : "Withdraw this record from the website? You can edit and publish it again later.",
      )
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminRequest(
        action === "delete"
          ? `/admin/${kind}/${row.id}`
          : `/admin/publication/${kind === "reports" ? "report" : "certificate"}/${row.id}`,
        {
          method: action === "delete" ? "DELETE" : "POST",
          body: JSON.stringify(
            action === "delete"
              ? { version: row.version }
              : {
                  version: row.version,
                  action: "withdraw",
                  releaseReviewed: true,
                },
          ),
        },
      );
      setNotice(
        action === "delete" ? "Document deleted." : "Document withdrawn.",
      );
      await loadDocuments();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "The change could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <Container className="py-16">
        <p role="status">Loading document management…</p>
      </Container>
    );
  return (
    <Container className="py-10 sm:py-14">
      {allowed && (
        <nav
          aria-label="Content administration"
          className="mb-6 flex flex-wrap gap-5 text-sm font-semibold"
        >
          <Link href="/admin/projects" className="text-teal-dark">
            Projects
          </Link>
          <Link href="/admin/blogs" className="text-teal-dark">
            Blogs
          </Link>
          <Link href="/admin/gallery" className="text-teal-dark">
            Gallery
          </Link>
          <Link href="/admin/documents" className="text-teal-dark">
            Documents
          </Link>
        </nav>
      )}
      {user && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <p className="text-sm text-muted">
            {user.name} · {user.email}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy"
          >
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
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
      {!user ? (
        <form
          onSubmit={(event) => void login(event)}
          className="mx-auto max-w-md border border-border bg-white p-7 sm:p-9"
        >
          <p className="eyebrow">HRPF administration</p>
          <h1 className="mt-3 text-3xl">Sign in</h1>
          <p className="mt-3 text-sm text-muted">
            Use your administrator or editor account to manage reports and
            certificates.
          </p>
          <label className="mt-6 block text-sm font-semibold">
            Email
            <input
              required
              type="email"
              name="email"
              autoComplete="username"
              className="mt-2 w-full border border-border px-3 py-2.5"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Password
            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              maxLength={200}
              className="mt-2 w-full border border-border px-3 py-2.5"
            />
          </label>
          <button
            disabled={busy}
            className="mt-6 w-full bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : !allowed ? (
        <div className="border border-border bg-white p-8">
          <h1 className="text-2xl">Document access required</h1>
          <p className="mt-3">
            Your account does not have permission to manage reports and
            certificates.
          </p>
        </div>
      ) : editor ? (
        <DocumentEditor
          kind={kind}
          initial={editor}
          onCancel={() => setEditor(null)}
          onSaved={(message) => {
            setEditor(null);
            setNotice(message);
            setError("");
          }}
        />
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Content management</p>
              <h1 className="mt-2 text-3xl">Documents</h1>
              <p className="mt-3 text-sm text-muted">
                Manage progress reports, registration records and certificates.
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setEditor(newDocument(kind));
                setNotice("");
                setError("");
              }}
              className="inline-flex items-center gap-2 bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-50"
            >
              <Plus size={18} aria-hidden="true" />
              Add document
            </button>
          </div>
          <nav aria-label="Document management" className="mb-6 flex gap-3">
            {(["reports", "certificates"] as DocumentKind[]).map((value) => (
              <button
                type="button"
                key={value}
                disabled={
                  busy || (value === "certificates" && user.role === "editor")
                }
                aria-pressed={kind === value}
                onClick={() => {
                  setKind(value);
                  setPage(1);
                  setRows([]);
                  setError("");
                  setNotice("");
                }}
                className={`border border-border px-5 py-3 text-sm font-semibold ${kind === value ? "bg-navy text-white" : "bg-white text-navy"}`}
              >
                {value === "reports"
                  ? "Progress reports"
                  : "Registration and certificates"}
              </button>
            ))}
          </nav>
          <div className="space-y-4">
            {rows.map((row) => (
              <article
                key={row.id}
                className="flex flex-col gap-5 border border-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold ${row.status === "published" ? "bg-soft-gray text-teal-dark" : "bg-gold/15 text-navy"}`}
                  >
                    {row.status === "published" ? "Published" : "Draft"}
                  </span>
                  <h2 className="mt-3 break-words text-xl">{row.title.en}</h2>
                  <p className="mt-2 text-sm text-muted">
                    {kind === "reports" ? row.year : row.issuer}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-x-5 gap-y-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void edit(row.id)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-teal-dark"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  {row.status === "published" && (
                    <>
                      <Link
                        href={`${kind === "reports" ? "/about/progress-reports" : "/about/registration-and-certificates"}#document-${row.id}`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-navy"
                      >
                        View
                        <ExternalLink size={15} />
                      </Link>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void act(row, "withdraw")}
                        className="text-sm font-semibold text-navy"
                      >
                        Withdraw
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void act(row, "delete")}
                    className="text-sm font-semibold text-red-dark"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!rows.length && !busy && (
            <div className="border border-border bg-white p-12 text-center">
              <FolderOpen
                className="mx-auto mb-4 text-teal-dark"
                size={32}
                aria-hidden="true"
              />
              <h2 className="text-xl">No documents on this page</h2>
              <p className="mt-3 text-sm text-muted">
                Add your first document or return to the previous page.
              </p>
            </div>
          )}
          {busy && (
            <p role="status" className="mt-5 text-sm text-muted">
              Loading…
            </p>
          )}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={page === 1 || busy}
              className="border border-border px-4 py-2 text-sm disabled:opacity-40"
              onClick={() => {
                setBusy(true);
                setPage((value) => value - 1);
              }}
            >
              Previous
            </button>
            <span className="text-sm">Page {page}</span>
            <button
              type="button"
              disabled={rows.length < 20 || busy || page >= 1000}
              className="border border-border px-4 py-2 text-sm disabled:opacity-40"
              onClick={() => {
                setBusy(true);
                setPage((value) => value + 1);
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </Container>
  );
}
