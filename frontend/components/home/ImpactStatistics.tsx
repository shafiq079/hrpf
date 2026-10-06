import Container from "@/components/shared/Container";
import home from "@/data/homepage.json";

/** Original navy statistics band, displaying verifiable organisation counts. */
export default function ImpactStatistics() {
  return (
    <section
      className="bg-navy py-14 lg:py-16"
      aria-label="HRPF organisation at a glance"
    >
      <Container>
        <dl className="grid grid-cols-2 gap-y-10 sm:gap-y-0 lg:grid-cols-4">
          {home.stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-4 text-center lg:px-6 ${
                index > 0 ? "lg:border-l lg:border-white/15" : ""
              }`}
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-serif text-4xl font-semibold text-teal sm:text-5xl">
                  {stat.value}
                </span>
                <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
