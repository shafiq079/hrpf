import HeroSection from "@/components/home/HeroSection";
import AboutPreview from "@/components/home/AboutPreview";
import FocusAreas from "@/components/home/FocusAreas";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import ImpactStatistics from "@/components/home/ImpactStatistics";
import TestimonialSection from "@/components/home/TestimonialSection";
import PartnersSection from "@/components/home/PartnersSection";
import LatestNews from "@/components/home/LatestNews";
import FinalCallToAction from "@/components/home/FinalCallToAction";

export default function Home() {
  return (
    <main id="main-content" className="flex-1">
      <HeroSection />
      <AboutPreview />
      <FocusAreas />
      <FeaturedProjects />
      <ImpactStatistics />
      <TestimonialSection />
      <PartnersSection />
      <LatestNews />
      <FinalCallToAction />
    </main>
  );
}
