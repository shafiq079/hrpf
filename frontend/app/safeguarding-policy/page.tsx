import type { ReactNode } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import Prose from "@/components/shared/Prose";

export const metadata = createMetadata({
  title: "Safeguarding Policy",
  description:
    "Our commitment to protecting the people we work with from harm, and the general standards, reporting routes and safeguards that support it.",
  path: "/safeguarding-policy",
});

/** Convert a section title into a stable, URL-safe anchor id. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface PolicySection {
  title: string;
  body: ReactNode;
}

const sections: PolicySection[] = [
  {
    title: "Commitment",
    body: (
      <p>
        The Human Rights Protection Foundation is committed to protecting the
        safety, dignity and wellbeing of everyone who comes into contact with our
        work, with particular attention to children and adults in vulnerable
        situations. We do not tolerate abuse, exploitation or harm of any kind.
      </p>
    ),
  },
  {
    title: "Scope",
    body: (
      <p>
        This policy applies to all staff, volunteers, board members, partners and
        representatives acting on behalf of the organisation. It covers conduct in
        the course of our activities, whether in person, online or through
        third-party arrangements.
      </p>
    ),
  },
  {
    title: "Expected Conduct",
    body: (
      <>
        <p>
          Everyone associated with our work is expected to treat others with
          respect, act with integrity, and avoid any behaviour that could cause
          harm or place someone at risk. This includes maintaining appropriate
          boundaries and following relevant guidance and procedures.
        </p>
        <p>
          Conduct that exploits a position of trust, or that endangers the safety
          or dignity of another person, is strictly prohibited.
        </p>
      </>
    ),
  },
  {
    title: "Reporting Concerns",
    body: (
      <p>
        If you have a concern about the safety or conduct of anyone connected to
        our work, please raise it promptly. You can{" "}
        <Link href="/complaints">submit a complaint</Link> or{" "}
        <Link href="/file-a-complaint">report a violation</Link> using our
        dedicated channels. You can also <Link href="/contact">contact us</Link>{" "}
        or email <a href="mailto:info@hrpf.org">info@hrpf.org</a> (placeholder
        address). Concerns should be reported even if you are unsure, so they can
        be assessed appropriately.
      </p>
    ),
  },
  {
    title: "Confidentiality",
    body: (
      <p>
        We handle reports sensitively and share information only with those who
        need it to assess and respond to a concern, or where disclosure is
        required to protect someone from harm or to comply with the law.
      </p>
    ),
  },
  {
    title: "Response Process",
    body: (
      <p>
        Reports are reviewed promptly and taken seriously. Where appropriate, we
        take steps to protect those at risk, investigate the concern fairly, and
        act on the outcome, including referral to relevant authorities where
        necessary.
      </p>
    ),
  },
  {
    title: "Protection from Retaliation",
    body: (
      <p>
        No one who raises a genuine concern in good faith should face retaliation.
        We are committed to protecting those who report concerns and will treat
        any form of retaliation as a serious matter.
      </p>
    ),
  },
  {
    title: "Policy Review",
    body: (
      <p>
        This policy is reviewed periodically and updated as needed to reflect good
        practice and our operating context. The review schedule should be
        confirmed before publication.
      </p>
    ),
  },
];

export default function SafeguardingPolicyPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="POLICY"
        title="Safeguarding Policy"
        description="Our commitment to protecting the people we work with from harm, and the general standards and safeguards that support it."
        breadcrumbs={[{ label: "Safeguarding Policy" }]}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
            <aside className="mb-10 lg:mb-0">
              <nav aria-label="On this page" className="lg:sticky lg:top-24">
                <p className="eyebrow text-teal-dark">On this page</p>
                <ul className="mt-4 space-y-1 border-l border-border">
                  {sections.map((section) => (
                    <li key={section.title}>
                      <a
                        href={`#${slugify(section.title)}`}
                        className="-ml-px block border-l-2 border-transparent py-1 pl-4 text-sm text-muted transition-colors hover:border-teal hover:text-teal-dark"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="max-w-3xl">
              <p className="text-sm font-medium text-muted">
                Last updated: [placeholder — update before publication]
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  disabled
                  title="File coming soon"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-navy/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Download PDF
                </button>
              </div>

              <Prose className="mt-8">
                <p>
                  This Safeguarding Policy summarises, in general terms, how the
                  Human Rights Protection Foundation works to protect people from
                  harm and how concerns can be raised and handled. It is a
                  plain-language overview and not a substitute for professional
                  guidance.
                </p>

                {sections.map((section) => (
                  <div key={section.title}>
                    <h2 id={slugify(section.title)}>{section.title}</h2>
                    {section.body}
                  </div>
                ))}
              </Prose>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
