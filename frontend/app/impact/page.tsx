import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import PrimaryButton from "@/components/shared/PrimaryButton";
import TranslationText from "@/components/translation/TranslationText";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({ title: "Our Impact", description: "Documented HRPF work in rights protection, public services, transparency and support for vulnerable people.", path: "/impact" });
const areas = [
  { title: "Protection and Access to Justice", text: "HRPF’s progress reports document representations concerning women’s safety, child protection and the treatment of vulnerable people. The Foundation brings concerns to responsible authorities and follows up through lawful channels." },
  { title: "Health and Essential Services", text: "Documented interventions include healthcare access for prisoners, clean-water feasibility and concerns about public health and education services. These records show the specific action taken and the institutional response recorded at that time." },
  { title: "Information and Accountability", text: "The Foundation uses Right to Information requests, research and public-interest advocacy to examine public services and encourage transparent, accountable institutions." },
  { title: "Support Across Borders", text: "The Foundation’s reports record assistance with travel documents and return to Pakistan in a specific overseas case, alongside trafficking-prevention and migration-awareness work." },
];
export default function ImpactPage() {
  return <main id="main-content" className="flex-1">
    <PageHero heroImage="community" eyebrow="OUR IMPACT" title="Documented Action for Dignity and Justice" description="HRPF’s work is reflected in the concerns it documents, the institutions it engages and the responses recorded in its projects and progress reports." breadcrumbs={[{ label: "Our Work", href: "/our-work" }, { label: "Our Impact" }]} />
    <section className="bg-off-white py-14 sm:py-20"><Container>
      <SectionHeading title="Where Our Work Makes a Difference" description="These areas reflect work recorded in HRPF’s progress reports and organizational profile." />
      <div className="mt-8 grid gap-6 md:grid-cols-2">{areas.map(area => <article key={area.title} className="border border-border bg-white p-6 sm:p-8"><h2 className="text-2xl"><TranslationText>{area.title}</TranslationText></h2><p className="mt-4 text-base leading-relaxed text-muted"><TranslationText>{area.text}</TranslationText></p></article>)}</div>
    </Container></section>
    <section className="bg-soft-gray py-14 sm:py-20"><Container>
      <SectionHeading title="Follow the Evidence" description="Projects describe individual interventions. Progress reports provide the wider record of activities, correspondence and documented responses. An ongoing matter can still require further action; a completed intervention describes the recorded step, rather than a guarantee about current conditions." />
      <div className="mt-8 flex flex-wrap gap-4"><PrimaryButton href="/projects">Explore Projects</PrimaryButton><PrimaryButton href="/about/progress-reports" variant="outline">Read Progress Reports</PrimaryButton><PrimaryButton href="/contact" variant="outline">Contact HRPF</PrimaryButton></div>
    </Container></section>
  </main>;
}
