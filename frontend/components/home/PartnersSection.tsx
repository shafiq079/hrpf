import Container from "@/components/shared/Container";
import { partners } from "@/data/partners";

/*
  Quiet institutional partners strip.
  NOTE: partner names render as grayscale text wordmarks and are placeholders.
  Replace with approved, licensed partner logos before production.
*/
export default function PartnersSection() {
  return (
    <section className="border-y border-border bg-off-white py-12 lg:py-14">
      <Container>
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Institutional Partners &amp; Affiliates
        </h2>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
          {partners.map((partner) => (
            <li key={partner.name}>
              <span
                title={partner.fullName}
                className="font-serif text-xl font-semibold text-muted/70 grayscale transition-colors duration-200 hover:text-navy sm:text-2xl"
              >
                {partner.name}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
