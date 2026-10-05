import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import NewsCard from "@/components/shared/NewsCard";
import Reveal from "@/components/shared/Reveal";
import { newsArticles } from "@/data/news";

/** Latest news & updates grid of editorial article cards. */
export default function LatestNews() {
  return (
    <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
      <Container>
        <SectionHeading
          eyebrow="Newsroom"
          title="Latest News & Updates"
        />

        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newsArticles.slice(0, 3).map((article, index) => (
            <li key={article.title}>
              <Reveal delay={(index % 3) * 0.08} className="h-full">
                <NewsCard article={article} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
