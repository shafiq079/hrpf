import { Download, FileText } from "lucide-react";
import type { ReportResource } from "@/data/reports";

interface ResourceCardProps {
  resource: ReportResource;
}

/**
 * Report / resource card. When no approved file exists yet, the download button
 * is disabled and shows "File coming soon" — never a broken link.
 * TODO: place approved PDFs in /public/documents/ and set `fileUrl` in data/reports.ts.
 */
export default function ResourceCard({ resource }: ResourceCardProps) {
  const {
    title,
    category,
    year,
    language,
    fileType,
    fileSize,
    summary,
    fileUrl,
  } = resource;
  const available = Boolean(fileUrl);

  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-white p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal/10 text-teal">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow">{category}</p>
          <h3 className="mt-1 text-lg font-semibold leading-snug">{title}</h3>
        </div>
      </div>

      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">
        {summary}
      </p>

      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <div className="flex gap-1">
          <dt className="font-medium text-text">Year:</dt>
          <dd>{year}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="font-medium text-text">Language:</dt>
          <dd>{language}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="font-medium text-text">Type:</dt>
          <dd>
            {fileType} · {fileSize}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {available ? (
          <a
            href={fileUrl}
            className="inline-flex items-center gap-2 rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download
          </a>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="File coming soon"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-border bg-soft-gray px-4 py-2 text-sm font-semibold text-muted"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            File coming soon
          </button>
        )}
      </div>
    </article>
  );
}
