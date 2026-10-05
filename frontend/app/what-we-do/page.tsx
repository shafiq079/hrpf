import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import { Blocks, ContentState } from "@/components/content/ContentView";
import { publicRead, type Content } from "@/lib/public-content";
export default async function WhatWeDo() {
  const results = await Promise.all(
    ["areas-of-work", "thematic-pillars", "our-approach"].map((key) =>
      publicRead<Content>(`content/${key}`),
    ),
  );
  return (
    <main id="main-content">
      <PageHero title="What We Do" eyebrow="HRPF Pakistan" />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl space-y-14">
          {results.map((r, i) =>
            r.status === "ok" ? (
              <section key={i}>
                <h2 className="mb-6 font-serif text-3xl text-navy">
                  {r.data.title}
                </h2>
                <Blocks blocks={r.data.blocks} />
              </section>
            ) : (
              <ContentState key={i} status={r.status} />
            ),
          )}
        </div>
      </Container>
    </main>
  );
}
