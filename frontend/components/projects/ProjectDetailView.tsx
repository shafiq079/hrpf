import Link from "@/components/translation/TranslationLink";
import {
  ArrowUpRight,
  Check,
  Download,
  MapPin,
  CalendarDays,
  Users,
  ArrowLeft,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Prose from "@/components/shared/Prose";
import HeroBackdrop from "@/components/shared/HeroBackdrop";
import { projectHeroImage } from "@/data/hero-images";
import ProjectGallery from "./ProjectGallery";
import type { ProjectDetail, TextBlock } from "@/lib/project-details";

function Paragraphs({ text }: { text: string }) {
  return (
    <Prose>
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((paragraph, i) => (
          <p key={i} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
    </Prose>
  );
}
function Blocks({ blocks }: { blocks: TextBlock[] }) {
  return (
    <Prose>
      {blocks.map((block, i) =>
        block.type === "heading" ? (
          <h3 key={i}>{block.text}</h3>
        ) : block.type === "list" ? (
          <ul key={i}>
            {block.items?.map((item, n) => (
              <li key={n}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-line">
            {block.text}
          </p>
        ),
      )}
    </Prose>
  );
}
export default function ProjectDetailView({
  project,
}: {
  project: ProjectDetail;
}) {
  const details = project.details ?? {};
  const photos = [
    ...(project.image
      ? [{ image: project.image, alt: project.imageAlt || project.title }]
      : []),
    ...(project.gallery ?? []),
  ];
  const narrative = [
    { id: "overview", heading: "About this project", text: details.overview },
    { id: "challenge", heading: "The challenge", text: details.challenge },
    { id: "approach", heading: "Our approach", text: details.approach },
  ].filter((section) => section.text);
  const lists = [
    {
      id: "objectives",
      heading: "What we aim to achieve",
      items: details.objectives,
    },
    { id: "activities", heading: "What we do", items: details.activities },
    {
      id: "outcomes",
      heading: "Results and lasting change",
      items: details.outcomes,
    },
  ].filter((section) => section.items?.length);
  const contents = [
    ...(photos.length ? [{ id: "photos", heading: "In pictures" }] : []),
    ...narrative,
    ...(project.blocks?.length
      ? [{ id: "story", heading: "Project story" }]
      : []),
    ...lists,
    ...(details.milestones?.length
      ? [{ id: "timeline", heading: "Project timeline" }]
      : []),
    ...(details.metrics?.length
      ? [{ id: "impact", heading: "Impact at a glance" }]
      : []),
    ...(details.sections ?? []).map((section, i) => ({
      id: `section-${i}`,
      heading: section.heading,
    })),
    ...(details.partners?.length
      ? [{ id: "partners", heading: "Working together" }]
      : []),
    ...(project.documents?.length
      ? [{ id: "resources", heading: "Project documents" }]
      : []),
  ];
  const sectionClass =
    "scroll-mt-28 border-b border-border pb-10 last:border-b-0";
  const headingClass = "mb-5 text-2xl sm:text-3xl";
  return (
    <article>
      <section className="relative overflow-hidden bg-navy py-12 sm:py-16">
        <HeroBackdrop image={projectHeroImage(project.focusArea)} backgroundImage={project.image && !project.image.includes("project-placeholder") ? project.image : undefined} />
        <Container className="relative">
          <Link
            href="/programmes"
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/95 hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" /> All projects
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              {project.focusArea}
            </span>
            <span className="border border-white/30 px-3 py-1 text-xs font-medium text-white">
              {project.status}
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl text-3xl leading-tight text-white sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/95 sm:text-lg">
            {project.summary}
          </p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/95">
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} aria-hidden="true" />
              {project.location}
            </span>
            {(details.period || project.startYear) && (
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} aria-hidden="true" />
                {details.period || `Started ${project.startYear}`}
              </span>
            )}
            {details.targetCommunity && (
              <span className="inline-flex items-center gap-2">
                <Users size={16} aria-hidden="true" />
                {details.targetCommunity}
              </span>
            )}
          </div>
        </Container>
      </section>
      <Container className="py-12 sm:py-16">
        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
          <div className="min-w-0 space-y-10">
            {photos.length > 0 && (
              <section id="photos" className="scroll-mt-28">
                <p className="eyebrow mb-4">In pictures</p>
                <ProjectGallery photos={photos} />
              </section>
            )}
            {narrative.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className={sectionClass}
              >
                <h2 className={headingClass}>{section.heading}</h2>
                <Paragraphs text={section.text!} />
              </section>
            ))}
            {project.blocks?.length > 0 && (
              <section id="story" className={sectionClass}>
                <h2 className={headingClass}>Project story</h2>
                <Blocks blocks={project.blocks} />
              </section>
            )}
            {lists.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className={sectionClass}
              >
                <h2 className={headingClass}>{section.heading}</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {section.items!.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 border border-border bg-white p-5"
                    >
                      <Check
                        className="mt-1 shrink-0 text-teal-dark"
                        size={18}
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {!!details.milestones?.length && (
              <section id="timeline" className={sectionClass}>
                <p className="eyebrow mb-3">From plans to progress</p>
                <h2 className={headingClass}>Project timeline</h2>
                <ol className="ml-2 border-l-2 border-border">
                  {details.milestones.map((milestone, i) => (
                    <li key={i} className="relative pb-8 pl-7 last:pb-0">
                      <span className="absolute -left-[7px] top-1.5 h-3 w-3 bg-teal-dark" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-teal-dark">
                        {milestone.period}
                      </p>
                      <h3 className="mt-2 text-lg">{milestone.title}</h3>
                      {milestone.description && (
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                          {milestone.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {!!details.metrics?.length && (
              <section id="impact" className="scroll-mt-28 bg-navy p-7 sm:p-9">
                <p className="eyebrow mb-3 text-gold">Documented results</p>
                <h2 className="mb-8 text-2xl text-white">Impact at a glance</h2>
                <dl className="grid gap-7 sm:grid-cols-2">
                  {details.metrics.map((metric, i) => (
                    <div key={i}>
                      <dd className="break-words font-serif text-4xl text-gold">
                        {metric.value}
                      </dd>
                      <dt className="mt-2 text-sm font-semibold text-white">
                        {metric.label}
                      </dt>
                      {metric.source && (
                        <dd className="mt-2 text-xs text-white/65">
                          Source: {metric.source}
                        </dd>
                      )}
                    </div>
                  ))}
                </dl>
              </section>
            )}
            {(details.sections ?? []).map((section, i) => (
              <section id={`section-${i}`} key={i} className={sectionClass}>
                <h2 className={headingClass}>{section.heading}</h2>
                <Paragraphs text={section.body} />
              </section>
            ))}
            {!!details.partners?.length && (
              <section id="partners" className={sectionClass}>
                <h2 className={headingClass}>Working together</h2>
                <ul className="flex flex-wrap gap-3">
                  {details.partners.map((partner, i) => (
                    <li
                      key={i}
                      className="border border-border bg-soft-gray px-5 py-3 text-sm font-medium"
                    >
                      {partner}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {!!project.documents?.length && (
              <section id="resources" className={sectionClass}>
                <h2 className={headingClass}>Project documents</h2>
                <div className="space-y-3">
                  {project.documents.map((document) => (
                    <a
                      key={document.file}
                      href={document.file}
                      className="flex items-center justify-between gap-4 border border-border bg-white p-5 text-sm font-semibold text-navy hover:border-teal"
                    >
                      <span>
                        {document.label}
                        <span className="mt-1 block text-xs font-normal text-muted">
                          PDF document
                        </span>
                      </span>
                      <Download size={20} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
          <aside className="min-w-0">
            <div className="space-y-6 lg:sticky lg:top-28">
              {!!contents.length && (
                <nav
                  aria-label="On this project page"
                  className="border border-border bg-white p-6"
                >
                  <p className="eyebrow mb-4">On this page</p>
                  <ul className="space-y-3">
                    {contents.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="text-sm text-navy hover:text-teal-dark"
                        >
                          {item.heading}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              <div className="border-t-4 border-gold bg-soft-gray p-6">
                <h2 className="text-xl">Be part of the change</h2>
                <p className="mt-3 text-sm leading-relaxed">
                  Learn more about this work or discuss how you can support the
                  Foundation.
                </p>
                <Link
                  href="/contact"
                  className="mt-5 flex items-center justify-between bg-navy px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
                >
                  Contact HRPF
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </article>
  );
}
