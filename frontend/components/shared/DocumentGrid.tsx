import { ArrowDownToLine, Eye } from "lucide-react";
import TranslationText from "@/components/translation/TranslationText";
import type { PublicReport, PublicCertificate } from "@/lib/public-collections";

export default function DocumentGrid({
  documents,
  kind,
}: {
  documents: (PublicReport | PublicCertificate)[];
  kind: "reports" | "certificates";
}) {
  return (
    <ul
      aria-label={kind === "reports" ? "Progress reports" : "Registration documents and certificates"}
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      {documents.map((document) => (
        <li
          key={document.id}
          id={`document-${document.id}`}
          className="flex min-w-0 flex-col rounded-xl border border-border bg-white p-6 shadow-sm sm:p-7"
        >
          <h2 className="break-words font-serif text-xl leading-snug text-navy">
            <TranslationText>{document.title}</TranslationText>
          </h2>
          {"issuer" in document && document.issuer && (
            <p className="mt-3 break-words text-sm font-medium text-navy">
              <TranslationText>{document.issuer}</TranslationText>
            </p>
          )}
          {document.summary && (
            <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-muted">
              <TranslationText>{document.summary}</TranslationText>
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-6">
            <a
              href={document.view || document.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded bg-teal-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-dark"
              aria-label={`View ${document.title} (opens in a new tab)`}
            >
              <Eye size={16} aria-hidden="true" />
              <TranslationText>View document</TranslationText>
            </a>
            <a
              href={document.download}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded py-2.5 text-sm font-semibold text-teal-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-dark"
              aria-label={`Download ${document.title}`}
            >
              <ArrowDownToLine size={16} aria-hidden="true" />
              <TranslationText>Download</TranslationText>
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
