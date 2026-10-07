import { FileText } from "lucide-react";
import { readPublicCollection, type PublicReport, type PublicCertificate } from "@/lib/public-collections";
import EmptyState from "./EmptyState";
import CollectionPagination from "./CollectionPagination";
import DocumentGrid from "./DocumentGrid";

export default async function PublicDocuments({ kind, page = 1 }: { kind: "reports" | "certificates"; page?: number }) {
  const result = await readPublicCollection<PublicReport | PublicCertificate>(kind, page);
  const noun = kind === "reports" ? "progress reports" : "registration documents and certificates";
  const path = kind === "reports" ? "/about/progress-reports" : "/about/registration-and-certificates";
  return (
    <>
      {kind === "certificates" && <div className="mb-8 max-w-3xl border-l-4 border-teal-dark pl-5"><h2 className="font-serif text-2xl text-navy">Our registration archive</h2><p className="mt-3 text-sm leading-relaxed text-muted">View HRPF’s supplied registration records and certificates. Dates and validity periods are shown as stated on each document. Historical documents do not confirm a renewal or current registration status.</p></div>}
      {result.data.length ? <DocumentGrid documents={result.data} kind={kind} today={new Date().toISOString().slice(0, 10)} /> : <EmptyState icon={FileText} title={result.status === "unavailable" ? "Documents temporarily unavailable" : `No published ${noun} yet`} description={result.status === "unavailable" ? "Please try again later." : "Documents will appear here after they are approved and released for public viewing."} />}
      <CollectionPagination path={path} page={page} pages={result.pages} />
    </>
  );
}
