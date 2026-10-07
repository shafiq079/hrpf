import type { ReactNode } from "react";
import Link from "@/components/translation/TranslationLink";
import { Download } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import Prose from "@/components/shared/Prose";

export const metadata = createMetadata({
  title: "Terms of Use",
  description:
    "The general terms that apply to your use of the Human Rights Protection Foundation website, which is provided for informational purposes only.",
  path: "/terms-of-use",
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
    title: "Website Use",
    body: (
      <p>
        By accessing or using this website, you agree to these terms. If you do
        not agree, please do not use the site. You agree to use the website
        lawfully and in a way that does not interfere with its operation or the
        experience of other users.
      </p>
    ),
  },
  {
    title: "Informational Purpose",
    body: (
      <p>
        The content on this website is provided for general information and
        awareness only. It may not reflect the most current legal or factual
        developments and should not be relied upon as a substitute for
        professional advice tailored to your situation.
      </p>
    ),
  },
  {
    title: "No Legal Relationship",
    body: (
      <p>
        Using this website, contacting us, or submitting information does not
        create a lawyer-client relationship or any other professional or
        contractual relationship. No content on this site constitutes legal
        advice, and you should consult a qualified professional before acting on
        any information provided here.
      </p>
    ),
  },
  {
    title: "User Submissions",
    body: (
      <p>
        If you submit information through this website, you are responsible for
        ensuring it is accurate and that you have the right to share it. Please
        do not submit confidential or sensitive information through unsecured
        channels unless a form is specifically intended for that purpose.
      </p>
    ),
  },
  {
    title: "Intellectual Property",
    body: (
      <p>
        Unless otherwise stated, the content, design and materials on this
        website are owned by or licensed to the Human Rights Protection
        Foundation and are protected by applicable laws. You may view and share
        content for personal, non-commercial purposes with appropriate
        attribution.
      </p>
    ),
  },
  {
    title: "External Links",
    body: (
      <p>
        This website may link to third-party websites for convenience. We do not
        control and are not responsible for the content, accuracy or practices of
        those external sites, and a link does not imply endorsement.
      </p>
    ),
  },
  {
    title: "Limitation of Liability",
    body: (
      <p>
        To the fullest extent permitted by law, the Human Rights Protection
        Foundation is not liable for any loss or damage arising from your use of,
        or reliance on, this website or its content. The website is provided on
        an &ldquo;as is&rdquo; basis without warranties of any kind.
      </p>
    ),
  },
  {
    title: "Changes to Terms",
    body: (
      <p>
        We may update these terms from time to time. Any changes will be posted
        on this page, and your continued use of the website after changes are
        published constitutes acceptance of the updated terms.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p>
        If you have questions about these terms, please{" "}
        <Link href="/contact">contact us</Link> or email{" "}
        <a href="mailto:info@hrpf.org">info@hrpf.org</a> (placeholder address).
      </p>
    ),
  },
];

export default function TermsOfUsePage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="LEGAL"
        title="Terms of Use"
        description="The general terms that apply to your use of this website, which is provided for informational purposes only."
        breadcrumbs={[{ label: "Terms of Use" }]}
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
                  These Terms of Use set out the general conditions that apply to
                  your use of this website. The site is provided for informational
                  purposes only and does not create a lawyer-client relationship
                  or provide legal advice.
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
