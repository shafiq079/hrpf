"use client";

import { useRef, useState } from "react";
import {
  FileText,
  ArrowDownToLine,
  Eye,
  ExternalLink,
  X,
  ShieldCheck,
} from "lucide-react";
import AppImage from "./AppImage";
import type { PublicReport, PublicCertificate } from "@/lib/public-collections";
import {
  documentDate,
  documentSize,
  certificatePeriod,
} from "@/lib/document-display";

export default function DocumentGrid({
  documents,
  kind,
  today,
}: {
  documents: (PublicReport | PublicCertificate)[];
  kind: "reports" | "certificates";
  today?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<PublicReport | PublicCertificate | null>(
    null,
  );
  function close() {
    dialog.current?.close();
    setActive(null);
  }
  return (
    <>
      <ul
        aria-label={
          kind === "reports"
            ? "Progress reports"
            : "Registration documents and certificates"
        }
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        {documents.map((document) => {
          const report = "slug" in document;
          return (
            <li
              key={document.id}
              id={`document-${document.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm"
            >
              <div
                className={`flex items-center justify-between gap-4 border-b border-border px-6 py-7 ${report ? "bg-navy text-white" : "bg-soft-gray text-navy"}`}
              >
                {report ? (
                  <FileText size={32} strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <ShieldCheck size={32} strokeWidth={1.5} aria-hidden="true" />
                )}
                <span className="text-xs font-semibold uppercase tracking-widest">
                  {report
                    ? `${document.year ? `${document.year} · ` : ""}Progress report`
                    : "Registration archive"}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p
                  className={`text-xs font-semibold ${!report && document.expiresAt && certificatePeriod(document, today) === "Validity date passed" ? "text-red-dark" : "text-teal-dark"}`}
                >
                  {report
                    ? document.edition === "public-edition"
                      ? "Public edition"
                      : "Complete report"
                    : certificatePeriod(document, today)}
                </p>
                <h2 className="mt-3 font-serif text-xl leading-snug text-navy">
                  {document.title}
                </h2>
                {!report && document.issuer && (
                  <p className="mt-3 text-sm font-medium text-navy">
                    {document.issuer}
                  </p>
                )}
                {document.summary && (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                    {document.summary}
                  </p>
                )}
                <dl className="mt-5 space-y-2 text-xs leading-relaxed text-muted">
                  {report ? (
                    <>
                      {(document.coverageStart || document.coverageEnd) && (
                        <div>
                          <dt className="inline font-semibold">
                            Reporting period:{" "}
                          </dt>
                          <dd className="inline">
                            {documentDate(document.coverageStart) ||
                              "Not stated"}{" "}
                            –{" "}
                            {documentDate(document.coverageEnd) || "Not stated"}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="sr-only">File details</dt>
                        <dd>
                          {[
                            "PDF",
                            document.pages ? `${document.pages} pages` : "",
                            documentSize(document.bytes),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </dd>
                      </div>
                    </>
                  ) : (
                    <>
                      {document.reference && (
                        <div>
                          <dt className="inline font-semibold">Reference: </dt>
                          <dd className="inline break-all">
                            {document.reference}
                          </dd>
                        </div>
                      )}
                      {document.issuedAt && (
                        <div>
                          <dt className="inline font-semibold">Issued: </dt>
                          <dd className="inline">
                            {documentDate(document.issuedAt)}
                          </dd>
                        </div>
                      )}
                      {document.validFrom && (
                        <div>
                          <dt className="inline font-semibold">Valid from: </dt>
                          <dd className="inline">
                            {documentDate(document.validFrom)}
                          </dd>
                        </div>
                      )}
                      {document.expiresAt && (
                        <div>
                          <dt className="inline font-semibold">
                            Valid until:{" "}
                          </dt>
                          <dd className="inline">
                            {documentDate(document.expiresAt)}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="sr-only">File details</dt>
                        <dd>
                          {[
                            document.format?.toUpperCase(),
                            documentSize(document.bytes),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
                {document.releaseNote && (
                  <details className="mt-5 rounded-lg bg-off-white p-3 text-xs leading-relaxed text-muted">
                    <summary className="cursor-pointer font-semibold text-navy">
                      About this public copy
                    </summary>
                    <p className="mt-2 whitespace-pre-line">
                      {document.releaseNote}
                    </p>
                  </details>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setActive(document);
                      dialog.current?.showModal();
                    }}
                    className="inline-flex items-center gap-2 rounded bg-teal-dark px-4 py-2.5 text-sm font-semibold text-white"
                    aria-label={`View ${document.title}`}
                  >
                    <Eye size={16} aria-hidden="true" />
                    View document
                  </button>
                  <a
                    href={document.download}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-teal-dark"
                    aria-label={`Download ${document.title}`}
                  >
                    <ArrowDownToLine size={16} aria-hidden="true" />
                    Download
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <dialog
        ref={dialog}
        onCancel={close}
        onClose={() => setActive(null)}
        aria-label={active?.title || "Document viewer"}
        className="m-auto max-h-[94dvh] w-[96vw] max-w-5xl overflow-auto rounded-xl bg-white p-5 backdrop:bg-navy/80 sm:p-7"
      >
        {active && (
          <>
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-serif text-xl text-navy">{active.title}</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close document viewer"
                className="shrink-0 rounded border border-border p-2"
              >
                <X size={20} />
              </button>
            </div>
            {active.releaseNote && (
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {active.releaseNote}
              </p>
            )}
            <div className="my-4 flex flex-wrap gap-5 text-sm font-semibold text-teal-dark">
              <a
                href={active.view || active.file}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2"
              >
                Open in a new tab
                <ExternalLink size={15} aria-hidden="true" />
              </a>
              <a href={active.download}>Download document</a>
            </div>
            <p className="mb-3 text-xs text-muted">
              If your browser cannot display this file, open it in a new tab or
              download it.
            </p>
            {active.format === "pdf" || "slug" in active ? (
              <iframe
                src={active.view || active.file}
                title={active.title}
                className="h-[64dvh] w-full rounded border border-border"
              />
            ) : (
              <a
                href={active.view || active.file}
                target="_blank"
                rel="noopener"
              >
                <AppImage
                  src={active.view || active.file}
                  alt={active.title}
                  width={1000}
                  height={1400}
                  className="mx-auto max-h-[68dvh] w-auto max-w-full object-contain"
                />
              </a>
            )}
          </>
        )}
      </dialog>
    </>
  );
}
