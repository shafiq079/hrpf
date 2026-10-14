import PageRetryButton from "@/components/shared/PageRetryButton";
import { Camera } from "lucide-react";
import Link from "@/components/translation/TranslationLink";
import { createMetadata } from "@/lib/seo";
import { collectionPage, readPublicCollection, type PublicGalleryImage, type PublicInterview } from "@/lib/public-collections";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import EmptyState from "@/components/shared/EmptyState";
import CollectionPagination from "@/components/shared/CollectionPagination";
import InterviewGrid from "@/components/gallery/InterviewGrid";
import MediaGrid from "@/components/gallery/MediaGrid";
export const dynamic = "force-dynamic";
export const metadata = createMetadata({
  title: "Media Coverage",
  description: "Explore HRPF’s published press archive, photographs and video coverage.",
  path: "/gallery/media-coverage"
});
export default async function MediaCoveragePage({
  searchParams
}: {
  searchParams: Promise<{
    page?: string | string[];
    q?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams,
    page = collectionPage(params.page),
    category = params.category === "videos" ? "videos" : params.category === "in-action" ? "in-action" : "media-coverage",
    q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const videos = category === "videos";
  const result = videos ? await readPublicCollection<PublicInterview>("interviews", page, "media-coverage", 12, "en", q) : await readPublicCollection<PublicGalleryImage>("gallery", page, category as "media-coverage" | "in-action", 12, "en", q);
  return <main id="main-content" className="flex-1"><PageHero heroImage="camera" eyebrow="GALLERY" title="Media Coverage" description="Explore our press archive, photographs and video coverage of the Foundation’s work." breadcrumbs={[{
      label: "Gallery",
      href: "/gallery"
    }, {
      label: "Media Coverage"
    }]} /><section className="bg-off-white py-12 sm:py-16"><Container>
    <div className="mb-8 flex flex-wrap items-center justify-between gap-5"><nav aria-label="Gallery collections" className="flex flex-wrap gap-2 rounded-lg border border-border bg-white p-1">{[["media-coverage", "Press coverage"], ["in-action", "HRPF photographs"], ["videos", "Videos"]].map(([value, label]) => <Link key={value} href={`/gallery/media-coverage?category=${value}`} aria-current={category === value ? "page" : undefined} className={`rounded-md px-4 py-3 text-sm font-semibold ${category === value ? "bg-navy text-white" : "text-navy"}`}>{label}</Link>)}</nav><form className="flex w-full gap-2 sm:w-auto" action="/gallery/media-coverage"><input translate="no" type="hidden" name="category" value={category} /><label className="flex-1"><span className="sr-only">Search media titles</span><input translate="no" name="q" defaultValue={q} maxLength={80} placeholder="Search the archive…" className="w-full rounded-md border border-border bg-white px-4 py-3 text-sm" /></label><button className="rounded-md bg-teal-dark px-4 py-3 text-sm font-semibold text-white">Search</button>{q && <Link href={`/gallery/media-coverage?category=${category}`} className="px-2 py-3 text-sm text-teal-dark">Clear</Link>}</form></div>
    {result.data.length ? videos ? <InterviewGrid items={result.data as PublicInterview[]} /> : <MediaGrid items={result.data as PublicGalleryImage[]} /> : <EmptyState icon={Camera} title={result.status === "unavailable" ? "Media coverage temporarily unavailable" : q ? "No matching media" : "No published media coverage yet"} description={result.status === "unavailable" ? "Please try again later." : q ? "Try another title or browse the other collection." : "Reviewed media will appear here once they are published."} />}
    {result.status === "unavailable" && <PageRetryButton />}
    <CollectionPagination path="/gallery/media-coverage" page={page} pages={result.pages} query={{
          category,
          ...(q ? {
            q
          } : {})
        }} />
  </Container></section></main>;
}
