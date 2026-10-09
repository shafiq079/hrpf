import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import Accordion from "@/components/shared/Accordion";
import CallToAction from "@/components/shared/CallToAction";
import NoticeBanner from "@/components/shared/NoticeBanner";
import { createMetadata } from "@/lib/seo";
import { faqGroups } from "@/data/faqs";
import { ArrowRight, HandHelping } from "lucide-react";

export const metadata = createMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about HRPF, complaints, contact, membership, donations, projects, newsletter updates and privacy. This is general information, not legal advice.",
  path: "/faq",
});

/** Build a stable, URL-safe anchor id from a category label. */
function toAnchor(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function FaqPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="HELP & FAQ"
        title="Frequently Asked Questions"
        description="Answers to common questions about HRPF, complaints, contact, membership, donations, projects, newsletter updates and privacy. This is general information, not legal advice."
        breadcrumbs={[{ label: "FAQ" }]}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-12">
            {/* In-page category navigation (desktop only). */}
            <nav
              className="hidden lg:block"
              aria-label="FAQ categories"
            >
              <div className="sticky top-24">
                <p className="eyebrow">On this page</p>
                <ul className="mt-3 space-y-2 border-l border-border">
                  {faqGroups.map((group) => (
                    <li key={group.category}>
                      <a
                        href={`#${toAnchor(group.category)}`}
                        className="-ml-px block border-l-2 border-transparent py-1 pl-4 text-sm text-muted transition-colors hover:border-teal hover:text-teal-dark"
                      >
                        {group.category}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <div>
              <NoticeBanner variant="info" title="General information only">
                These answers provide general guidance and do not constitute
                legal advice. For advice about a specific situation, please
                contact a qualified professional or reach out to HRPF directly.
              </NoticeBanner>

              <div className="mt-10 space-y-12">
                {faqGroups.map((group) => (
                  <div
                    key={group.category}
                    id={toAnchor(group.category)}
                    className="scroll-mt-24"
                  >
                    <SectionHeading as="h2" title={group.category} />
                    <div className="mt-6">
                      <Accordion
                        items={group.items.map((item) => ({
                          title: item.question,
                          content: item.answer,
                        }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CallToAction
        title="Still have questions?"
        description="If you could not find what you were looking for, our team is happy to help or point you to the right support."
        actions={[
          { label: "Contact Us", href: "/contact", icon: ArrowRight },
          {
            label: "Contact HRPF",
            href: "/contact",
            variant: "outlineDark",
            icon: HandHelping,
            iconPosition: "left",
          },
        ]}
      />
    </main>
  );
}
