import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import FocusAreaCard from "@/components/shared/FocusAreaCard";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import Reveal from "@/components/shared/Reveal";
import home from "@/data/homepage.json";
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
          description="Our work brings together human rights advocacy, public awareness and institutional accountability to support vulnerable communities in Pakistan."
        />

        <CardGrid cols={3} className="mt-12">
          {focusAreas.slice(0, 6).map((area, index) => (
            <li key={area.title} className={cardGridCellClass}>
              <Reveal delay={(index % 3) * 0.08} className="h-full">
                <FocusAreaCard area={{ ...area, ...home.focus[index] }} />
              </Reveal>
            </li>
          ))}
        </CardGrid>
      </Container>
    </section>
  );
}
