import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import PrimaryButton from "@/components/shared/PrimaryButton";
import TranslationText from "@/components/translation/TranslationText";
import { createMetadata } from "@/lib/seo";
import AppImage from "@/components/shared/AppImage";
import { focusAreas } from "@/data/focusAreas";
import { getWorkAreaContent } from "@/data/workAreas";
import source from "@/data/about-source.json";
export const metadata = createMetadata({ title: "Our Work", description: "HRPF Pakistan promotes human rights through awareness, documentation, lawful advocacy and institutional engagement.", path: "/our-work" });
export default function OurWorkPage() {
  return <main id="main-content" className="flex-1">
    <PageHero heroImage="community" eyebrow="OUR WORK" title="Human Dignity. Rights. Public Accountability." description="HRPF Pakistan stands with vulnerable communities through public awareness, responsible documentation, lawful advocacy and constructive engagement with institutions." breadcrumbs={[{ label: "Our Work" }]} />
    <section className="bg-off-white py-14 sm:py-20"><Container>
      <SectionHeading title="Our Areas of Work" description="Explore our approach and related published projects in each field." />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {focusAreas.map(area => { const content = getWorkAreaContent(area.slug)!; return <article key={area.slug} className="overflow-hidden border border-border bg-white">
          <div className="relative aspect-[16/9]"><AppImage src={content.image} alt={content.imageAlt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
          <div className="p-6 sm:p-8"><h2 className="text-2xl"><TranslationText>{content.title}</TranslationText></h2><p className="mt-4 text-base leading-relaxed text-muted"><TranslationText>{content.introduction}</TranslationText></p><PrimaryButton href={`/our-work/${area.slug}`} variant="outline" className="mt-6">Explore this field</PrimaryButton></div>
        </article>; })}
      </div>
    </Container></section>
    <section className="bg-soft-gray py-14 sm:py-20"><Container>
      <SectionHeading title="How We Work" description="Concerns become the starting point for responsible, lawful action." />
      <div className="mt-6 max-w-3xl space-y-4">{source.pages["our-approach"].blocks.map(block => <p key={block.text} className="text-base leading-relaxed text-muted"><TranslationText>{block.text}</TranslationText></p>)}</div>
      <div className="mt-8 flex flex-wrap gap-4"><PrimaryButton href="/projects">View Projects</PrimaryButton><PrimaryButton href="/impact" variant="outline">Our Impact</PrimaryButton><PrimaryButton href="/about/progress-reports" variant="outline">Progress Reports</PrimaryButton><PrimaryButton href="/contact" variant="outline">Contact HRPF</PrimaryButton></div>
    </Container></section>
  </main>;
}
