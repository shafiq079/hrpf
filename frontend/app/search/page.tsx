import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import { createMetadata } from "@/lib/seo";
import SearchExplorer, { type IndexEntry } from "./SearchExplorer";
import { readHomeFeed, type ProjectRecord, type NewsRecord } from "@/lib/home-feed";
import { readPublicCollection, type PublicReport } from "@/lib/public-collections";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "Search",
  description:
    "Search pages and the latest published projects, blogs and progress reports.",
  path: "/search",
});

export default async function SearchPage() {
  const [projects, blogs, reports] = await Promise.all([
    readHomeFeed<ProjectRecord>("projects", 48),
    readHomeFeed<NewsRecord>("blogs", 48),
    readPublicCollection<PublicReport>("reports", 1, undefined, 48),
  ]);
  const entries: IndexEntry[] = [
    ...projects.data.map(row => ({ type: "Projects" as const, title: row.title, description: row.summary, href: `/projects/${row.slug}` })),
    ...blogs.data.map(row => ({ type: "Blogs" as const, title: row.title, description: row.excerpt, href: `/blogs/${row.slug}` })),
    ...reports.data.map(row => ({ type: "Progress Reports" as const, title: row.title, description: row.summary, href: "/about/progress-reports" })),
  ];
  return (
    <main id="main-content" className="flex-1">
      <PageHero heroImage="documents"
        eyebrow="SEARCH"
        title="Search"
        description="Search pages and the latest published projects, blogs and progress reports."
        breadcrumbs={[{ label: "Search" }]}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SearchExplorer entries={entries} />
        </Container>
      </section>
    </main>
  );
}
