import type { ReactNode } from "react";
import Link from "@/components/translation/TranslationLink";
import { Download } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import Prose from "@/components/shared/Prose";

export const metadata = createMetadata({
  title: "Accessibility",
  description:
    "Our commitment to making this website usable for as many people as possible, and how to tell us when something is not working for you.",
  path: "/accessibility",
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
    title: "Accessibility Commitment",
    body: (
      <p>
        The Human Rights Protection Foundation is committed to making this website
        usable for as many people as possible, including people who rely on
        assistive technologies. Accessibility is an ongoing effort, and we work to
        improve the experience over time.
      </p>
    ),
  },
  {
    title: "Standards",
    body: (
      <p>
        We aim to align this website with the Web Content Accessibility Guidelines
        (WCAG) 2.1 at the AA level as a general benchmark for good practice. Not
        every part of the site may fully meet these criteria yet, and we welcome
        feedback that helps us prioritise improvements.
      </p>
    ),
  },
  {
    title: "Keyboard Access",
    body: (
      <p>
        We aim to ensure that interactive elements such as links, buttons and
        forms can be reached and operated using a keyboard alone, with a visible
        focus indicator to show which element is currently selected.
      </p>
    ),
  },
  {
    title: "Screen Readers",
    body: (
      <p>
        We use meaningful headings, descriptive link text and alternative text for
        images where appropriate, so that content is understandable when read
        aloud by screen readers and other assistive technologies.
      </p>
    ),
  },
  {
    title: "Text and Contrast",
    body: (
      <p>
        We aim to provide readable text with sufficient colour contrast, and to
        avoid relying on colour alone to convey meaning. Text should remain
        legible when resized by the browser.
      </p>
    ),
  },
  {
    title: "Forms",
    body: (
      <p>
        Forms on this site aim to include clear labels, helpful instructions and
        understandable error messages, so they can be completed with or without
        assistive technology.
      </p>
    ),
  },
  {
    title: "Media",
    body: (
      <p>
        Where we publish images, audio or video, we aim to provide suitable text
        alternatives, captions or descriptions so that the content is accessible
        to people who cannot see or hear the media.
      </p>
    ),
  },
  {
    title: "Reporting Accessibility Problems",
    body: (
      <p>
        If you encounter an accessibility barrier on this website, please tell us
        so we can address it. You can <Link href="/contact">contact us</Link> or
        email <a href="mailto:info@hrpf.org">info@hrpf.org</a> (placeholder
        address), describing the problem and the page where it occurred.
      </p>
    ),
  },
];

export default function AccessibilityPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="ACCESSIBILITY"
        title="Accessibility"
        description="Our commitment to making this website usable for as many people as possible, and how to tell us when something is not working for you."
        breadcrumbs={[{ label: "Accessibility" }]}
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
                  This statement outlines, in general terms, how the Human Rights
                  Protection Foundation approaches accessibility for this website
                  and how you can let us know when something does not work for you.
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
