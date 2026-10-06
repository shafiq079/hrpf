import { Tv } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import EmptyState from "@/components/shared/EmptyState";

export const metadata = createMetadata({ title: "TV Interviews", description: "Television interviews and conversations about HRPF’s advocacy.", path: "/gallery/tv-interviews" });
export default function TVInterviewsPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero eyebrow="GALLERY" title="TV Interviews" description="Television conversations about human rights and the Foundation’s work."
        breadcrumbs={[{ label: "Gallery", href: "/gallery" }, { label: "TV Interviews" }]} />
      <section className="bg-off-white py-16 sm:py-20 lg:py-24"><Container>
        <EmptyState icon={Tv} title="Interview recordings are not available here yet"
          description="You can visit HRPF Pakistan’s YouTube channel for available videos."
          action={<a href="https://youtube.com/@hrpfpakistan" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-teal-dark">Visit HRPF on YouTube <span className="sr-only">(opens in a new tab)</span></a>} />
      </Container></section>
    </main>
  );
}
