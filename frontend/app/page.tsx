import Link from "next/link";
import HeroSection from "@/components/home/HeroSection";
import FinalCallToAction from "@/components/home/FinalCallToAction";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import { Blocks, ContentState } from "@/components/content/ContentView";
import { publicRead, type Content, type Article } from "@/lib/public-content";
export default async function Home() {
  const [about, mission, vision, work, blogs] = await Promise.all([
    publicRead<Content>("content/who-we-are"),
    publicRead<Content>("content/mission"),
    publicRead<Content>("content/vision"),
    publicRead<Content>("content/thematic-pillars"),
    publicRead<Article[]>("blogs?limit=3"),
  ]);
  return (
    <main id="main-content">
      <HeroSection />
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="About HRPF Pakistan"
                title="Who We Are"
              />
              {about.status === "ok" ? (
                <Blocks blocks={about.data.blocks.slice(0, 2)} />
              ) : (
                <ContentState status={about.status} />
              )}
              <Link
                className="mt-6 inline-block font-semibold text-teal-dark"
                href="/about/who-we-are"
              >
                Read more →
              </Link>
            </div>
            <div className="space-y-10 border-l border-border pl-8">
              {[
                { title: "Mission", result: mission },
                { title: "Vision", result: vision },
              ].map(({ title, result: r }) => {
                return (
                  <section key={title}>
                    <h2 className="font-serif text-3xl text-navy">{title}</h2>
                    {r.status === "ok" ? (
                      <Blocks blocks={r.data.blocks} />
                    ) : (
                      <ContentState status={r.status} />
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </Container>
      </section>
      <section className="bg-soft-gray py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow="What We Do" title="Our Thematic Pillars" />
          {work.status === "ok" ? (
            <Blocks blocks={work.data.blocks} />
          ) : (
            <ContentState status={work.status} />
          )}
          <Link
            className="mt-6 inline-block font-semibold text-teal-dark"
            href="/what-we-do"
          >
            Explore our work →
          </Link>
        </Container>
      </section>
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow="Updates" title="Latest Blogs" />
          {blogs.status === "ok" && blogs.data.length ? (
            <div className="mt-8 grid border-l border-t border-border md:grid-cols-3">
              {blogs.data.map((article) => (
                <article
                  key={article.slug}
                  className="border-b border-r border-border p-6"
                >
                  <h3 className="font-serif text-2xl text-navy">
                    <Link href={`/blogs/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p className="mt-4 text-muted">{article.excerpt}</p>
                </article>
              ))}
            </div>
          ) : (
            <ContentState
              status={
                blogs.status === "unavailable" ? "unavailable" : "missing"
              }
            />
          )}
        </Container>
      </section>
      <FinalCallToAction />
    </main>
  );
}
