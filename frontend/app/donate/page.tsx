import {
  Banknote,
  CreditCard,
  FileText,
  Gift,
  Heart,
  Landmark,
  Lock,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import NoticeBanner from "@/components/shared/NoticeBanner";
import CallToAction from "@/components/shared/CallToAction";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import DonationForm from "./DonationForm";

export const metadata = createMetadata({
  title: "Donate",
  description:
    "Contributions can help support awareness, responsible documentation, community engagement, research and referral programmes at HRPF.",
  path: "/donate",
});

const donationUses = [
  "Public-awareness and rights-education activities",
  "Responsible documentation of human-rights concerns",
  "Community engagement and outreach",
  "Research and evidence-building programmes",
  "Referral and support-coordination services",
];

export default function DonatePage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="SUPPORT OUR WORK"
        title="Support the Protection of Human Dignity"
        description="Contributions can help support awareness, responsible documentation, community engagement, research and referral programmes."
        breadcrumbs={[{ label: "Donate" }]}
      />

      {/* Development payment notice */}
      <section className="bg-off-white pt-16 sm:pt-20 lg:pt-24">
        <Container>
          <NoticeBanner variant="warning" title="Payments are not configured">
            Online payment processing has not yet been configured. Do not enter
            real financial information on this development website.
          </NoticeBanner>
        </Container>
      </section>

      {/* Donation form */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Make a Contribution"
                title="Choose How You Would Like to Give"
                description="Select an amount and, if you wish, a project to support. No payment will be processed on this demonstration website."
              />
              <div className="mt-8 rounded-lg border border-border bg-white p-6 sm:p-8">
                <DonationForm />
              </div>
            </div>

            {/* Where donations may be used */}
            <div>
              <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-teal/10 text-teal-dark">
                  <Heart className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-[22px] leading-tight sm:text-[26px]">
                  Where Donations May Be Used
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  The examples below are illustrative of the kinds of work
                  contributions could support.
                </p>
                <ul className="mt-5 space-y-3">
                  {donationUses.map((use) => (
                    <li key={use} className="flex items-start gap-3">
                      <ShieldCheck
                        className="mt-0.5 h-5 w-5 shrink-0 text-teal-dark"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-relaxed text-text">
                        {use}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Transparency, receipts, privacy, refunds */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="What to Know"
            title="Giving With Confidence"
            description="How HRPF approaches transparency, receipts, privacy and related policies."
          />
          <CardGrid cols={2} as="div" className="mt-12">
            <article className={`${cardGridCellClass} sm:p-8`}>
              <span className="inline-flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">
                Financial transparency
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                HRPF is committed to responsible governance and open reporting.
                You can review our governance safeguards and published reports.
              </p>
              <p className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-teal-dark">
                <Link href="/about" className="hover:underline">
                  About HRPF
                </Link>
                <Link href="/about/progress-reports" className="hover:underline">
                  View Progress Reports
                </Link>
              </p>
            </article>

            <article className={`${cardGridCellClass} sm:p-8`}>
              <span className="inline-flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                <Receipt className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Donation receipts</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Donation receipts will be issued once secure payment processing
                is configured. No receipts can be provided for this
                demonstration website.
              </p>
            </article>

            <article className={`${cardGridCellClass} sm:p-8`}>
              <span className="inline-flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Donor privacy</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Donor information will be handled carefully and used only for
                appropriate purposes. See our privacy policy for details.
              </p>
              <p className="mt-4 text-sm font-semibold text-teal-dark">
                <Link href="/privacy-policy" className="hover:underline">
                  Read the privacy policy
                </Link>
              </p>
            </article>

            <article className={`${cardGridCellClass} sm:p-8`}>
              <span className="inline-flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Refund policy</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A refund policy will apply once online donations are active.
                Placeholder terms are available on the terms-of-use page.
              </p>
              <p className="mt-4 text-sm font-semibold text-teal-dark">
                <Link href="/terms-of-use" className="hover:underline">
                  View terms of use
                </Link>
              </p>
            </article>
          </CardGrid>
        </Container>
      </section>

      {/* Other ways to give */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="More Ways to Support"
            title="Corporate, Bank and In-Kind Giving"
            description="Additional options for supporting HRPF's work responsibly."
          />
          <CardGrid cols={3} as="div" className="mt-12">
            <article className={`${cardGridCellClass} sm:p-8`}>
              <span className="inline-flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                <Landmark className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Corporate giving</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Companies and CSR departments can partner with HRPF to support
                programmes aligned with shared values and community impact.
              </p>
            </article>

            <article className={`${cardGridCellClass} sm:p-8`}>
              <span className="inline-flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                <Banknote className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">
                Bank transfer information
              </h3>
              <div className="mt-3 border border-dashed border-border bg-soft-gray px-4 py-6 text-center">
                <p className="text-sm font-medium text-muted">
                  Bank details to be added
                </p>
              </div>
            </article>

            <article className={`${cardGridCellClass} sm:p-8`}>
              <span className="inline-flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                <Gift className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">In-kind support</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Contributions of goods, services, expertise or facilities can
                also help sustain HRPF&rsquo;s activities.
              </p>
            </article>
          </CardGrid>

          {/* Payment provider placeholder */}
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-white px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft-gray text-muted">
                <CreditCard className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Payment provider</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                Payment provider integration pending.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <CallToAction
        title="Learn More About Our Work and Impact"
        description="Explore how HRPF works, and reach out with any questions about supporting our mission."
        actions={[
          { label: "Read Progress Reports", href: "/about/progress-reports", variant: "navy" },
          { label: "Contact HRPF", href: "/contact", variant: "outlineDark" },
        ]}
      />
    </main>
  );
}
