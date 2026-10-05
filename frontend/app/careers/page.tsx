import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  ArrowRight,
  Eye,
  Gavel,
  Heart,
  Scale,
  Shield,
  Users,
} from "lucide-react";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import EmptyState from "@/components/shared/EmptyState";
import PrimaryButton from "@/components/shared/PrimaryButton";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import { createMetadata } from "@/lib/seo";
import { exampleVacancies } from "@/data/opportunities";
import JobAlertsForm from "./JobAlertsForm";

export const metadata = createMetadata({
  title: "Careers",
  description:
    "Explore opportunities to contribute to responsible human-rights protection at HRPF, including vacancies, internships, consultancies and volunteer roles.",
  path: "/careers",
});

interface ValueTheme {
  title: string;
  description: string;
  icon: ComponentType<LucideProps>;
}

const values: ValueTheme[] = [
  {
    title: "Human Dignity",
    description:
      "We treat every person with respect and uphold their inherent worth.",
    icon: Heart,
  },
  {
    title: "Equality",
    description:
      "We work toward fair treatment and equal opportunity for all people.",
    icon: Scale,
  },
  {
    title: "Justice",
    description:
      "We support fair processes and access to appropriate remedies and support.",
    icon: Gavel,
  },
  {
    title: "Accountability",
    description:
      "We take responsibility for our decisions, conduct and use of resources.",
    icon: Shield,
  },
  {
    title: "Transparency",
    description:
      "We communicate openly and honestly about our work and how it is done.",
    icon: Eye,
  },
  {
    title: "Inclusion",
    description:
      "We welcome diverse perspectives and build a respectful, participatory culture.",
    icon: Users,
  },
];

const recruitmentSteps = [
  {
    title: "Application",
    description:
      "Submit your application and supporting documents for the role you are interested in.",
  },
  {
    title: "Shortlisting",
    description:
      "Applications are reviewed against the role requirements and shortlisted fairly.",
  },
  {
    title: "Interview",
    description:
      "Shortlisted candidates are invited to discuss their experience and motivation.",
  },
  {
    title: "Offer",
    description:
      "A suitable candidate receives an offer outlining the role, terms and expectations.",
  },
  {
    title: "Onboarding",
    description:
      "New team members are welcomed and supported to settle into their role.",
  },
];

export default function CareersPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="CAREERS"
        title="Build a Career With Purpose"
        description="Explore opportunities to contribute to responsible human-rights protection."
        breadcrumbs={[{ label: "Careers" }]}
      />

      {/* Working at HRPF */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-3xl">
            <SectionHeading
              as="h2"
              title="Working at HRPF"
              description="A mission-driven environment where your work contributes to dignity, protection and access to support."
            />
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted sm:text-base">
              <p>
                At HRPF, people are at the centre of everything we do. Our team
                brings together programme, research, legal, communications and
                operations expertise to advance responsible human-rights
                protection.
              </p>
              <p>
                We value integrity, collaboration and a commitment to learning.
                Colleagues are encouraged to grow their skills, share ideas and
                work with care for the communities we serve.
              </p>
              <p>
                Whether through a formal role, an internship or a volunteer
                contribution, there are many ways to bring your talents to this
                work.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Organizational Values */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            title="Organizational Values"
            description="The shared principles that guide how we work and treat one another."
          />
          <CardGrid cols={3} className="mt-10">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <li key={value.title} className={cardGridCellClass}>
                  <span className="flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[17px] font-semibold">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">
                    {value.description}
                  </p>
                </li>
              );
            })}
          </CardGrid>
        </Container>
      </section>

      {/* Current Vacancies */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            title="Current Vacancies"
            description="Open roles are published here as they become available."
          />
          <div className="mt-8">
            {exampleVacancies.length === 0 ? (
              <EmptyState
                title="No current vacancies"
                description="There are currently no published vacancies."
              />
            ) : (
              <CardGrid cols={2} className="mt-0">
                {exampleVacancies.map((vacancy) => (
                  <li key={vacancy.title} className={cardGridCellClass}>
                    <span className="eyebrow text-teal-dark">
                      Example Position
                    </span>
                    <h3 className="mt-2 text-[18px] font-semibold">
                      {vacancy.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {vacancy.type} · {vacancy.location}
                    </p>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">
                      {vacancy.summary}
                    </p>
                  </li>
                ))}
              </CardGrid>
            )}
          </div>
        </Container>
      </section>

      {/* Other ways to contribute */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h2 className="text-[22px] font-semibold sm:text-[24px]">
                Internships
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Internships offer practical experience across programmes,
                research, communications and community engagement. Available
                placements are shared through our involvement channels.
              </p>
              <PrimaryButton
                href="/get-involved"
                variant="outline"
                size="md"
                icon={ArrowRight}
                className="mt-5"
              >
                Explore internships
              </PrimaryButton>
            </div>

            <div>
              <h2 className="text-[22px] font-semibold sm:text-[24px]">
                Consultancy Opportunities
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                From time to time we engage consultants for specialist research,
                training or advisory work. Open calls are published here when
                available.
              </p>
              <div className="mt-5">
                <EmptyState title="No open consultancies" />
              </div>
            </div>

            <div>
              <h2 className="text-[22px] font-semibold sm:text-[24px]">
                Volunteer Roles
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Volunteers support awareness, community activities, research and
                operations. Find current volunteer opportunities and apply
                through our involvement page.
              </p>
              <PrimaryButton
                href="/get-involved"
                variant="outline"
                size="md"
                icon={ArrowRight}
                className="mt-5"
              >
                Volunteer with us
              </PrimaryButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Recruitment Process */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            title="Recruitment Process"
            description="A clear, fair process from application through to onboarding."
          />
          <CardGrid cols={5} as="ol" className="mt-10">
            {recruitmentSteps.map((step, index) => (
              <li key={step.title} className={cardGridCellClass}>
                <span className="flex h-9 w-9 items-center justify-center bg-navy text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-[16px] font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </CardGrid>
        </Container>
      </section>

      {/* Equal Opportunity Statement */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="max-w-3xl">
            <SectionHeading as="h2" title="Equal Opportunity Statement" />
            <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
              HRPF is an equal-opportunity organization. We are committed to a
              fair and inclusive recruitment process and do not discriminate on
              the basis of race, ethnicity, religion, gender, disability, age or
              any other protected characteristic. We welcome applications from
              all qualified candidates and make reasonable accommodations to
              support participation in our recruitment process.
            </p>
          </div>
        </Container>
      </section>

      {/* Job Alerts */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                as="h2"
                title="Job Alerts"
                description="Sign up to be notified by email when new opportunities are published."
              />
            </div>
            <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
              <JobAlertsForm />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
