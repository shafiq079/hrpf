import home from "@/data/homepage.json";
import {
  readHomeFeed,
  projectCard,
  newsCard,
  type ProjectRecord,
  type NewsRecord,
} from "@/lib/home-feed";
import HeroSection from "@/components/home/HeroSection";
import AboutPreview from "@/components/home/AboutPreview";
import FocusAreas from "@/components/home/FocusAreas";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import ImpactStatistics from "@/components/home/ImpactStatistics";
import TestimonialSection from "@/components/home/TestimonialSection";
import PartnersSection from "@/components/home/PartnersSection";
import LatestNews from "@/components/home/LatestNews";
import FinalCallToAction from "@/components/home/FinalCallToAction";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, news] = await Promise.all([
    readHomeFeed<ProjectRecord>("projects"),
    readHomeFeed<NewsRecord>("news"),
  ]);
  const programmeCards = home.programmeCards.map((p, i) => ({
    ...projectCard({
      ...p,
      slug: `programme-${i}`,
      status: "Proposed",
      location: "Pakistan",
    }),
    imageAlt: p.imageAlt,
    href: "/about",
    statusLabel: "Programme area",
    startedLabel: "From HRPF’s mission",
  }));
  const reportCards = home.reportCards.map((r) => ({
    ...newsCard({
      title: r.title,
      excerpt: r.summary,
      slug: `report-${r.year}`,
      publishedAt: `${r.year}-01-01`,
    }),
    href: "/reports",
    category: "Progress Report",
    dateLabel: `${r.year} report`,
    readingTime: "Report overview",
    image: r.image,
    imageAlt: r.imageAlt,
  }));

  return (
    <main id="main-content" className="flex-1">
      <HeroSection />
      <AboutPreview />
      <FocusAreas />
      <FeaturedProjects
        projects={
          projects.data.length ? projects.data.map(projectCard) : programmeCards
        }
        programmes={!projects.data.length}
      />
      <ImpactStatistics />
      <TestimonialSection />
      <PartnersSection />
      <LatestNews
        newsArticles={news.data.length ? news.data.map(newsCard) : reportCards}
        reports={!news.data.length}
      />
      <FinalCallToAction />
    </main>
  );
}
