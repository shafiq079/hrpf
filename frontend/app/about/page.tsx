import Link from "@/components/translation/TranslationLink";
import TranslationText from "@/components/translation/TranslationText";
import { ArrowRight } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import { aboutSections } from "@/data/about";
import { AboutIntroduction, MissionVisionSummary } from "@/components/about/AboutProfile";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";

export const metadata = createMetadata({
  title: "About Us",
  description: "Human Rights Protection Foundation Pakistan: our identity, mission, values, leadership and commitment to dignity, justice and responsible institutions.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero heroImage="about" eyebrow="ABOUT HRPF" title="Human Rights Protection Foundation Pakistan" description="Standing with the oppressed, vulnerable and marginalized through lawful action, public awareness and responsible advocacy." breadcrumbs={[{ label: "About Us" }]} actions={[{ label: "Who We Are", href: "/about/who-we-are", variant: "navy" }, { label: "Contact HRPF", href: "/contact", variant: "outlineDark" }]} />
      <AboutIntroduction />
      <MissionVisionSummary />
      <section className="bg-off-white py-12 sm:py-16 lg:py-20">
        <Container>
          <SectionHeading eyebrow="Explore the Foundation" title="Our Purpose, People and Accountability" description="Learn about our work, meet our leadership and explore the documents behind our organizational commitments." />
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aboutSections.map(entry => (
              <li key={entry.slug} className="flex flex-col border border-border bg-white p-6">
                <h3 className="text-xl"><Link href={`/about/${entry.slug}`} className="hover:text-teal-dark"><TranslationText>{entry.label}</TranslationText></Link></h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted"><TranslationText>{entry.description}</TranslationText></p>
                <Link href={`/about/${entry.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-dark hover:text-navy" aria-label={`Read ${entry.label}`}><TranslationText>Read More</TranslationText><ArrowRight size={16} aria-hidden="true" /></Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </main>
  );
}
