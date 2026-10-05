import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Download } from "lucide-react";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import Prose from "@/components/shared/Prose";
import StatCard from "@/components/shared/StatCard";
import ProjectCard from "@/components/shared/ProjectCard";
import ResourceCard from "@/components/shared/ResourceCard";
import TestimonialCard from "@/components/shared/TestimonialCard";
import CallToAction from "@/components/shared/CallToAction";
import AppImage from "@/components/shared/AppImage";
import { createMetadata } from "@/lib/seo";
import { projects, getProject } from "@/data/projects";
import { getReport, type ReportResource } from "@/data/reports";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return createMetadata({
    title: project.title,
    description: project.summary,
    path: project.href,
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const metaItems: { label: string; value: string }[] = [
    { label: "Status", value: project.status },
    { label: "Focus area", value: project.focusArea },
    { label: "Location", value: project.location },
  ];
  if (project.period) {
    metaItems.push({ label: "Project period", value: project.period });
  }
  if (project.targetCommunity) {
    metaItems.push({
      label: "Target community",
      value: project.targetCommunity,
    });
  }

  const relatedReports = (project.relatedReportSlugs ?? [])
    .map((reportSlug) => getReport(reportSlug))
    .filter((report): report is ReportResource => report !== undefined);

  const relatedProjects = projects
    .filter((other) => other.slug !== project.slug)
    .slice(0, 3);

  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow={project.focusArea}
        title={project.title}
        description={project.summary}
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: project.title },
        ]}
        backgroundImage={project.image}
        imageAlt={project.imageAlt}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metaItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-white p-5"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {item.label}
                </dt>
                <dd className="mt-2 text-[15px] font-semibold text-text">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {project.overview && (
        <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="max-w-3xl">
              <SectionHeading as="h2" eyebrow="Overview" title="Project Overview" />
              <Prose className="mt-4">
                <p>{project.overview}</p>
              </Prose>
            </div>
          </Container>
        </section>
      )}

      {project.problemStatement && (
        <section className="bg-off-white py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="max-w-3xl">
              <SectionHeading
                as="h2"
                eyebrow="The Challenge"
                title="Problem Statement"
              />
              <Prose className="mt-4">
                <p>{project.problemStatement}</p>
              </Prose>
            </div>
          </Container>
        </section>
      )}

      {project.objectives && project.objectives.length > 0 && (
        <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading as="h2" eyebrow="Goals" title="Objectives" />
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {project.objectives.map((objective) => (
                <li
                  key={objective}
                  className="flex items-start gap-3 rounded-lg border border-border bg-white p-4"
                >
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-teal-dark"
                    aria-hidden="true"
                  />
                  <span className="text-[15px] leading-relaxed text-text">
                    {objective}
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {project.activities && project.activities.length > 0 && (
        <section className="bg-off-white py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading as="h2" eyebrow="In Practice" title="Activities" />
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {project.activities.map((activity) => (
                <li
                  key={activity}
                  className="flex items-start gap-3 rounded-lg border border-border bg-white p-4"
                >
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-teal-dark"
                    aria-hidden="true"
                  />
                  <span className="text-[15px] leading-relaxed text-text">
                    {activity}
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {project.timeline && project.timeline.length > 0 && (
        <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading as="h2" eyebrow="Progress" title="Timeline" />
            <ol className="mt-8 space-y-4">
              {project.timeline.map((item) => (
                <li
                  key={`${item.period}-${item.milestone}`}
                  className="flex flex-col gap-1 rounded-lg border border-border bg-white p-5 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <span className="shrink-0 text-sm font-semibold text-teal-dark sm:w-32">
                    {item.period}
                  </span>
                  <span className="text-[15px] leading-relaxed text-text">
                    {item.milestone}
                  </span>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {project.partners && project.partners.length > 0 && (
        <section className="bg-off-white py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading as="h2" eyebrow="Collaboration" title="Partners" />
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.partners.map((partner) => (
                <li
                  key={partner}
                  className="rounded-lg border border-border bg-white p-5 text-[15px] font-medium text-text"
                >
                  {partner}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {project.results && project.results.length > 0 && (
        <section className="bg-navy py-16 lg:py-20">
          <Container>
            <SectionHeading
              align="center"
              tone="light"
              eyebrow="Outcomes"
              title="Results and Indicators"
              description="Key results delivered through this project."
            />
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {project.results.map((result) => (
                <StatCard
                  key={result.label}
                  value={result.value}
                  label={result.label}
                  tone="light"
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {project.story && (
        <section className="bg-off-white py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              as="h2"
              eyebrow="Community Voice"
              title="Community Story"
            />
            <div className="mt-8 max-w-2xl">
              <TestimonialCard
                quote={project.story.quote}
                name={project.story.name}
                role={project.story.role}
              />
            </div>
          </Container>
        </section>
      )}

      {project.gallery && project.gallery.length > 0 && (
        <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading as="h2" eyebrow="Gallery" title="Image Gallery" />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {project.gallery.map((src, index) => (
                <div
                  key={src}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border"
                >
                  <AppImage
                    src={src}
                    alt={`${project.title} gallery image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {relatedReports.length > 0 && (
        <section className="bg-off-white py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading as="h2" eyebrow="Resources" title="Related Reports" />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {relatedReports.map((report) => (
                <ResourceCard key={report.slug} resource={report} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {relatedProjects.length > 0 && (
        <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              as="h2"
              eyebrow="Explore More"
              title="Related Projects"
            />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((related) => (
                <ProjectCard key={related.slug} project={related} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="bg-off-white pb-4 pt-16 sm:pt-20 lg:pt-24">
        <Container>
          <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Project brief</h2>
              <p className="mt-1 text-sm text-muted">
                A downloadable brief will be available once an approved file is
                published.
              </p>
            </div>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="File coming soon"
              className="inline-flex shrink-0 cursor-not-allowed items-center gap-2 rounded-md border border-border bg-soft-gray px-5 py-3 text-[15px] font-semibold text-muted"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download Project Brief
            </button>
          </div>
        </Container>
      </section>

      <CallToAction
        title="Support This Project"
        description="Partner with us, help sustain this work or reach the project team directly."
        actions={[
          {
            label: "Partner With Us",
            href: "/partner-with-us",
            variant: "navy",
          },
          {
            label: "Support This Project",
            href: "/donate",
            variant: "gold",
          },
          {
            label: "Contact the Project Team",
            href: "/contact",
            variant: "outlineDark",
          },
        ]}
      />
    </main>
  );
}
