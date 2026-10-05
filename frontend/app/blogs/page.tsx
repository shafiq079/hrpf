import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import EmptyState from "@/components/shared/EmptyState";
import { ContentState } from "@/components/content/ContentView";
import Pagination from "@/components/content/Pagination";
import { publicRead, pageNumber, type Article } from "@/lib/public-content";
export default async function Blogs({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams,
    page = pageNumber(search.page),
    q = typeof search.q === "string" ? search.q.slice(0, 80) : "";
  const result = await publicRead<Article[]>(
    `blogs?${new URLSearchParams({ page: String(page), q })}`,
  );
  return (
    <main id="main-content">
      <PageHero title="Blogs" eyebrow="Reports and Perspectives" />
      <Container className="py-14 lg:py-20">
        <form action="/blogs" className="mb-8 flex gap-3">
          <label className="flex-1">
            <span className="sr-only">Search blog titles</span>
            <input
              name="q"
              defaultValue={q}
              maxLength={80}
              placeholder="Search blogs"
              className="w-full border border-border p-3"
            />
          </label>
          <button className="bg-navy px-6 text-white">Search</button>
        </form>
        {result.status === "ok" ? (
          <>
            {result.data.length ? (
              <div className="grid border-l border-t border-border md:grid-cols-3">
                {result.data.map((article) => (
                  <article
                    key={article.slug}
                    className="border-b border-r border-border p-6"
                  >
                    <p className="text-sm text-muted">
                      {new Date(article.publishedAt).toLocaleDateString(
                        "en-PK",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          timeZone: "UTC",
                        },
                      )}
                    </p>
                    <h2 className="mt-3 font-serif text-2xl text-navy">
                      <Link href={`/blogs/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>
                    <p className="mt-4 text-muted">{article.excerpt}</p>
                    <Link
                      className="mt-6 inline-block font-semibold text-teal-dark"
                      href={`/blogs/${article.slug}`}
                    >
                      Read article →
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title={q ? "No matching blogs" : "No blog posts yet"}
                description={
                  q
                    ? "Try another search."
                    : "New articles will appear here as they are added."
                }
              />
            )}
            <Pagination
              page={page}
              pages={result.meta?.pages ?? 0}
              href="/blogs"
              query={{ q }}
            />
          </>
        ) : (
          <ContentState status={result.status} />
        )}
      </Container>
    </main>
  );
}
