import { FileText, ArrowDownToLine } from "lucide-react";
import { readPublicCollection, type PublicReport, type PublicCertificate } from "@/lib/public-collections";
import EmptyState from "./EmptyState";
import CollectionPagination from "./CollectionPagination";

export default async function PublicDocuments({ kind, page = 1 }: { kind: "reports" | "certificates"; page?: number }) {
  const result = await readPublicCollection<PublicReport | PublicCertificate>(kind, page);
  const noun = kind === "reports" ? "progress reports" : "registration documents and certificates";
  const path = kind === "reports" ? "/about/progress-reports" : "/about/registration-and-certificates";
  return (
    <>
      {result.data.length ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map(document => (
            <li key={document.id} className="flex flex-col rounded-lg border border-border bg-white p-6">
              <FileText className="h-8 w-8 text-teal-dark" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-navy">{document.title}</h2>
              {"download" in document ? <>
                <p className="mt-2 text-xs text-muted">{document.year}{document.pages ? ` · ${document.pages} pages` : ""}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{document.summary}</p>
              </> : <>
                {document.issuer && <p className="mt-2 text-sm text-muted">{document.issuer}</p>}
                {document.reference && <p className="mt-2 text-xs text-muted">Reference: {document.reference}</p>}
              </>}
              <a href={"download" in document ? document.download : document.file} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-dark" aria-label={`Download ${document.title}`}>
                <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />Download {kind === "reports" ? "PDF" : "document"}
              </a>
            </li>
          ))}
        </ul>
      ) : <EmptyState icon={FileText} title={result.status === "unavailable" ? "Documents temporarily unavailable" : `No published ${noun} yet`} description={result.status === "unavailable" ? "Please try again later." : "Documents will appear here after they are approved and released for public viewing."} />}
      <CollectionPagination path={path} page={page} pages={result.pages} />
    </>
  );
}
