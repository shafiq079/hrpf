import PillarCards from "@/components/content/PillarCards";
import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import { Blocks } from "@/components/content/ContentView";
import { ngoPages } from "@/data/ngo";
export default function WhatWeDo() {
  return (
    <main id="main-content">
      <PageHero title="What We Do" eyebrow="HRPF Pakistan" />
      <Container className="py-14 lg:py-20">
        <div className="space-y-14">
          {[
            "areas-of-work",
            "thematic-pillars",
            "our-approach",
            "our-commitment",
          ].map((key) => {
            const page = ngoPages[key];
            return (
              <section key={key}>
                <h2 className="mb-6 font-serif text-3xl text-navy">
                  {page.title}
                </h2>
                {key === "thematic-pillars" ? (
                  <PillarCards blocks={page.blocks} />
                ) : (
                  <Blocks blocks={page.blocks} />
                )}
              </section>
            );
          })}
        </div>
      </Container>
    </main>
  );
}
