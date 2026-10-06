import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import { createMetadata } from "@/lib/seo";
import { readHomeFeed, projectCard, type ProjectRecord } from "@/lib/home-feed";
import ProjectsExplorer from "./ProjectsExplorer";

export const metadata = createMetadata({
  title: "Projects and Programmes",
  description:
    "Explore our current, completed and proposed initiatives supporting human-rights awareness, community protection, access to justice and institutional development.",
  path: "/projects",
});

export const dynamic = "force-dynamic";
export default async function ProjectsPage() {
  const result = await readHomeFeed<ProjectRecord>("projects", 48);
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
          <ProjectsExplorer projects={result.data.map(projectCard)} />
        {result.status === "unavailable" && <p role="status" className="mt-6 text-sm text-muted">Projects could not be loaded. Please try again later.</p>}
        </Container>
      </section>
    </main>
  );
}
