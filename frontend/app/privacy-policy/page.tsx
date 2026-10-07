import type { ReactNode } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import Prose from "@/components/shared/Prose";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "How the Human Rights Protection Foundation approaches the collection, use, sharing and protection of personal information through this website.",
  path: "/privacy-policy",
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
    title: "Information We Collect",
    body: (
      <>
        <p>
          We may collect information that you choose to provide to us, such as
          your name, email address or the contents of a message when you contact
          us, subscribe to updates or complete a form on this website.
        </p>
        <p>
          We may also collect limited technical information automatically, such
          as general usage data that helps us understand how the site is used and
          how it can be improved. This placeholder text should be reviewed and
          adjusted to reflect the data actually collected in practice.
        </p>
      </>
    ),
  },
  {
    title: "How Information Is Used",
    body: (
      <>
        <p>
          Information is used to respond to enquiries, to provide the services
          and updates you request, and to maintain and improve the website. We
          aim to use information only for the purposes for which it was provided.
        </p>
        <p>
          We do not use personal information to make automated decisions that
          significantly affect individuals, and we do not sell personal
          information to third parties.
        </p>
      </>
    ),
  },
  {
    title: "Sensitive Information",
    body: (
      <>
        <p>
          Some enquiries may involve sensitive personal information, for example
          details relating to a human rights concern. We treat such information
          with particular care and limit access to those who need it to respond
          appropriately.
        </p>
        <p>
          Please share only the information necessary for us to assist you, and
          avoid including highly sensitive details in unsecured communications
          where possible.
        </p>
      </>
    ),
  },
  {
    title: "Complaint Submissions",
    body: (
      <>
        <p>
          When you file a complaint, we collect your name, father’s name, CNIC
          number and picture, contact details, address, complaint and any previous
          proceedings or decision documents you submit. Authorised HRPF
          administrators and case reviewers can access the complaint and its
          private files. The CNIC number is encrypted in our complaint database.
        </p>
        <p>
          With the consent you give on the form, a complete copy of your submitted
          details and uploaded files is emailed to your entered email address and
          HRPF’s designated administrators. These copies contain sensitive identity
          information. Check your email address carefully before submitting.
          Website storage, file scanning, verification and email providers process
          the information needed to operate this service.
        </p>
      </>
    ),
  },
  {
    title: "Data Sharing",
    body: (
      <p>
        We do not share personal information except where it is necessary to
        deliver a service you have requested, where we are required to do so by
        law, or where you have given your consent. Any partners or service
        providers who process information on our behalf are expected to protect
        it appropriately.
      </p>
    ),
  },
  {
    title: "Data Retention",
    body: (
      <p>
        We aim to keep personal information only for as long as it is needed for
        the purpose for which it was collected, or as required to meet legal or
        operational obligations, after which it is securely deleted or
        anonymised. Specific retention periods should be confirmed before
        publication.
      </p>
    ),
  },
  {
    title: "Security",
    body: (
      <p>
        We take reasonable organisational and technical measures to protect
        personal information against loss, misuse and unauthorised access.
        However, no method of transmission or storage is completely secure, and
        we cannot guarantee absolute security.
      </p>
    ),
  },
  {
    title: "User Rights",
    body: (
      <p>
        Depending on your location, you may have rights to access, correct or
        request deletion of your personal information, as well as to object to or
        restrict certain processing. To exercise any of these rights, please
        contact us using the details in the Contact section below.
      </p>
    ),
  },
  {
    title: "Cookies",
    body: (
      <p>
        This website may use cookies or similar technologies to support basic
        functionality and to understand general usage. You can usually control
        cookies through your browser settings. A detailed cookie notice should be
        added here before publication.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p>
        If you have questions about this policy or how your information is
        handled, please <Link href="/contact">contact us</Link> or email{" "}
        <a href="mailto:info@hrpf.org">info@hrpf.org</a> (placeholder address).
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="LEGAL"
        title="Privacy Policy"
        description="How we approach the collection, use, sharing and protection of personal information provided through this website."
        breadcrumbs={[{ label: "Privacy Policy" }]}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
            <aside className="mb-10 lg:mb-0">
              <nav
                aria-label="On this page"
                className="lg:sticky lg:top-24"
              >
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
                  This Privacy Policy explains, in general terms, how the Human
                  Rights Protection Foundation approaches personal information
                  provided through this website. It is intended as a plain-language
                  overview and does not constitute legal advice.
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
