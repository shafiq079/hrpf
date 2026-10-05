import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import Gallery from "@/components/content/Gallery";
import Pagination from "@/components/content/Pagination";
import { ContentState } from "@/components/content/ContentView";
import {
  publicRead,
  pageNumber,
  type GalleryImage,
} from "@/lib/public-content";
export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams,
    page = pageNumber(search.page);
  const category =
    search.category === "media-coverage" ? "media-coverage" : "in-action";
  const result = await publicRead<GalleryImage[]>(
    `gallery?category=${category}&page=${page}`,
  );
  return (
    <main id="main-content">
      <PageHero title="Gallery" eyebrow="HRPF Pakistan" />
      <Container className="py-14 lg:py-20">
        <nav aria-label="Gallery categories" className="mb-8 flex gap-4">
          {[
            ["in-action", "HRPF in Action"],
            ["media-coverage", "Media Coverage"],
          ].map(([key, label]) => (
            <Link
              key={key}
              href={`/gallery?category=${key}`}
              aria-current={category === key ? "page" : undefined}
              className={
                category === key
                  ? "bg-navy px-5 py-3 text-white"
                  : "border border-border px-5 py-3 text-navy"
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        {result.status === "ok" && result.data.length ? (
          <>
            <Gallery images={result.data} />
            <Pagination
              page={page}
              pages={result.meta?.pages ?? 0}
              href="/gallery"
              query={{ category }}
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
