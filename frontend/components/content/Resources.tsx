import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import Pagination from "@/components/content/Pagination";
import { ContentState } from "@/components/content/ContentView";
import { publicRead, type Resource } from "@/lib/public-content";
const date = (value: string) =>
  new Date(value).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
export default async function Resources({
  kind,
  page,
}: {
  kind: "reports" | "certificates";
  page: number;
}) {
  const result = await publicRead<Resource[]>(`${kind}?page=${page}`),
    title =
      kind === "reports" ? "Progress Reports" : "Registration and Certificates";
  return (
    <main id="main-content">
      <PageHero
        eyebrow="About HRPF Pakistan"
        title={title}
        description={
          kind === "certificates"
            ? "Historical documents show the dates recorded on each certificate. Publication does not imply current validity."
            : "Public releases of the Foundation’s progress reports."
        }
      />
      <Container className="py-14 lg:py-20">
        {result.status === "ok" && result.data.length ? (
          <>
            <div className="grid border-l border-t border-border md:grid-cols-3">
              {result.data.map((r) => (
                <article
                  key={r.id}
                  className="flex flex-col border-b border-r border-border p-6"
                >
                  <h2 className="font-serif text-2xl text-navy">{r.title}</h2>
                  {r.year && (
                    <p className="mt-2 text-sm text-muted">
                      {r.year}
                      {r.pages ? ` · ${r.pages} pages` : ""}
                    </p>
                  )}
                  {r.summary && <p className="mt-4 text-muted">{r.summary}</p>}
                  {r.issuer && (
                    <p className="mt-4 text-muted">Issuer: {r.issuer}</p>
                  )}
                  {r.reference && (
                    <p className="mt-2 text-sm text-muted">
                      Reference: {r.reference}
                    </p>
                  )}
                  {r.issuedAt && (
                    <p className="mt-2 text-sm text-muted">
                      Issued: {date(r.issuedAt)}
                    </p>
                  )}
                  {r.validFrom && (
                    <p className="mt-2 text-sm text-muted">
                      Valid from: {date(r.validFrom)}
                    </p>
                  )}
                  {r.expiresAt && (
                    <p className="mt-2 text-sm text-muted">
                      Recorded expiry: {date(r.expiresAt)}
                    </p>
                  )}
                  <a
                    href={r.download ?? r.file}
                    className="mt-6 inline-block font-semibold text-teal-dark"
                  >
                    {kind === "reports"
                      ? "Download public PDF"
                      : "View public document"}{" "}
                    →
                  </a>
                </article>
              ))}
            </div>
            <Pagination
              page={page}
              pages={result.meta?.pages ?? 0}
              href={`/about/${kind === "reports" ? "progress-reports" : "registration-certificates"}`}
            />
          </>
        ) : (
          <ContentState
            status={result.status === "unavailable" ? "unavailable" : "missing"}
          />
        )}
      </Container>
    </main>
  );
}
