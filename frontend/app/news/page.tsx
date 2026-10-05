import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import AppImage from "@/components/shared/AppImage";
import CallToAction from "@/components/shared/CallToAction";
import { newsArticles } from "@/data/news";
import { formatDate } from "@/lib/format";
import NewsExplorer from "./NewsExplorer";

export const metadata = createMetadata({
  title: "News",
  description:
    "Read programme updates, human-rights articles, organizational announcements, community stories and institutional statements.",
  path: "/news",
});

export default function NewsPage() {
  const featured = newsArticles.find((article) => article.featured) ?? newsArticles[0];

  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="NEWSROOM"
        title="News, Stories and Updates"
        description="Read programme updates, human-rights articles, organizational announcements, community stories and institutional statements."
        breadcrumbs={[{ label: "News" }]}
      />

      {/* Featured article */}
      {featured && (
        <section className="bg-off-white py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading eyebrow="Featured" title="Featured Story" />
            <article className="mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border">
                <AppImage
                  src={featured.image}
                  alt={featured.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="eyebrow">{featured.category}</p>
                <h3 className="mt-2 font-serif text-[26px] font-semibold leading-tight sm:text-[30px]">
                  <Link
                    href={featured.href}
                    className="transition-colors hover:text-teal-dark"
                  >
                    {featured.title}
                  </Link>
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                  {featured.summary}
                </p>
                <p className="mt-4 text-xs text-muted">
                  <time dateTime={featured.date}>
                    {formatDate(featured.date)}
                  </time>
                  <span aria-hidden="true"> · </span>
                  {featured.readingTime}
                </p>
                <Link
                  href={featured.href}
                  className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-dark transition-colors hover:text-navy"
                  aria-label={`Read the story: ${featured.title}`}
                >
                  Read Story
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </article>
          </Container>
        </section>
      )}

      <NewsExplorer />

      {/* Newsletter CTA */}
      <CallToAction
        tone="light"
        title="Stay Informed"
        description="Subscribe to our monthly advocacy digest for programme updates, articles and announcements."
        actions={[
          { label: "Subscribe", href: "/contact", icon: ArrowRight },
        ]}
      />
    </main>
  );
}
