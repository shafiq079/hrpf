import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import { createMetadata } from "@/lib/seo";
import SearchExplorer from "./SearchExplorer";

export const metadata = createMetadata({
  title: "Search",
  description:
    "Search across pages, projects, news, reports, campaigns and events.",
  path: "/search",
});

export default function SearchPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="SEARCH"
        title="Search"
        description="Search across pages, projects, news, reports, campaigns and events."
        breadcrumbs={[{ label: "Search" }]}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SearchExplorer />
        </Container>
      </section>
    </main>
  );
}
