import Link from "@/components/translation/TranslationLink";
import TranslationText from "@/components/translation/TranslationText";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import source from "@/data/about-source.json";
import { aboutProfile } from "@/data/about-profile";
import { objectiveCount } from "@/data/aims-and-objectives";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import AppImage from "@/components/shared/AppImage";
import PrimaryButton from "@/components/shared/PrimaryButton";
import CallToAction from "@/components/shared/CallToAction";

const paragraphClass = "text-[15px] leading-relaxed text-text sm:text-base";
const sectionClass = "scroll-mt-28 py-12 sm:py-16 lg:py-20";
const contents = [
  ["our-purpose", "Our Purpose"], ["areas-of-work", "Areas of Work"],
  ["transparency", "Transparency"], ["standing-with-the-vulnerable", "Standing With the Vulnerable"],
  ["our-values", "Our Values"], ["legal-status", "Legal Status"], ["our-commitment", "Our Commitment"],
] as const;

export function AboutIntroduction() {
  return (
    <section className={`${sectionClass} bg-off-white`}>
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden border border-border">
            <AppImage src="/images/hrpf/home-about.webp" alt="HRPF representatives meeting at an office table." fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <SectionHeading eyebrow="Human Rights Protection Foundation Pakistan" title="A Ray of Hope for the Oppressed" />
            <div className="mt-6 space-y-4">
              {source.pages["who-we-are"].blocks.map(block => <p key={block.text} className={paragraphClass}><TranslationText>{block.text}</TranslationText></p>)}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function MissionVisionSummary() {
  return (
    <section id="our-purpose" className={`${sectionClass} bg-soft-gray`}>
      <Container>
        <div className="grid gap-5 md:grid-cols-2">
          {[source.pages.mission, source.pages.vision].map(page => (
            <div key={page.title} className="border border-border bg-white p-6 sm:p-8">
              <h2 className="text-2xl"><TranslationText>{page.title}</TranslationText></h2>
              <p className={`mt-4 ${paragraphClass}`}><TranslationText>{page.blocks[0].text}</TranslationText></p>
            </div>
          ))}
        </div>
        <PrimaryButton className="mt-6" href="/about/mission-and-vision" variant="outline" icon={ArrowRight}>Our Mission and Vision</PrimaryButton>
      </Container>
    </section>
  );
}

export function RegistrationSummary() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {aboutProfile.registrations.map(item => (
        <div key={item.title} className="min-w-0 border border-border bg-white p-6">
          <h3 className="text-xl"><TranslationText>{item.title}</TranslationText></h3>
          <p className={`mt-4 break-words ${paragraphClass}`}><TranslationText>{item.text}</TranslationText></p>
        </div>
      ))}
    </div>
  );
}

export default function AboutProfile() {
  return (
    <>
      <div className="border-b border-border bg-white py-5">
        <Container>
          <nav aria-label="On this page" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-teal-dark">
            {contents.map(([id, label]) => <a key={id} href={`#${id}`} className="underline-offset-4 hover:underline"><TranslationText>{label}</TranslationText></a>)}
          </nav>
        </Container>
      </div>
      <AboutIntroduction />
      <MissionVisionSummary />
      <section id="areas-of-work" className={`${sectionClass} bg-off-white`}>
        <Container>
          <SectionHeading eyebrow="Our Areas of Work" title="Rights, Welfare and the Public Interest" description="The Foundation works across humanitarian, social and human-rights areas to support people and strengthen communities." />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {aboutProfile.areas.map(area => (
              <div key={area.title} className="flex flex-col border border-border bg-white p-6">
                <h3 className="text-xl"><TranslationText>{area.title}</TranslationText></h3>
                <p className={`mt-3 flex-1 ${paragraphClass}`}><TranslationText>{area.description}</TranslationText></p>
                <Link href={area.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-dark hover:text-navy" aria-label={`Explore ${area.title}`}><TranslationText>Explore Our Work</TranslationText><ArrowRight size={16} aria-hidden="true" /></Link>
              </div>
            ))}
          </div>
          <PrimaryButton className="mt-6" href="/about/aims-and-objectives" variant="outline" icon={ArrowRight}><TranslationText>{`Read All ${objectiveCount} Aims and Objectives`}</TranslationText></PrimaryButton>
        </Container>
      </section>
      <section className={`${sectionClass} bg-soft-gray`}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div id="transparency" className="scroll-mt-28">
              <SectionHeading eyebrow="Lawful Action" title="Transparency and Institutional Accountability" />
              <div className="mt-6 space-y-4">{aboutProfile.transparency.map(text => <p key={text} className={paragraphClass}><TranslationText>{text}</TranslationText></p>)}</div>
              <PrimaryButton className="mt-6" href="/about/progress-reports" variant="outline" icon={ArrowRight}>View Progress Reports</PrimaryButton>
            </div>
            <div id="standing-with-the-vulnerable" className="scroll-mt-28">
              <SectionHeading eyebrow="Human Dignity" title="Standing With the Vulnerable" />
              <div className="mt-6 space-y-4">{aboutProfile.vulnerable.map(text => <p key={text} className={paragraphClass}><TranslationText>{text}</TranslationText></p>)}</div>
              <PrimaryButton className="mt-6" href="/contact" variant="outline" icon={ArrowRight}>Contact HRPF</PrimaryButton>
            </div>
          </div>
        </Container>
      </section>
      <section id="our-values" className={`${sectionClass} bg-off-white`}>
        <Container>
          <SectionHeading eyebrow="What Guides Us" title="Our Values" description="Our work is founded upon these principles." />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {aboutProfile.values.map(value => <li key={value.title} className="border border-border bg-white p-5"><h3 className="text-lg"><TranslationText>{value.title}</TranslationText></h3><p className="mt-3 text-sm leading-relaxed text-muted"><TranslationText>{value.description}</TranslationText></p></li>)}
          </ul>
        </Container>
      </section>
      <section id="legal-status" className={`${sectionClass} bg-soft-gray`}>
        <Container>
          <SectionHeading eyebrow="Institutional Accountability" title="Legal Status and Registration" description="Based in District Mandi Bahauddin, Punjab, Pakistan, the Foundation is committed to lawful and responsible organizational practices." />
          <div className="mt-8"><RegistrationSummary /></div>
          <PrimaryButton className="mt-6" href="/about/registration-and-certificates" variant="outline" icon={ArrowRight}>View Registration and Certificates</PrimaryButton>
        </Container>
      </section>
      <section id="our-commitment" className={`${sectionClass} bg-off-white`}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <SectionHeading eyebrow="Our Commitment to Pakistan" title="Dignity, Security and Hope" description="Human Rights Protection Foundation Pakistan is committed to contributing to a Pakistan where:" />
              <ul className="mt-6 space-y-3">{aboutProfile.commitment.map(text => <li key={text} className="flex items-start gap-3 text-base text-text"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-dark" aria-hidden="true" /><span><TranslationText>{text}</TranslationText></span></li>)}</ul>
            </div>
            <div className="self-start border-l-4 border-teal bg-white p-6 sm:p-8">
              <h2 className="text-2xl"><TranslationText>A Ray of Hope for the Oppressed</TranslationText></h2>
              <div className="mt-5 space-y-4">{aboutProfile.closing.map(text => <p key={text} className={paragraphClass}><TranslationText>{text}</TranslationText></p>)}</div>
              <p className={`mt-5 ${paragraphClass}`}><TranslationText>{aboutProfile.collaboration}</TranslationText></p>
            </div>
          </div>
        </Container>
      </section>
      <CallToAction title="Work With Us to Protect Human Dignity" actions={[{ label: "Partner With Us", href: "/partner-with-us", variant: "navy" }, { label: "Become a Member", href: "/become-a-member", variant: "outlineDark" }, { label: "Contact HRPF", href: "/contact", variant: "outlineDark" }]} />
    </>
  );
}
