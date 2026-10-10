import Link from "@/components/translation/TranslationLink";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Download,
  UserRound,
} from "lucide-react";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import AppImage from "@/components/shared/AppImage";
import Prose from "@/components/shared/Prose";
import ProjectGallery from "@/components/projects/ProjectGallery";
import BlogShare from "./BlogShare";
import { formatDate } from "@/lib/format";
import { readingMinutes, type BlogDetail } from "@/lib/blog-details";
function Paragraphs({ text }: { text?: string }) {
  return (
    <>
      {text
        ?.split(/\n\s*\n/u)
        .filter((part) => part.trim())
        .map((part, i) => (
          <p key={i} className="whitespace-pre-line">
            {part}
          </p>
        ))}
    </>
  );
}
export default function BlogDetailView({
  blog,
  preview = false,
  related = [],
  locale = "en",
}: {
  blog: BlogDetail;
  preview?: boolean;
  related?: BlogDetail[];
  locale?: "en" | "ur";
}) {
  const details = blog.details ?? {};
  const sections = details.sections ?? [];
  const author = details.authorName || blog.authorName || "HRPF Pakistan";
  const category = details.category || blog.category || "HRPF Blogs";
  return (
    <>
      <PageHero
        heroImage="writing"
        backgroundImage={blog.image || undefined}
        eyebrow={category}
        title={blog.title}
        description={blog.excerpt}
        breadcrumbs={[
          { label: "Blogs", href: "/blogs" },
          { label: blog.title },
        ]}
      />
      <Container className="py-10 sm:py-14">
        <div className="mb-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <UserRound size={16} aria-hidden="true" />
            {author}
            {details.authorRole ? ` · ${details.authorRole}` : ""}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={16} aria-hidden="true" />
            {preview ? (
              "Draft preview"
            ) : blog.publishedAt ? (
              <time dateTime={blog.publishedAt}>
                {formatDate(blog.publishedAt)}
              </time>
            ) : (
              "HRPF article"
            )}
          </span>
          <span className="inline-flex items-center gap-2">
            <BookOpen size={16} aria-hidden="true" />
            {readingMinutes(blog)} min read
          </span>
        </div>
        {blog.image && (
          <figure className="mb-12">
            <div className="relative aspect-[16/8] overflow-hidden rounded-lg border border-border bg-navy">
              <AppImage
                src={blog.image}
                alt={blog.imageAlt || blog.title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="object-contain"
              />
            </div>
            {details.coverCaption && (
              <figcaption className="mt-3 text-sm leading-relaxed text-muted">
                {details.coverCaption}
              </figcaption>
            )}
          </figure>
        )}
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
          <article className="min-w-0 max-w-3xl">
            {details.takeaways?.length ? (
              <section
                aria-labelledby="takeaways"
                className="mb-9 border-l-4 border-gold bg-off-white p-6 sm:p-8"
              >
                <p className="eyebrow">At a glance</p>
                <h2 id="takeaways" className="mt-2 text-2xl">
                  Key takeaways
                </h2>
                <ul className="mt-4 space-y-3">
                  {details.takeaways.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm leading-relaxed text-muted"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-dark"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <Prose className="text-base sm:text-lg [&_p]:leading-8">
              {details.intro && (
                <section id="introduction" className="scroll-mt-28">
                  <h2 className="sr-only">Introduction</h2>
                  <Paragraphs text={details.intro} />
                </section>
              )}
              {(blog.blocks ?? []).map((block, i) =>
                block.type === "heading" ? (
                  <h2 key={i}>{block.text}</h2>
                ) : block.type === "list" ? (
                  <ul key={i}>
                    {block.items?.map((item, n) => (
                      <li key={n}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <Paragraphs key={i} text={block.text} />
                ),
              )}
              {sections.map((section, i) => (
                <section
                  key={i}
                  id={`section-${i + 1}`}
                  className="scroll-mt-28"
                >
                  <h2>{section.heading}</h2>
                  <Paragraphs text={section.body} />
                  {section.bullets?.length ? (
                    <ul>
                      {section.bullets.map((item, n) => (
                        <li key={n}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.quote && (
                    <blockquote className="my-7 border-l-4 border-teal bg-off-white px-6 py-5">
                      <p className="!mt-0 font-serif text-xl italic !text-navy">
                        “{section.quote}”
                      </p>
                      <footer className="mt-3 text-sm text-muted">
                        — {section.attribution}
                      </footer>
                    </blockquote>
                  )}
                </section>
              ))}
              {details.conclusion && (
                <section id="conclusion" className="scroll-mt-28">
                  <h2>Closing thoughts</h2>
                  <Paragraphs text={details.conclusion} />
                </section>
              )}
            </Prose>
            {blog.gallery?.length ? (
              <section id="photographs" className="mt-12 scroll-mt-28">
                <p className="eyebrow">From the archive</p>
                <h2 className="mb-5 mt-2 text-2xl">Photographs</h2>
                <ProjectGallery
                  photos={blog.gallery}
                  label="Blog photographs"
                />
              </section>
            ) : null}
            {details.sources?.length ? (
              <section
                id="sources"
                className="mt-12 scroll-mt-28 border-t border-border pt-8"
              >
                <p className="eyebrow">Further reading</p>
                <h2 className="mt-2 text-2xl">Sources and references</h2>
                <ol className="mt-5 space-y-5">
                  {details.sources.map((source, i) => (
                    <li key={i} className="border-l-2 border-teal pl-4">
                      <p className="font-semibold text-navy">
                        {source.url ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-4 hover:text-teal-dark"
                          >
                            {source.label}
                          </a>
                        ) : (
                          source.label
                        )}
                      </p>
                      {source.note && (
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {source.note}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
            {blog.documents?.length ? (
              <section id="documents" className="mt-9 scroll-mt-28">
                <h2 className="text-2xl">Supporting documents</h2>
                <div className="mt-4 space-y-3">
                  {blog.documents.map((document) => (
                    <a
                      key={document.file}
                      href={document.file}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center justify-between gap-4 border border-border bg-off-white p-5 text-sm font-semibold text-navy hover:border-teal"
                    >
                      <span>
                        {document.label}
                        <span className="mt-1 block text-xs font-normal text-muted">
                          PDF · Opens a download
                        </span>
                      </span>
                      <Download size={20} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
            {blog.tags?.length ? (
              <ul
                aria-label="Blog topics"
                className="mt-9 flex flex-wrap gap-2"
              >
                {blog.tags.map((tag) => (
                  <li
                    key={tag}
                    className="bg-soft-gray px-3 py-1.5 text-xs font-medium text-teal-dark"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
            {!preview && (
              <div className="mt-9">
                <BlogShare title={blog.title} />
              </div>
            )}
          </article>
          <aside className="space-y-6 lg:sticky lg:top-28">
            {sections.length > 0 ||
            blog.gallery?.length ||
            details.sources?.length ||
            blog.documents?.length ? (
              <nav
                aria-label="Article contents"
                className="border border-border bg-off-white p-6"
              >
                <p className="eyebrow">In this article</p>
                <h2 className="mt-2 text-xl">Contents</h2>
                <ol className="mt-4 space-y-3 text-sm text-muted">
                  {details.intro && (
                    <li>
                      <a href="#introduction" className="hover:text-teal-dark">
                        Introduction
                      </a>
                    </li>
                  )}
                  {sections.map((section, i) => (
                    <li key={i}>
                      <a
                        href={`#section-${i + 1}`}
                        className="hover:text-teal-dark"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                  {details.conclusion && (
                    <li>
                      <a href="#conclusion" className="hover:text-teal-dark">
                        Closing thoughts
                      </a>
                    </li>
                  )}
                  {blog.gallery?.length ? (
                    <li>
                      <a href="#photographs" className="hover:text-teal-dark">
                        Photographs
                      </a>
                    </li>
                  ) : null}
                  {details.sources?.length ? (
                    <li>
                      <a href="#sources" className="hover:text-teal-dark">
                        Sources and references
                      </a>
                    </li>
                  ) : null}
                  {blog.documents?.length ? (
                    <li>
                      <a href="#documents" className="hover:text-teal-dark">
                        Supporting documents
                      </a>
                    </li>
                  ) : null}
                </ol>
              </nav>
            ) : null}
            <div className="bg-navy p-6 text-white">
              <p className="eyebrow text-teal">Human dignity matters</p>
              <h2 className="mt-3 text-2xl text-white">
                Continue the conversation
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Learn about the Foundation’s work or get in touch with our team.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white"
              >
                Contact HRPF <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-dark"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to all blogs
            </Link>
          </aside>
        </div>
        {!preview && related.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <p className="eyebrow">Keep reading</p>
            <h2 className="mt-2 text-3xl">More from HRPF</h2>
            <div className="mt-7 grid gap-6 md:grid-cols-3">
              {related.map((row) => (
                <article
                  key={row.slug}
                  className="border border-border bg-white p-6"
                >
                  <p className="eyebrow">{row.category || "HRPF Blogs"}</p>
                  <h3 className="mt-3 text-xl">
                    <Link
                      href={`/blogs/${row.slug}${locale === "ur" ? "?locale=ur" : ""}`}
                      className="hover:text-teal-dark"
                    >
                      {row.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {row.excerpt}
                  </p>
                  <Link
                    href={`/blogs/${row.slug}${locale === "ur" ? "?locale=ur" : ""}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-dark"
                  >
                    Read blog <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
