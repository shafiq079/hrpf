import {
  BookOpen,
  Building2,
  ClipboardCheck,
  Coins,
  FileSignature,
  GraduationCap,
  Handshake,
  Megaphone,
  MessageSquare,
  Scale,
  Search,
  Users,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import NoticeBanner from "@/components/shared/NoticeBanner";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import PartnerForm from "./PartnerForm";

export const metadata = createMetadata({
  title: "Partner With Us",
  description:
    "HRPF collaborates with responsible institutions that share our commitment to dignity, equality, transparency and sustainable community impact.",
  path: "/partner-with-us",
});

const targetPartners = [
  "International NGOs",
  "Local NGOs",
  "Donor agencies",
  "Government institutions",
  "Embassies",
  "Universities",
  "Research organizations",
  "Law firms",
  "Media organizations",
  "Companies and CSR departments",
];

interface PartnershipModel {
  title: string;
  description: string;
  icon: ComponentType<LucideProps>;
}

const partnershipModels: PartnershipModel[] = [
  {
    title: "Joint project implementation",
    description:
      "Design and deliver community programmes together, sharing complementary strengths.",
    icon: Handshake,
  },
  {
    title: "Research collaboration",
    description:
      "Conduct responsible research and produce evidence to inform better decisions.",
    icon: BookOpen,
  },
  {
    title: "Programme funding",
    description:
      "Support specific initiatives through transparent, accountable funding.",
    icon: Coins,
  },
  {
    title: "Training and capacity building",
    description:
      "Strengthen skills and institutional capacity through shared learning.",
    icon: GraduationCap,
  },
  {
    title: "Community outreach",
    description:
      "Extend awareness and engagement activities to more communities.",
    icon: Users,
  },
  {
    title: "Legal referral",
    description:
      "Connect people with qualified legal services through trusted networks.",
    icon: Scale,
  },
  {
    title: "Technology support",
    description:
      "Contribute tools, platforms or technical expertise to improve delivery.",
    icon: Wrench,
  },
  {
    title: "Awareness campaigns",
    description:
      "Collaborate on responsible public-awareness and education campaigns.",
    icon: Megaphone,
  },
  {
    title: "Institutional sponsorship",
    description:
      "Provide sustained institutional support aligned with shared values.",
    icon: Building2,
  },
];

interface ProcessStep {
  title: string;
  description: string;
  icon: ComponentType<LucideProps>;
}

const processSteps: ProcessStep[] = [
  {
    title: "Initial Inquiry",
    description:
      "You share an outline of your organization and proposed collaboration.",
    icon: MessageSquare,
  },
  {
    title: "Compatibility Review",
    description:
      "We assess alignment with HRPF's mission, values and current priorities.",
    icon: Search,
  },
  {
    title: "Due Diligence",
    description:
      "We conduct responsible checks appropriate to the nature of the partnership.",
    icon: ClipboardCheck,
  },
  {
    title: "Joint Planning",
    description:
      "We define shared objectives, roles, resources and expected outcomes.",
    icon: Users,
  },
  {
    title: "Agreement",
    description:
      "We formalize the collaboration through a clear, documented agreement.",
    icon: FileSignature,
  },
  {
    title: "Implementation and Reporting",
    description:
      "We deliver the agreed work and report transparently on progress and results.",
    icon: BookOpen,
  },
];

export default function PartnerWithUsPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="PARTNERSHIPS"
        title="Building Stronger Partnerships for Human Rights"
        description="We collaborate with responsible institutions that share our commitment to dignity, equality, transparency and sustainable community impact."
        breadcrumbs={[{ label: "Partner With Us" }]}
      />

      {/* Who we partner with */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Our Network"
            title="Who We Partner With"
            description="HRPF works with a wide range of responsible organizations committed to human dignity and community impact."
          />
          <ul className="mt-10 flex flex-wrap gap-3">
            {targetPartners.map((partner) => (
              <li
                key={partner}
                className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-text"
              >
                {partner}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Partnership models */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="How We Collaborate"
            title="Partnership Models"
            description="Flexible ways to work together, tailored to shared goals and capacity."
          />
          <CardGrid cols={3} className="mt-12">
            {partnershipModels.map((model) => {
              const Icon = model.icon;
              return (
                <li key={model.title} className={cardGridCellClass}>
                  <span className="inline-flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{model.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {model.description}
                  </p>
                </li>
              );
            })}
          </CardGrid>
        </Container>
      </section>

      {/* Partnership process */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="The Process"
            title="Partnership Process"
            description="A responsible, transparent path from first inquiry to ongoing reporting."
          />
          <CardGrid cols={3} as="ol" className="mt-12">
            {processSteps.map((step, index) => {
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

      {/* Trust & due diligence + form */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <NoticeBanner
                variant="info"
                title="Trust and due diligence"
              >
                HRPF conducts responsible due diligence before entering
                partnerships. This helps ensure that every collaboration is
                consistent with our values, protects the communities we serve
                and upholds transparency and accountability.
              </NoticeBanner>
            </div>

            <SectionHeading
              eyebrow="Start a Conversation"
              title="Partnership Inquiry"
              description="Tell us about your organization and how you would like to collaborate."
            />
            <div className="mt-8 rounded-lg border border-border bg-white p-6 sm:p-8">
              <PartnerForm />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
