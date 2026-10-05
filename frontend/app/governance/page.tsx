import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileText,
  Gavel,
  Landmark,
  Lock,
  MessageSquare,
  Scale,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import NoticeBanner from "@/components/shared/NoticeBanner";
import CallToAction from "@/components/shared/CallToAction";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";

export const metadata = createMetadata({
  title: "Governance",
  description:
    "Strong governance helps ensure that HRPF operates responsibly, protects the people it serves and remains accountable to communities, partners and supporters.",
  path: "/governance",
});

interface GovernanceSection {
  title: string;
  icon: ComponentType<LucideProps>;
  paragraph: string;
  notice?: ReactNode;
  link?: { href: string; label: string };
}

const sections: GovernanceSection[] = [
  {
    title: "Legal Registration",
    icon: Landmark,
    paragraph:
      "HRPF operates as an independent nonprofit organization committed to acting within the applicable legal framework of the jurisdiction in which it is established.",
    notice: (
      <>
        Official registration details will be published here once finalized. No
        registration number is displayed until it can be verified.
      </>
    ),
  },
  {
    title: "Governance Structure",
    icon: Building2,
    paragraph:
      "Our governance structure separates strategic oversight from day-to-day management, ensuring that decisions are made responsibly and reviewed independently.",
  },
  {
    title: "Board Responsibilities",
    icon: Users,
    paragraph:
      "The board provides direction, approves strategy and budgets, and holds management accountable for delivering the organization's mission with integrity.",
  },
  {
    title: "Financial Accountability",
    icon: Wallet,
    paragraph:
      "We maintain clear financial controls and record-keeping so that resources are used responsibly and in line with our charitable purpose.",
  },
  {
    title: "Safeguarding",
    icon: ShieldCheck,
    paragraph:
      "We are committed to protecting the people we work with from harm, with particular attention to children and adults in vulnerable situations.",
  },
  {
    title: "Anti-Corruption",
    icon: Scale,
    paragraph:
      "We do not tolerate bribery, fraud or corruption in any form, and we expect the same standards from our partners and representatives.",
  },
  {
    title: "Conflict of Interest",
    icon: ClipboardCheck,
    paragraph:
      "Individuals involved in our work are expected to identify and declare potential conflicts of interest so that decisions remain fair and impartial.",
  },
  {
    title: "Data Protection",
    icon: Lock,
    paragraph:
      "We handle personal and sensitive information carefully, limiting collection and access to what is necessary and appropriate for our work.",
  },
  {
    title: "Complaints Process",
    icon: MessageSquare,
    paragraph:
      "We welcome feedback and take concerns seriously. Our complaints process provides a respectful, confidential route to raise issues about our work.",
    link: { href: "/complaints", label: "Submit a Complaint" },
  },
  {
    title: "Annual Reports",
    icon: FileText,
    paragraph:
      "We aim to report openly on our activities and progress so that communities, partners and supporters can understand and assess our work.",
    link: { href: "/reports", label: "View Annual Reports" },
  },
  {
    title: "Independent Audit",
    icon: Gavel,
    paragraph:
      "Independent review supports confidence in our accountability and helps us continuously strengthen our systems and controls.",
    notice: (
      <>
        Independent audit information will be added here once available. No audit
        results are presented until they have been completed and verified.
      </>
    ),
  },
  {
    title: "Policies and Downloads",
    icon: FileText,
    paragraph:
      "Key policies and governance documents will be made available for download so that our commitments are transparent and easy to reference.",
    link: { href: "/reports", label: "Browse Publications" },
  },
];

export default function GovernancePage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="GOVERNANCE"
        title="Governance, Accountability and Transparency"
        description="Strong governance helps ensure that HRPF operates responsibly, protects the people it serves and remains accountable to communities, partners and supporters."
        breadcrumbs={[{ label: "Governance" }]}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Our Commitments"
            title="How We Stay Accountable"
            description="The principles and safeguards below guide how we operate, make decisions and remain answerable to the communities and partners we serve."
          />

          <CardGrid cols={2} as="div" className="mt-12">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <article key={section.title} className={`${cardGridCellClass} lg:p-7`}>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center bg-navy/5 text-navy">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h2 className="text-xl font-semibold">{section.title}</h2>
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-muted">
                    {section.paragraph}
                  </p>
                  {section.notice && (
                    <div className="mt-4">
                      <NoticeBanner variant="info">
                        {section.notice}
                      </NoticeBanner>
                    </div>
                  )}
                  {section.link && (
                    <Link
                      href={section.link.href}
                      className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-dark transition-colors hover:text-navy"
                    >
                      {section.link.label}
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  )}
                </article>
              );
            })}
          </CardGrid>
        </Container>
      </section>

      <CallToAction
        title="Explore Our Work and Reach Out"
        description="Read our latest publications or contact us with questions about our governance and accountability."
        actions={[
          {
            label: "View Reports and Publications",
            href: "/reports",
            variant: "navy",
            icon: ArrowRight,
          },
          { label: "Contact HRPF", href: "/contact", variant: "outlineDark" },
        ]}
      />
    </main>
  );
}
