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

  return (
    <main id="main-content" className="flex-1">
      <HeroSection />
      <AboutPreview />
      <FocusAreas />
      <FeaturedProjects projects={projects.data.map(projectCard)} />
      <ImpactStatistics />
      <TestimonialSection />
      <PartnersSection />
      <LatestNews newsArticles={news.data.map(newsCard)} />
      <FinalCallToAction />
    </main>
  );
}
