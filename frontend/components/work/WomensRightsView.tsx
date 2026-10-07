import { ArrowDown, ArrowRight, FileText, HeartPulse, Scale, ShieldCheck } from "lucide-react";
import Link from "@/components/translation/TranslationLink";
import TranslationText from "@/components/translation/TranslationText";
import Container from "@/components/shared/Container";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import AppImage from "@/components/shared/AppImage";
import PrimaryButton from "@/components/shared/PrimaryButton";
import SectionHeading from "@/components/shared/SectionHeading";
import Accordion from "@/components/shared/Accordion";
import ProjectCard from "@/components/shared/ProjectCard";
import { projectCard, type ProjectRecord } from "@/lib/home-feed";
import { readPublicCollection } from "@/lib/public-collections";
import { womensRights as content } from "@/data/womensRights";

const priorityIcons = [ShieldCheck, HeartPulse, Scale];
const sections = [
  { id: "priorities", label: "Our priorities" },
  { id: "related-projects", label: "Projects in this field" },
  { id: "our-approach", label: "Our approach" },
  { id: "raise-a-concern", label: "Raise a concern" },
];

/** Source-based thematic page. No illustrative statistics or prototype feeds. */
export default async function WomensRightsView() {
  const projects = await readPublicCollection<ProjectRecord>("projects", 1, undefined, 3, "en", "", content.title);
  return <main id="main-content" className="flex-1">
    <section className="bg-navy text-white">
      <Container className="py-10 sm:py-14 lg:py-16">
        <Breadcrumbs items={[{ label: "Our Work", href: "/our-work" }, { label: content.title }]} tone="light" />
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <p className="eyebrow !text-teal">DIGNITY · EQUALITY · ACCOUNTABILITY</p>
            <h1 className="mt-4 max-w-xl font-serif text-[38px] font-semibold leading-tight !text-white sm:text-[48px] lg:text-[56px]">{content.title}</h1>
            <p className="mt-5 text-xl leading-relaxed text-white sm:text-2xl">Dignity, safety and a voice.</p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80">{content.introduction}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PrimaryButton href="/file-a-complaint" variant="red" size="lg" icon={ArrowRight}>File a Complaint</PrimaryButton>
              <PrimaryButton href="#related-projects" variant="outlineDark" size="lg" icon={ArrowDown}>Explore our work</PrimaryButton>
            </div>
          </div>
          <div className="min-w-0 border border-white/20">
            <div className="relative aspect-[16/9] overflow-hidden">
              <AppImage src={content.image} alt={content.imageAlt} fill priority sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </Container>
    </section>

    <nav aria-label="On this page" className="border-b border-border bg-white">
      <Container><ul className="flex flex-wrap gap-x-7 gap-y-1 py-3">
        {sections.map(section => <li key={section.id}><Link href={`#${section.id}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-teal-dark"><TranslationText>{section.label}</TranslationText><ArrowDown size={14} aria-hidden="true" /></Link></li>)}
      </ul></Container>
    </nav>

    <section id="priorities" className="scroll-mt-24 bg-off-white py-14 sm:py-20">
      <Container>
        <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <SectionHeading eyebrow="Our priorities" title="Women's rights are human rights." />
          <p className="max-w-2xl text-base leading-relaxed text-muted">We work to strengthen awareness of women&apos;s rights and encourage fair access to health, education and justice. Our advocacy connects community concerns with the responsibility of institutions to act.</p>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {content.priorities.map((priority, index) => {
            const Icon = priorityIcons[index];
            return <article key={priority.title} className="border border-border bg-white p-6 sm:p-7">
              <Icon className="h-7 w-7 text-teal-dark" aria-hidden="true" />
              <h3 className="mt-5 text-xl leading-snug">{priority.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{priority.text}</p>
            </article>;
          })}
        </div>
      </Container>
    </section>

    <section id="related-projects" className="scroll-mt-24 bg-soft-gray py-14 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionHeading eyebrow="Our work in action" title="Projects in this field" description="Explore HRPF initiatives supporting women's dignity, safety and equal rights." />
          <PrimaryButton href="/projects" variant="outline" icon={ArrowRight}>View all projects</PrimaryButton>
        </div>
        {projects.data.length > 0 ? <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.data.map(row => {
            const project = { ...projectCard(row), href: `/projects/${row.slug}` };
            return <ProjectCard key={row.slug} project={project} startedLabel={project.startedLabel} />;
          })}
        </div> : <p className="mt-9 border border-border bg-white p-6 text-[15px] leading-relaxed text-muted" role="status">
          {projects.status === "unavailable" ? "Projects could not be loaded. Please try again later." : "There are no projects listed in this field yet. Explore all HRPF projects or contact us to learn more."}
        </p>}
      </Container>
    </section>

    <section id="our-approach" className="scroll-mt-24 bg-off-white py-14 sm:py-20">
      <Container>
        <SectionHeading eyebrow="Our approach" title="From a concern to responsible action." description="HRPF works through documentation, public awareness and peaceful, lawful engagement with institutions." />
        <ol className="mt-9 grid gap-7 md:grid-cols-3 md:gap-9">
          {content.approach.map((step, index) => <li key={step.title} className="border-t-2 border-teal pt-5">
            <p className="text-xs font-semibold tracking-widest text-teal-dark" aria-hidden="true">0{index + 1}</p>
            <h3 className="mt-3 text-xl leading-snug">{step.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{step.text}</p>
          </li>)}
        </ol>
      </Container>
    </section>

    <section id="raise-a-concern" className="scroll-mt-24 bg-soft-gray py-14 sm:py-16">
      <Container>
        <div className="grid gap-8 border border-border bg-white p-6 sm:p-9 lg:grid-cols-[1.3fr_1fr] lg:p-12">
          <div><p className="eyebrow">Raise a concern</p><h2 className="mt-3 text-[28px] leading-tight sm:text-[34px]">Your concern deserves to be heard.</h2><p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">Explain the issue through HRPF&apos;s complaint form and provide the relevant details and documents. For a general enquiry, contact the Foundation.</p></div>
          <div className="flex flex-col justify-center gap-3">
            <PrimaryButton href="/file-a-complaint" variant="red" size="lg" icon={FileText}>File a Complaint</PrimaryButton>
            <PrimaryButton href="/contact" variant="outline" size="lg" icon={ArrowRight}>Contact HRPF</PrimaryButton>
            <p className="text-xs leading-relaxed text-muted">This website is not an emergency response service. If you are in immediate danger, contact local emergency services.</p>
          </div>
        </div>
      </Container>
    </section>

    <section className="bg-off-white py-14 sm:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.4fr] lg:gap-14">
          <div><SectionHeading eyebrow="Questions and next steps" title="Know what to expect." /><p className="mt-4 text-[15px] leading-relaxed text-muted">Learn more about the Foundation&apos;s remit and its published work.</p><div className="mt-5 flex flex-col items-start gap-2">
            <Link href="/about/aims-and-objectives" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-dark underline underline-offset-4"><TranslationText>Our aims and objectives</TranslationText><ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="/projects" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-dark underline underline-offset-4"><TranslationText>Explore HRPF projects</TranslationText><ArrowRight size={16} aria-hidden="true" /></Link>
          </div></div>
          <Accordion items={content.faqs.map(faq => ({ title: faq.question, content: <TranslationText>{faq.answer}</TranslationText> }))} />
        </div>
      </Container>
    </section>
  </main>;
}
