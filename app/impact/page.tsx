import { ArrowRight } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import StatCard from "@/components/shared/StatCard";
import AppImage from "@/components/shared/AppImage";
import CallToAction from "@/components/shared/CallToAction";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import {
  impactSummaryStats,
  measureCards,
  focusAreaProgress,
  communityStories,
  annualProgress,
  sdgAlignments,
} from "@/data/impact";

export const metadata = createMetadata({
  title: "Our Impact",
  description:
    "We measure our work through documented activities, community feedback, responsible indicators and transparent reporting.",
  path: "/impact",
});

export default function ImpactPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="OUR IMPACT"
        title="Measuring Change Responsibly"
        description="We measure our work through documented activities, community feedback, responsible indicators and transparent reporting."
        breadcrumbs={[{ label: "Impact" }]}
      />

      {/* 1. Impact Statistics — navy band */}
      <section className="bg-navy py-16 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="Impact Statistics"
            title="Figures at a Glance"
            description="A snapshot of our reach, activities and community outcomes."
            tone="light"
            align="center"
          />
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      {/* 2. How We Measure Impact */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Our Approach"
            title="How We Measure Impact"
            description="We ask consistent questions across our programmes to understand reach, quality, outcomes and learning."
          />
          <CardGrid cols={2} as="div" className="mt-10">
            {measureCards.map((card) => (
              <div key={card.title} className={cardGridCellClass}>
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  {card.question}
                </p>
              </div>
            ))}
          </CardGrid>
        </Container>
      </section>

      {/* 3. Impact by Focus Area — progress bars */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Progress by Area"
            title="Impact by Focus Area"
            description="Progress indicators across our main programme areas."
          />
          <ul className="mt-10 space-y-6">
            {focusAreaProgress.map((area) => (
              <li key={area.label}>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-text">
                    {area.label}
                  </span>
                  <span className="text-sm font-medium text-muted">
                    {area.value}%
                  </span>
                </div>
                <div
                  className="mt-2 h-3 w-full overflow-hidden rounded-full bg-soft-gray ring-1 ring-inset ring-border"
                  role="progressbar"
                  aria-label={`${area.label} — sample progress`}
                  aria-valuenow={area.value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuetext={`${area.value}% (sample data)`}
                >
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${area.value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 4. Community Stories */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Community Voices"
            title="Community Stories"
            description="Stories that illustrate the kinds of change we aim to support responsibly."
          />
          <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {communityStories.map((story) => (
              <li
                key={story.title}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <AppImage
                    src={story.image}
                    alt={story.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-[19px] font-semibold leading-snug">
                    {story.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">
                    {story.excerpt}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 5. Annual Progress Timeline */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Year by Year"
            title="Annual Progress Timeline"
            description="Key milestones from recent years of programme delivery and organizational growth."
          />
          <ol className="mt-10 space-y-6 border-l border-border pl-6">
            {annualProgress.map((item) => (
              <li key={item.year} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[31px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-teal ring-4 ring-soft-gray"
                />
                <p className="font-serif text-xl font-semibold text-navy">
                  {item.year}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">
                  {item.milestone}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 6. Sustainable Development Goals */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Global Alignment"
            title="Sustainable Development Goals"
            description="These SDG references are alignment placeholders indicating the goals our work aims to support."
          />
          <CardGrid cols={3} className="mt-10">
            {sdgAlignments.map((goal) => (
              <li key={goal.code} className={`${cardGridCellClass} flex-row items-center gap-4 p-5`}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-teal/10 text-sm font-semibold text-teal-dark">
                  {goal.code.replace("SDG ", "")}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    {goal.code}
                  </p>
                  <p className="mt-0.5 text-[15px] font-semibold leading-snug">
                    {goal.title}
                  </p>
                </div>
              </li>
            ))}
          </CardGrid>
        </Container>
      </section>

      {/* 7. Reports CTA */}
      <CallToAction
        title="Explore Our Reports and Publications"
        description="Read our sample reports, policy briefs and resources to see how we intend to document and share our work transparently."
        actions={[
          {
            label: "View Reports and Publications",
            href: "/reports",
            icon: ArrowRight,
          },
        ]}
      />
    </main>
  );
}
