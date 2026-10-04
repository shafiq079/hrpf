import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Eye,
  Gavel,
  Handshake,
  Heart,
  Lock,
  Scale,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import AppImage from "@/components/shared/AppImage";
import PrimaryButton from "@/components/shared/PrimaryButton";
import CallToAction from "@/components/shared/CallToAction";
import TeamCard from "@/components/shared/TeamCard";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import {
  getExecutiveDirector,
  team,
  teamCategories,
  teamCategoryDescriptions,
} from "@/data/team";

export const metadata = createMetadata({
  title: "About Us",
  description:
    "Learn about Human Rights Protection Foundation — our mission, values, approach, and the people and roles behind our human-rights work.",
  path: "/about",
});

interface CoreValue {
  title: string;
  description: string;
  icon: ComponentType<LucideProps>;
}

const coreValues: CoreValue[] = [
  {
    title: "Human Dignity",
    description: "We recognize the inherent worth of every individual.",
    icon: Heart,
  },
  {
    title: "Equality",
    description:
      "We support equal rights and opportunities without discrimination.",
    icon: Scale,
  },
  {
    title: "Justice",
    description: "We work to improve access to fair and responsible systems.",
    icon: Gavel,
  },
  {
    title: "Accountability",
    description:
      "We accept responsibility for our decisions, conduct and use of resources.",
    icon: CheckCircle2,
  },
  {
    title: "Transparency",
    description:
      "We communicate honestly about our work, limitations and results.",
    icon: Eye,
  },
  {
    title: "Inclusion",
    description:
      "We value participation from communities with different experiences and backgrounds.",
    icon: Users,
  },
  {
    title: "Independence",
    description:
      "We aim to make decisions based on human-rights principles rather than political interests.",
    icon: Compass,
  },
  {
    title: "Confidentiality",
    description:
      "We handle sensitive information carefully and share it only where appropriate.",
    icon: Lock,
  },
];

const approachSteps = [
  {
    title: "Listen",
    description:
      "We provide respectful channels through which people and communities can share concerns.",
  },
  {
    title: "Assess",
    description:
      "We review available information and determine the most appropriate responsible response.",
  },
  {
    title: "Support",
    description:
      "We may provide guidance, documentation assistance or referral to suitable services.",
  },
  {
    title: "Advocate",
    description:
      "We use research, education and partnerships to promote lasting institutional improvement.",
  },
];

const timeline = [
  { year: "2015", milestone: "Foundation concept and community consultation" },
  { year: "2017", milestone: "First public awareness activities" },
  {
    year: "2019",
    milestone: "Expansion of volunteer and legal referral network",
  },
  {
    year: "2022",
    milestone: "Introduction of research and digital-awareness programmes",
  },
  {
    year: "2025",
    milestone: "Development of new institutional partnership strategy",
  },
];

const governanceItems = [
  "Legal registration placeholder",
  "Board oversight",
  "Safeguarding commitment",
  "Financial accountability",
  "Complaint process",
  "Annual reporting",
];

export default function AboutPage() {
  const executiveDirector = getExecutiveDirector();
  const featuredPeople = team.filter((member) =>
    [
      "Board of Directors",
      "Executive Leadership",
      "Programme Team",
      "Legal and Referral Team",
      "Research Team",
      "Communications Team",
    ].includes(member.category)
  );

  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="ABOUT US"
        title="Defending Rights Through Action, Advocacy and Community Partnership"
        description="Human Rights Protection Foundation is committed to advancing dignity, justice and equality by supporting vulnerable communities, raising awareness and working with institutions to strengthen the protection of fundamental rights."
        breadcrumbs={[{ label: "About Us" }]}
        actions={[
          {
            label: "Meet Our People",
            href: "#our-people",
            variant: "navy",
            icon: Users,
            iconPosition: "left",
          },
          {
            label: "View Full Team",
            href: "/team",
            variant: "outlineDark",
          },
        ]}
      />

      {/* 1. Who We Are */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
              <AppImage
                src="/images/about/who-we-are.jpg"
                alt="Members and volunteers of the Human Rights Protection Foundation working together in the community."
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="Who We Are"
                title="A Foundation Built Around Human Dignity"
              />
              <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-base">
                Human Rights Protection Foundation is an independent nonprofit
                organization working to promote awareness, provide guidance,
                document human-rights concerns and connect vulnerable
                individuals with appropriate support.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                Our work brings together community members, volunteers, legal
                professionals, researchers and institutional partners. We
                believe sustainable human-rights protection requires both
                immediate support and long-term improvements in policy,
                education and public awareness.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Mission & Vision */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <CardGrid cols={2} as="div" className="mt-0">
            <div className={`${cardGridCellClass} p-8 lg:p-10`}>
              <p className="eyebrow">Our Mission</p>
              <h2 className="mt-3 text-[24px] leading-tight sm:text-[28px]">
                What We Set Out to Do
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-base">
                To protect and promote fundamental human rights through
                advocacy, education, responsible documentation, community
                support and institutional collaboration.
              </p>
            </div>
            <div className={`${cardGridCellClass} p-8 lg:p-10`}>
              <p className="eyebrow">Our Vision</p>
              <h2 className="mt-3 text-[24px] leading-tight sm:text-[28px]">
                The Future We Work Toward
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-base">
                A society in which every person can live safely, participate
                equally and access justice without discrimination.
              </p>
            </div>
          </CardGrid>
        </Container>
      </section>

      {/* 3. Core Values */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="What Guides Us"
            title="Our Core Values"
            description="A shared set of principles that shapes every decision, partnership and programme we undertake."
          />
          <CardGrid cols={4} className="mt-12">
            {coreValues.map((value) => {
              const Icon = value.icon;
              return (
                <li key={value.title} className={cardGridCellClass}>
                  <span className="inline-flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {value.description}
                  </p>
                </li>
              );
            })}
          </CardGrid>
        </Container>
      </section>

      {/* 4. Our Approach */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="How We Work"
            title="Our Approach"
            description="A responsible, step-by-step process that keeps the people we support at the centre of our work."
          />
          <CardGrid cols={4} as="ol" className="mt-12">
            {approachSteps.map((step, index) => (
              <li key={step.title} className={cardGridCellClass}>
                <span
                  className="inline-flex h-11 w-11 items-center justify-center bg-navy font-serif text-lg font-semibold text-white"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </CardGrid>
        </Container>
      </section>

      {/* 5. Organization Timeline */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Our Journey"
            title="Organization Timeline"
            description="Key milestones in the development of the Human Rights Protection Foundation."
          />
          <ol className="mt-10 space-y-8 border-l border-border pl-6 sm:pl-8">
            {timeline.map((item) => (
              <li key={item.year} className="relative">
                <span
                  className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-teal sm:-left-[39px]"
                  aria-hidden="true"
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

      {/* 6. Leadership Message */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_1.6fr] lg:gap-16">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border">
                <AppImage
                  src={
                    executiveDirector?.image ??
                    "/images/team/executive-director.jpg"
                  }
                  alt={
                    executiveDirector
                      ? `Portrait of ${executiveDirector.name}, ${executiveDirector.position}.`
                      : "Portrait of the Executive Director of the Human Rights Protection Foundation."
                  }
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-4 text-lg font-semibold text-navy">
                {executiveDirector?.name ?? "Elena Vasquez"}
              </p>
              <p className="text-sm font-medium text-teal-dark">
                {executiveDirector?.position ?? "Executive Director"}
              </p>
            </div>
            <div>
              <SectionHeading
                eyebrow="Leadership"
                title="A Message from Our Leadership"
              />
              <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-base">
                Human rights are protected most effectively when institutions
                and communities work together. Our responsibility is not only to
                respond to individual concerns, but also to strengthen
                awareness, accountability and access to justice for future
                generations.
              </p>
              {executiveDirector?.roleDescription && (
                <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                  {executiveDirector.roleDescription}
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* 7. Our People & Their Roles */}
      <section
        id="our-people"
        className="scroll-mt-24 bg-off-white py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <SectionHeading
            eyebrow="Our People"
            title="People and Roles Behind the Mission"
            description="HRPF brings together board members, programme staff, legal-referral coordinators, researchers, communicators, advisors and volunteers. Each role has a clear responsibility in protecting dignity and supporting communities."
          />

          {/* Role categories overview */}
          <div className="mt-12">
            <h3 className="font-serif text-xl font-semibold text-navy sm:text-2xl">
              How Our Teams Work Together
            </h3>
            <CardGrid cols={4} className="mt-6">
              {teamCategories.map((category) => (
                <li key={category} className={`${cardGridCellClass} p-5`}>
                  <p className="text-sm font-semibold text-navy">{category}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {teamCategoryDescriptions[category]}
                  </p>
                </li>
              ))}
            </CardGrid>
          </div>

          {/* Featured people with detailed role responsibilities */}
          <div className="mt-16">
            <h3 className="font-serif text-xl font-semibold text-navy sm:text-2xl">
              Key Roles and Responsibilities
            </h3>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
              Each profile below explains who the person is, what their role
              involves, and the day-to-day responsibilities that support HRPF&rsquo;s
              work.
            </p>
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPeople.map((member) => (
                <li key={`${member.category}-${member.position}-${member.name}`}>
                  <TeamCard member={member} showResponsibilities />
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton href="/team" variant="navy" icon={ArrowRight}>
              View Full Team Directory
            </PrimaryButton>
            <PrimaryButton href="/get-involved" variant="outline">
              Join Our Work
            </PrimaryButton>
          </div>
        </Container>
      </section>

      {/* 8. Governance Preview */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Accountability"
                title="Governance and Transparency"
                description="We are committed to responsible governance and open reporting. Explore the safeguards that guide our work."
              />
              <div className="mt-7">
                <PrimaryButton
                  href="/governance"
                  variant="navy"
                  icon={ArrowRight}
                >
                  View Governance and Transparency
                </PrimaryButton>
              </div>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {governanceItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-lg border border-border bg-white p-4"
                >
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-teal-dark"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed text-text">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* 9. Final CTA */}
      <CallToAction
        title="Work With Us to Protect Human Dignity"
        actions={[
          {
            label: "Partner With Us",
            href: "/partner-with-us",
            variant: "navy",
            icon: Handshake,
          },
          {
            label: "Get Involved",
            href: "/get-involved",
            variant: "outlineDark",
          },
          { label: "Contact HRPF", href: "/contact", variant: "outlineDark" },
        ]}
      />
    </main>
  );
}
