import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import { createMetadata } from "@/lib/seo";
import ProjectsExplorer from "./ProjectsExplorer";

export const metadata = createMetadata({
  title: "Projects and Programmes",
  description:
    "Explore our current, completed and proposed initiatives supporting human-rights awareness, community protection, access to justice and institutional development.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="ACTIVE MISSIONS"
        title="Projects and Programmes"
        description="Explore our current, completed and proposed initiatives supporting human-rights awareness, community protection, access to justice and institutional development."
        breadcrumbs={[{ label: "Projects" }]}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <ProjectsExplorer />
        </Container>
      </section>
    </main>
  );
}
