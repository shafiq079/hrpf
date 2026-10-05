import {
  BookOpen,
  Building2,
  ClipboardList,
  FileText,
  Info,
  Scale,
  Users,
  XCircle,
} from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import NoticeBanner from "@/components/shared/NoticeBanner";
import Accordion from "@/components/shared/Accordion";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import { faqGroups } from "@/data/faqs";
import HelpRequestForm from "./HelpRequestForm";

export const metadata = createMetadata({
  title: "Get Help",
  description:
    "HRPF may provide general information, documentation guidance or referral to suitable services depending on the nature of the request and available resources.",
  path: "/get-help",
});

const whoWeSupport = [
  "Individuals seeking general human-rights information.",
  "Community members needing documentation guidance.",
  "People looking for referral to suitable legal or community services.",
  "Groups seeking awareness resources or institutional contacts.",
];

interface AssistanceType {
  title: string;
  description: string;
  icon: ComponentType<LucideProps>;
}

const assistanceTypes: AssistanceType[] = [
  {
    title: "General rights information",
    description:
      "Accessible, general information about rights and relevant processes.",
    icon: Info,
  },
  {
    title: "Documentation guidance",
    description:
      "Guidance on responsibly recording and organizing relevant information.",
    icon: FileText,
  },
  {
    title: "Legal-service referrals",
    description:
      "Referral to qualified legal services through trusted networks where possible.",
    icon: Scale,
  },
  {
    title: "Community-service referrals",
    description:
      "Referral to appropriate community-based support services.",
    icon: Users,
  },
  {
    title: "Awareness resources",
    description:
      "Educational and awareness materials on human-rights topics.",
    icon: BookOpen,
  },
  {
    title: "Institutional-contact information",
    description:
      "Information about relevant institutions and how to contact them.",
    icon: Building2,
  },
];

const cannotProvide = [
  "HRPF does not guarantee legal representation.",
  "HRPF does not replace emergency services.",
  "HRPF cannot promise a particular case result.",
  "HRPF may be unable to respond to matters outside its mandate.",
];

const informationYouMayNeed = [
  "A clear summary of your situation and what you are seeking.",
  "The type of assistance you think may be most relevant.",
  "Your country or location, so referrals can be more relevant.",
  "A preferred and safe way to be contacted.",
];

const reviewSteps = [
  {
    title: "Received",
    description:
      "Your request is received and acknowledged (on a production site).",
  },
  {
    title: "Assessed",
    description:
      "The request is reviewed against HRPF's mandate and available resources.",
  },
  {
    title: "Responded",
    description:
      "Where possible, HRPF provides information, guidance or a suitable referral.",
  },
];

const requestingHelpFaqs =
  faqGroups.find((group) => group.category === "Requesting Help")?.items ?? [];

export default function GetHelpPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="GET HELP"
        title="Find Information and Support"
        description="HRPF may provide general information, documentation guidance or referral to suitable services depending on the nature of the request and available resources."
        breadcrumbs={[{ label: "Get Help" }]}
        actions={[
          { label: "Request Assistance", href: "#request-assistance" },
        ]}
      />

      {/* Emergency guidance */}
      <section className="bg-off-white pt-16 sm:pt-20 lg:pt-24">
        <Container>
          <NoticeBanner variant="warning" title="In an emergency">
            If someone is in immediate danger, contact your local emergency
            service or a qualified emergency-support organization.
          </NoticeBanner>
        </Container>
      </section>

      {/* Who we may support */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Support"
                title="Who We May Support"
                description="HRPF works with people and communities seeking information, guidance or referral."
              />
            </div>
            <ul className="grid grid-cols-1 gap-3">
              {whoWeSupport.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-lg border border-border bg-white p-4"
                >
                  <Users
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

      {/* Types of assistance */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="What We Offer"
            title="Types of Assistance"
            description="Depending on the request and available resources, HRPF may offer the following."
          />
          <CardGrid cols={3} className="mt-12">
            {assistanceTypes.map((type) => {
              const Icon = type.icon;
              return (
                <li key={type.title} className={cardGridCellClass}>
                  <span className="inline-flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{type.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {type.description}
                  </p>
                </li>
              );
            })}
          </CardGrid>
        </Container>
      </section>

      {/* What we cannot provide */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="Please Note"
              title="What We Cannot Provide"
              description="It is important to be clear about the limits of the support HRPF can offer."
            />
            <div className="mt-8">
              <NoticeBanner
                variant="info"
                title="Limits of HRPF support"
                icon={XCircle}
              >
                <ul className="space-y-2">
                  {cannotProvide.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </NoticeBanner>
            </div>
          </div>
        </Container>
      </section>

      {/* Information you may need + how requests are reviewed */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-teal/10 text-teal-dark">
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-[22px] leading-tight sm:text-[26px]">
                Information You May Need
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Having the following ready can help HRPF respond more helpfully.
              </p>
              <ul className="mt-5 space-y-3">
                {informationYouMayNeed.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Info
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

            <div>
              <SectionHeading
                eyebrow="The Process"
                title="How Requests Are Reviewed"
                description="Requests are reviewed against HRPF's mandate and available resources; not all requests can be supported."
              />
              <ol className="mt-8 space-y-4">
                {reviewSteps.map((step, index) => (
                  <li
                    key={step.title}
                    className="flex items-start gap-4 rounded-lg border border-border bg-white p-5"
                  >
                    <span
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-base font-semibold text-white"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Questions"
            title="Requesting Help FAQ"
            description="Answers to common questions about requesting help from HRPF."
          />
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion
              items={requestingHelpFaqs.map((item) => ({
                title: item.question,
                content: <p>{item.answer}</p>,
              }))}
            />
          </div>
        </Container>
      </section>

      {/* Request assistance form */}
      <section
        id="request-assistance"
        className="scroll-mt-24 bg-soft-gray py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="mx-auto max-w-2xl">
            <SectionHeading
              eyebrow="Request Assistance"
              title="Request Assistance"
              description="Complete the form below to request information, guidance or referral. No data is stored on this demonstration website."
            />
            <div className="mt-8 rounded-lg border border-border bg-white p-6 sm:p-8">
              <HelpRequestForm />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
