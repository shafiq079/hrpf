import { ArrowRight, Check } from "lucide-react";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import PrimaryButton from "@/components/shared/PrimaryButton";
import CallToAction from "@/components/shared/CallToAction";
import StatCard from "@/components/shared/StatCard";
import ResourceCard from "@/components/shared/ResourceCard";
import AppImage from "@/components/shared/AppImage";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import { createMetadata } from "@/lib/seo";
import { focusAreas } from "@/data/focusAreas";
import { getProject } from "@/data/projects";
import { impactSummaryStats } from "@/data/impact";
import { reports } from "@/data/reports";

export const metadata = createMetadata({
  title: "Our Areas of Work",
  description:
    "We focus on areas where legal protection, awareness, research and community participation can help reduce vulnerability and strengthen access to rights.",
  path: "/our-work",
});

const featuredReport = reports[0];

export default function OurWorkPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="OUR WORK"
        title="Our Areas of Work"
        description="We focus on areas where legal protection, awareness, research and community participation can help reduce vulnerability and strengthen access to rights."
        breadcrumbs={[{ label: "Our Work" }]}
      />

      {focusAreas.map((area, index) => {
        const Icon = area.icon;
        const imageRight = index % 2 === 1;
        const relatedProject = area.relatedProjectSlug
          ? getProject(area.relatedProjectSlug)
          : undefined;

        return (
          <section
            key={area.slug}
            className={`py-16 sm:py-20 lg:py-24 ${
              imageRight ? "bg-soft-gray" : "bg-off-white"
            }`}
          >
            <Container>
              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
                <div
                  className={`relative aspect-[16/11] overflow-hidden rounded-lg border border-border ${
                    imageRight ? "lg:order-2" : ""
                  }`}
                >
                  <AppImage
                    src={area.image}
                    alt={area.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className={imageRight ? "lg:order-1" : ""}>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-teal/10 text-teal-dark">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-[26px] leading-tight sm:text-[30px]">
                    {area.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted sm:text-base">
                    {area.description}
                  </p>

                  <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {area.activities.slice(0, 4).map((activity) => (
                      <li
                        key={activity}
                        className="flex items-start gap-2 text-sm text-text"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-teal-dark"
                          aria-hidden="true"
                        />
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>

                  {relatedProject && (
                    <div className="mt-6 rounded-lg border border-border bg-white p-5">
                      <p className="eyebrow">Related Project</p>
                      <h3 className="mt-1 text-lg font-semibold leading-snug">
                        {relatedProject.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {relatedProject.summary}
                      </p>
                      <PrimaryButton
                        href={relatedProject.href}
                        variant="outline"
                        size="md"
                        icon={ArrowRight}
                        className="mt-4"
                      >
                        View Project
                      </PrimaryButton>
                    </div>
                  )}

                  <div className="mt-6">
                    <PrimaryButton
                      href={`/our-work/${area.slug}`}
                      variant="navy"
                      size="lg"
                      icon={ArrowRight}
                    >
                      Learn More
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        );
      })}

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <CardGrid cols={2} as="div" className="mt-0">
            <div className={`${cardGridCellClass} p-8`}>
              <SectionHeading
                as="h2"
                eyebrow="Our Approach"
                title="How We Select Priorities"
              />
              <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                We choose where to focus by weighing the level of need in a
                community, the feasibility of delivering safe and responsible
                support, and alignment with core human-rights principles. This
                keeps our work grounded, practical and centred on the people
                most at risk of being left behind.
              </p>
            </div>
            <div className={`${cardGridCellClass} p-8`}>
              <SectionHeading
                as="h2"
                eyebrow="Our Approach"
                title="How We Work With Communities"
              />
              <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                We begin by listening. We consult community members about their
                own priorities, then collaborate on activities that respect
                local knowledge, dignity and consent. Communities are partners
                in every stage, not passive recipients of assistance.
              </p>
            </div>
          </CardGrid>
        </Container>
      </section>

      <section className="bg-navy py-16 lg:py-20">
        <Container>
          <SectionHeading
            align="center"
            tone="light"
            eyebrow="Our Reach"
            title="Progress Across Our Work"
            description="A snapshot of the scale of our combined activities."
          />
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {impactSummaryStats.map((stat) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                tone="light"
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Featured Report"
            title="Learn More About Our Work"
            description="Explore a recent publication drawing on activities across our focus areas."
          />
          <div className="mt-10 max-w-xl">
            <ResourceCard resource={featuredReport} />
          </div>
        </Container>
      </section>

      <CallToAction
        title="Partner With Us to Strengthen Protection"
        description="Whether you represent an institution, a community or a funder, together we can extend legal protection, awareness and access to rights."
        actions={[
          { label: "Partner With Us", href: "/partner-with-us", variant: "navy" },
          {
            label: "Get Involved",
            href: "/get-involved",
            variant: "outlineDark",
          },
        ]}
      />
    </main>
  );
}
