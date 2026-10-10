import { Camera } from "lucide-react";
import Link from "@/components/translation/TranslationLink";
import { createMetadata } from "@/lib/seo";
import { collectionPage, readPublicCollection, type PublicGalleryImage } from "@/lib/public-collections";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import EmptyState from "@/components/shared/EmptyState";
import CollectionPagination from "@/components/shared/CollectionPagination";
import MediaGrid from "@/components/gallery/MediaGrid";
export const dynamic = "force-dynamic";
export const metadata = createMetadata({
  title: "Media Coverage",
  description: "Explore HRPF’s published press archive and photographs in a full-size image viewer.",
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
    category = params.category === "in-action" ? "in-action" : "media-coverage",
    q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const result = await readPublicCollection<PublicGalleryImage>("gallery", page, category, 12, "en", q);
  return <main id="main-content" className="flex-1"><PageHero heroImage="camera" eyebrow="GALLERY" title="Media Coverage" description="Explore our press archive and photographs. Open an image to read a cutting, zoom in or browse the collection." breadcrumbs={[{
      label: "Gallery",
      href: "/gallery"
    }, {
      label: "Media Coverage"
    }]} /><section className="bg-off-white py-12 sm:py-16"><Container>
    <div className="mb-8 flex flex-wrap items-center justify-between gap-5"><nav aria-label="Gallery collections" className="flex gap-2 rounded-lg border border-border bg-white p-1">{[["media-coverage", "Press coverage"], ["in-action", "HRPF photographs"]].map(([value, label]) => <Link key={value} href={`/gallery/media-coverage?category=${value}`} aria-current={category === value ? "page" : undefined} className={`rounded-md px-4 py-3 text-sm font-semibold ${category === value ? "bg-navy text-white" : "text-navy"}`}>{label}</Link>)}</nav><form className="flex w-full gap-2 sm:w-auto" action="/gallery/media-coverage"><input translate="no" type="hidden" name="category" value={category} /><label className="flex-1"><span className="sr-only">Search media titles</span><input translate="no" name="q" defaultValue={q} maxLength={80} placeholder="Search the archive…" className="w-full rounded-md border border-border bg-white px-4 py-3 text-sm" /></label><button className="rounded-md bg-teal-dark px-4 py-3 text-sm font-semibold text-white">Search</button>{q && <Link href={`/gallery/media-coverage?category=${category}`} className="px-2 py-3 text-sm text-teal-dark">Clear</Link>}</form></div>
    {result.data.length ? <MediaGrid items={result.data} /> : <EmptyState icon={Camera} title={result.status === "unavailable" ? "Media coverage temporarily unavailable" : q ? "No matching images" : "No published media coverage yet"} description={result.status === "unavailable" ? "Please try again later." : q ? "Try another title or browse the other collection." : "Reviewed media images will appear here once they are published."} />}
    <CollectionPagination path="/gallery/media-coverage" page={page} pages={result.pages} query={{
          category,
          ...(q ? {
            q
          } : {})
        }} />
  </Container></section></main>;
}
