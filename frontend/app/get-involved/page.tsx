import {
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  UserCheck,
} from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import EmptyState from "@/components/shared/EmptyState";
import TestimonialCard from "@/components/shared/TestimonialCard";
import Accordion from "@/components/shared/Accordion";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import { opportunities, exampleVacancies } from "@/data/opportunities";
import { faqGroups } from "@/data/faqs";
import PrimaryButton from "@/components/shared/PrimaryButton";

export const metadata = createMetadata({
  title: "Get Involved",
  description:
    "There are many ways to contribute your time, experience and voice to the protection of human dignity. Become a member, join a campaign or explore opportunities to support HRPF's work.",
  path: "/get-involved",
});

const responsibilities = [
  "Represent HRPF respectfully and act in line with its values and code of conduct.",
  "Handle any sensitive information carefully and maintain confidentiality.",
  "Communicate honestly and avoid making promises on behalf of the organization.",
  "Follow safeguarding guidance and prioritize the safety of communities.",
  "Complete agreed tasks reliably and within reasonable timeframes.",
];

const eligibility = [
  "Commitment to human dignity, equality and non-discrimination.",
  "Willingness to follow HRPF policies, including safeguarding and confidentiality.",
  "Reliability and respectful communication with communities and colleagues.",
  "Relevant skills or interest for the chosen area (some roles welcome newcomers).",
  "Availability that matches the requirements of the selected opportunity.",
];

const applicationSteps = [
  {
    title: "Apply",
    description:
      "Use the membership application link or contact HRPF about a specific opportunity.",
    icon: FileText,
  },
  {
    title: "Review",
    description:
      "The HRPF team reviews applications against current needs and role requirements.",
    icon: ClipboardCheck,
  },
  {
    title: "Orientation",
    description:
      "Shortlisted volunteers receive an introduction to HRPF's values, policies and expectations.",
    icon: Compass,
  },
  {
    title: "Placement",
    description:
      "Volunteers are matched to a suitable activity, campaign or support role.",
    icon: UserCheck,
  },
];

const testimonials = [
  {
    quote:
      "Volunteering with HRPF helped me understand how everyday awareness work protects people's dignity.",
    name: "Sample Volunteer",
    role: "Awareness Campaigns (sample quote)",
  },
  {
    quote:
      "The orientation was clear and respectful, and I always knew how my contribution was being used.",
    name: "Sample Volunteer",
    role: "Community Activities (sample quote)",
  },
  {
    quote:
      "As a researcher, I valued being able to offer professional skills to a cause that matters.",
    name: "Sample Volunteer",
    role: "Research (sample quote)",
  },
];

const volunteeringFaqs =
  faqGroups.find((group) => group.category === "Volunteering")?.items ?? [];

export default function GetInvolvedPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="GET INVOLVED"
        title="Take Action With HRPF"
        description="There are many ways to contribute your time, experience and voice to the protection of human dignity."
        breadcrumbs={[{ label: "Get Involved" }]}
      />

      {/* Opportunity cards */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Ways to Contribute"
            title="Opportunities to Get Involved"
            description="Choose the path that best fits your time, skills and interests."
          />
          <CardGrid cols={3} className="mt-12">
            {opportunities.map((opportunity) => {
              const Icon = opportunity.icon;
              return (
                <li key={opportunity.title} className={cardGridCellClass}>
                  <span className="inline-flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">
                    {opportunity.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {opportunity.description}
                  </p>
                </li>
              );
            })}
          </CardGrid>
        </Container>
      </section>

      {/* Why volunteer */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Why Volunteer"
                title="Why Volunteer With HRPF"
              />
              <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-base">
                Volunteers are central to HRPF&rsquo;s work. They help communities
                access information, support responsible awareness activities and
                strengthen the everyday protection of human dignity.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                Giving your time is also a way to develop new skills, meet people
                who share your values and contribute to lasting, positive change
                in your community.
              </p>
            </div>

            {/* Responsibilities & Eligibility */}
            <div className="grid grid-cols-1 gap-6">
              <div className="rounded-lg border border-border bg-white p-6 lg:p-8">
                <h3 className="text-lg font-semibold">
                  Volunteer responsibilities
                </h3>
                <ul className="mt-4 space-y-3">
                  {responsibilities.map((item) => (
                    <li key={item} className="flex items-start gap-3">
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
              <div className="rounded-lg border border-border bg-white p-6 lg:p-8">
                <h3 className="text-lg font-semibold">Eligibility</h3>
                <ul className="mt-4 space-y-3">
                  {eligibility.map((item) => (
                    <li key={item} className="flex items-start gap-3">
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
            </div>
          </div>
        </Container>
      </section>

      {/* Application process */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="How to Join"
            title="Application Process"
            description="A simple, respectful process from application to placement."
          />
          <CardGrid cols={4} as="ol" className="mt-12">
            {applicationSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className={cardGridCellClass}>
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-11 w-11 items-center justify-center bg-navy font-serif text-lg font-semibold text-white"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <Icon
                      className="h-5 w-5 text-teal-dark"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {step.description}
                  </p>
                </li>
              );
            })}
          </CardGrid>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Voices"
            title="Volunteer Testimonials"
            description="Hear from people who have volunteered with HRPF."
          />
          <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <li key={testimonial.quote}>
                <TestimonialCard
                  quote={testimonial.quote}
                  name={testimonial.name}
                  role={testimonial.role}
                />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Current opportunities */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Openings"
            title="Current Opportunities"
            description="Published volunteer openings will appear here when available."
          />
          <div className="mt-10">
            {exampleVacancies.length === 0 ? (
              <EmptyState
                title="No current openings"
                description="There are no published volunteer openings right now. Please check back soon or submit a general application below."
              />
            ) : (
              <CardGrid cols={2} className="mt-0">
                {exampleVacancies.map((vacancy) => (
                  <li key={vacancy.title} className={cardGridCellClass}>
                    <h3 className="text-lg font-semibold">{vacancy.title}</h3>
                    <p className="mt-1 text-sm font-medium text-teal-dark">
                      {vacancy.type} · {vacancy.location}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {vacancy.summary}
                    </p>
                  </li>
                ))}
              </CardGrid>
            )}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Questions"
            title="Volunteering FAQ"
            description="Answers to common questions about volunteering with HRPF."
          />
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion
              items={volunteeringFaqs.map((item) => ({
                title: item.question,
                content: <p>{item.answer}</p>,
              }))}
            />
          </div>
        </Container>
      </section>

      {/* Application form */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-2xl">
            <SectionHeading
              eyebrow="Apply"
              title="Become a Member"
              description="Apply for HRPF membership through the Foundation’s existing Google Form."
            />
            <div className="mt-8 rounded-lg border border-border bg-white p-6 sm:p-8">
              <PrimaryButton href="/become-a-member">Open Membership Application</PrimaryButton>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
