import { Camera } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import { collectionPage, readPublicCollection, type PublicGalleryImage } from "@/lib/public-collections";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import AppImage from "@/components/shared/AppImage";
import EmptyState from "@/components/shared/EmptyState";
import CollectionPagination from "@/components/shared/CollectionPagination";

export const dynamic = "force-dynamic";
export const metadata = createMetadata({ title: "Media Coverage", description: "View published and reviewed media coverage of HRPF Pakistan.", path: "/gallery/media-coverage" });
export default async function MediaCoveragePage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = collectionPage((await searchParams).page);
  const result = await readPublicCollection<PublicGalleryImage>("gallery", page, "media-coverage");
  return (
    <main id="main-content" className="flex-1">
      <PageHero eyebrow="GALLERY" title="Media Coverage" description="Published coverage from the Foundation’s media archive."
        breadcrumbs={[{ label: "Gallery", href: "/gallery" }, { label: "Media Coverage" }]} />
      <section className="bg-off-white py-16 sm:py-20 lg:py-24"><Container>
        {result.data.length ? <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map(item => (
            <li key={item.id} className="overflow-hidden rounded-lg border border-border bg-white">
              <figure>
                <a href={item.file} className="relative block aspect-[4/3] bg-soft-gray" aria-label={`View full image: ${item.title}`}>
                  <AppImage src={item.file} alt={item.alt || item.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain" />
                </a>
                <figcaption className="p-6"><h2 className="text-lg font-semibold text-navy">{item.title}</h2>{item.caption && <p className="mt-2 text-sm leading-relaxed text-muted">{item.caption}</p>}</figcaption>
              </figure>
            </li>
          ))}
        </ul> : <EmptyState icon={Camera} title={result.status === "unavailable" ? "Media coverage temporarily unavailable" : "No published media coverage yet"}
          description={result.status === "unavailable" ? "Please try again later." : "Reviewed media images will appear here once they are published."} />}
        <CollectionPagination path="/gallery/media-coverage" page={page} pages={result.pages} />
      </Container></section>
    </main>
  );
}
