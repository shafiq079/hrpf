import { createMetadata } from "@/lib/seo";
import PageHero from "@/components/shared/PageHero";
import ReportsExplorer from "./ReportsExplorer";

export const metadata = createMetadata({
  title: "Reports",
  description:
    "Explore organizational reports, policy briefs, educational guides and downloadable human-rights resources.",
  path: "/reports",
});

export default function ReportsPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="PUBLICATIONS"
        title="Reports, Publications and Resources"
        description="Explore organizational reports, policy briefs, educational guides and downloadable human-rights resources."
        breadcrumbs={[{ label: "Reports" }]}
      />

      <ReportsExplorer />
    </main>
  );
}
