import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import Prose from "@/components/shared/Prose";
import StatCard from "@/components/shared/StatCard";
import ProjectCard from "@/components/shared/ProjectCard";
import ResourceCard from "@/components/shared/ResourceCard";
import TestimonialCard from "@/components/shared/TestimonialCard";
import Accordion from "@/components/shared/Accordion";
import CallToAction from "@/components/shared/CallToAction";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import { createMetadata } from "@/lib/seo";
import { focusAreas, getFocusArea } from "@/data/focusAreas";
import { getProject } from "@/data/projects";
import { reports } from "@/data/reports";
import WomensRightsView from "@/components/work/WomensRightsView";
import { womensRights } from "@/data/womensRights";

export function generateStaticParams() {
  return focusAreas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = getFocusArea(slug);
  if (!area) return {};
  return createMetadata({
    title: area.title,
    description: slug === "womens-rights" ? womensRights.description : area.description,
    path: `/our-work/${slug}`,
  });
}

export default async function FocusAreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "womens-rights") return <WomensRightsView />;
  const area = getFocusArea(slug);
  if (!area) notFound();

  const relatedProject = area.relatedProjectSlug
    ? getProject(area.relatedProjectSlug)
    : undefined;
  const relatedReports = reports.slice(0, 2);

  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="AREA OF WORK"
        title={area.title}
        description={area.description}
        breadcrumbs={[
          { label: "Our Work", href: "/our-work" },
          { label: area.title },
        ]}
        backgroundImage={area.image}
        imageAlt={area.imageAlt}
        actions={[
          { label: "Request Help", href: "/get-help", variant: "navy" },
          {
            label: "Partner With Us",
            href: "/partner-with-us",
            variant: "outlineDark",
          },
        ]}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <SectionHeading
                as="h2"
                eyebrow="Overview"
                title="Understanding the Issue"
              />
              <Prose className="mt-4">
                <p>{area.overview}</p>
              </Prose>
            </div>
            <div>
              <SectionHeading
                as="h2"
                eyebrow="Why It Matters"
                title="Why the Issue Matters"
              />
              <Prose className="mt-4">
                <p>{area.whyItMatters}</p>
              </Prose>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            eyebrow="Challenges"
            title="Common Challenges"
          />
          <CardGrid cols={3} as="div" className="mt-10">
            {area.challenges.map((challenge) => (
              <div key={challenge} className={cardGridCellClass}>
                <p className="text-[15px] leading-relaxed text-text">
                  {challenge}
                </p>
              </div>
            ))}
          </CardGrid>
        </Container>
      </section>

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            eyebrow="Our Response"
            title="What HRPF Does"
          />
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {area.whatWeDo.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg border border-border bg-white p-4"
              >
                <Check
                  className="mt-0.5 h-5 w-5 shrink-0 text-teal-dark"
                  aria-hidden="true"
                />
                <span className="text-[15px] leading-relaxed text-text">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            eyebrow="Programmes"
            title="Key Programmes"
          />
          <CardGrid cols={2} as="div" className="mt-10">
            {area.programmes.map((programme) => (
              <div key={programme.title} className={cardGridCellClass}>
                <h3 className="text-lg font-semibold leading-snug">
                  {programme.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  {programme.description}
                </p>
              </div>
            ))}
          </CardGrid>
        </Container>
      </section>

      {relatedProject && (
        <section className="bg-off-white py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              as="h2"
              eyebrow="Related Projects"
              title="Projects in This Area"
            />
            <div className="mt-10 max-w-md">
              <ProjectCard project={relatedProject} />
            </div>
          </Container>
        </section>
      )}

      <section className="bg-navy py-16 lg:py-20">
        <Container>
          <SectionHeading
            align="center"
            tone="light"
            eyebrow="Impact Indicators"
            title="Impact Indicators"
            description="Illustrative indicators for this area of work."
          />
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {area.impactIndicators.map((indicator) => (
              <StatCard
                key={indicator.label}
                value={indicator.value}
                label={indicator.label}
                tone="light"
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            eyebrow="Success Story"
            title="Story Preview"
          />
          <div className="mt-8 max-w-2xl">
            <TestimonialCard
              quote="The awareness sessions helped me understand my rights and where to find trusted support when I needed it most."
              name="Community Member"
              role="Programme participant"
            />
          </div>
        </Container>
      </section>

      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            eyebrow="Resources"
            title="Related Reports"
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {relatedReports.map((report) => (
              <ResourceCard key={report.slug} resource={report} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-3xl">
            <SectionHeading
              as="h2"
              eyebrow="FAQ"
              title="Frequently Asked Questions"
            />
            <div className="mt-8">
              <Accordion
                items={area.faqs.map((faq) => ({
                  title: faq.question,
                  content: faq.answer,
                }))}
              />
            </div>
          </div>
        </Container>
      </section>

      <CallToAction
        title={`Help Us Strengthen ${area.title}`}
        description="Request support, partner with us or help sustain this area of work."
        actions={[
          { label: "Request Help", href: "/get-help", variant: "navy" },
          {
            label: "Partner With Us",
            href: "/partner-with-us",
            variant: "outlineDark",
          },
          {
            label: "Support This Area",
            href: "/donate",
            variant: "gold",
          },
        ]}
      />
    </main>
  );
}
