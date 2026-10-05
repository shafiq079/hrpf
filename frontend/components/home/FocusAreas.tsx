import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import FocusAreaCard from "@/components/shared/FocusAreaCard";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import Reveal from "@/components/shared/Reveal";
import { focusAreas } from "@/data/focusAreas";

/** Border-grid of six human-rights focus areas on a soft gray background. */
export default function FocusAreas() {
  return (
    <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="What We Do"
          title="Our Focus Areas"
          description="We direct our resources toward critical human-rights sectors where intervention and protection can create lasting social change."
        />

        <CardGrid cols={3} className="mt-12">
          {focusAreas.slice(0, 6).map((area, index) => (
            <li key={area.title} className={cardGridCellClass}>
              <Reveal delay={(index % 3) * 0.08} className="h-full">
                <FocusAreaCard area={area} />
              </Reveal>
            </li>
          ))}
        </CardGrid>
      </Container>
    </section>
  );
}
