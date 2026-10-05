import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink, Link2, Mail, Quote } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import AppImage from "@/components/shared/AppImage";
import Prose from "@/components/shared/Prose";
import NewsCard from "@/components/shared/NewsCard";
import CallToAction from "@/components/shared/CallToAction";
import { newsArticles, getArticle } from "@/data/news";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return newsArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return createMetadata({
    title: article.title,
    description: article.summary,
    path: article.href,
  });
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = newsArticles
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow={article.category}
        title={article.title}
        description={article.summary}
        breadcrumbs={[
          { label: "News", href: "/news" },
          { label: article.title },
        ]}
      />

      <article className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="font-semibold text-text">{article.author}</span>
              <span aria-hidden="true">·</span>
              <span>{article.authorRole}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span aria-hidden="true">·</span>
              <span>{article.readingTime}</span>
            </div>

            {/* Featured image */}
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg border border-border">
              <AppImage
                src={article.image}
                alt={article.imageAlt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Body */}
            <Prose className="mt-8">
              {article.intro && (
                <p className="!mt-0 text-lg leading-relaxed text-text">
                  {article.intro}
                </p>
              )}
              {article.sections?.map((section) => (
                <div key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ))}
            </Prose>

            {/* Pull quote */}
            {article.pullQuote && (
              <blockquote className="my-10 border-l-4 border-teal bg-white p-6 pl-6">
                <Quote
                  className="h-6 w-6 text-teal"
                  aria-hidden="true"
                />
                <p className="mt-3 font-serif text-xl font-medium leading-snug text-navy sm:text-2xl">
                  {article.pullQuote}
                </p>
              </blockquote>
            )}

            {/* Sources */}
            {article.sources && article.sources.length > 0 && (
              <section className="mt-10 rounded-lg border border-border bg-white p-6">
                <h2 className="font-serif text-xl font-semibold text-navy">
                  Sources and references
                </h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted">
                  {article.sources.map((source, index) => (
                    <li key={index}>{source}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Tags
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-border bg-white px-3 py-1 text-sm text-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Social sharing */}
            <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <span className="text-sm font-semibold text-text">
                Share this article
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:?subject=${encodeURIComponent(article.title)}`}
                  aria-label="Share this article by email"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-white text-muted transition-colors hover:text-teal-dark"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={article.href}
                  aria-label="Copy link to this article"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-white text-muted transition-colors hover:text-teal-dark"
                >
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={article.href}
                  aria-label="Open this article in a new context"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-white text-muted transition-colors hover:text-teal-dark"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Author profile card */}
            <div className="mt-10 flex items-start gap-4 rounded-lg border border-border bg-white p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal/10 text-sm font-semibold text-teal-dark">
                {article.author
                  .split(" ")
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <p className="text-base font-semibold text-text">
                  {article.author}
                </p>
                <p className="text-sm text-muted">{article.authorRole}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  Placeholder author biography. A short professional summary will
                  appear here once contributor profiles are finalized.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading eyebrow="Keep Reading" title="Related Articles" />
            <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <NewsCard article={item} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Newsletter CTA */}
      <CallToAction
        title="Stay Informed"
        description="Subscribe to our monthly advocacy digest for programme updates, articles and announcements."
        actions={[{ label: "Subscribe", href: "/contact", icon: ArrowRight }]}
      />
    </main>
  );
}
