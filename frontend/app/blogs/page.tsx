import Link from "@/components/translation/TranslationLink";
import { ArrowRight } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import { newsCard, type NewsRecord } from "@/lib/home-feed";
import { collectionPage, readPublicCollection } from "@/lib/public-collections";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import AppImage from "@/components/shared/AppImage";
import CollectionPagination from "@/components/shared/CollectionPagination";
import { formatDate } from "@/lib/format";
import BlogExplorer from "./BlogExplorer";

export const dynamic = "force-dynamic";
export const metadata = createMetadata({ title: "Blogs", description: "Read published HRPF articles, advocacy stories and programme updates.", path: "/blogs" });

export default async function BlogsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = collectionPage((await searchParams).page);
  const result = await readPublicCollection<NewsRecord>("blogs", page);
  const articles = result.data.map(newsCard);
  const featured = page === 1 ? articles[0] : undefined;
  return (
    <main id="main-content" className="flex-1">
      <PageHero eyebrow="BLOGS" title="Blogs, Stories and Updates" description="Explore HRPF’s published articles, community stories and human-rights advocacy updates." breadcrumbs={[{ label: "Blogs" }]} />
      {featured && (
        <section className="bg-off-white py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading eyebrow="Featured" title="Latest Blog" />
            <article className="mt-10 grid items-center gap-8 lg:grid-cols-2">
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border">
                <AppImage src={featured.image} alt={featured.imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="eyebrow">{featured.category}</p>
                <h2 className="mt-2 font-serif text-[26px] font-semibold leading-tight sm:text-[30px]"><Link href={featured.href} className="hover:text-teal-dark">{featured.title}</Link></h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">{featured.summary}</p>
                <p className="mt-4 text-xs text-muted"><time dateTime={featured.date}>{formatDate(featured.date)}</time></p>
                <Link href={featured.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-dark">Read Blog <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
            </article>
          </Container>
        </section>
      )}
      {result.status === "unavailable" && <Container className="py-8"><p role="status" className="text-muted">Blogs are temporarily unavailable. Please try again later.</p></Container>}
      <BlogExplorer articles={articles} />
      <Container className="pb-12"><CollectionPagination path="/blogs" page={page} pages={result.pages} /></Container>
    </main>
  );
}
