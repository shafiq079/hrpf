import Container from "@/components/shared/Container";
import home from "@/data/homepage.json";

/* Original wordmark strip retained; verified profile values replace unsubstantiated affiliations. */
export default function PartnersSection() {
  return (
    <section className="border-y border-border bg-off-white py-12 lg:py-14">
      <Container>
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Our Guiding Principles
        </h2>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
          {home.principles.map((principle) => (
            <li key={principle}>
              <span
                title={principle}
                className="font-serif text-xl font-semibold text-muted/70 grayscale transition-colors duration-200 hover:text-navy sm:text-2xl"
              >
                {principle}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
