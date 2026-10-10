import TranslationText from "@/components/translation/TranslationText";
import source from "@/data/about-source.json";

const contents = [
  ["our-vision", "Our Vision"],
  ["our-mission", "Our Mission"],
  ["mission-priorities", "Core Mission Priorities"],
  ["our-commitment", "Our Commitment"],
] as const;
const headingClass = "font-serif text-2xl font-semibold text-navy sm:text-3xl";
const paragraphClass = "break-words text-start text-base leading-8 text-text";

export default function MissionVision() {
  const { mission, vision } = source.pages;

  return (
    <div className="mx-auto max-w-4xl">
      <nav aria-label="On this page" className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {contents.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="flex min-h-11 items-center justify-center rounded-sm border border-border bg-white px-3 py-2 text-center text-sm font-semibold text-teal-dark transition-colors hover:border-teal hover:bg-teal/5">
            <TranslationText>{label}</TranslationText>
          </a>
        ))}
      </nav>

      <div className="space-y-12 sm:space-y-16">
        <section id="our-vision" aria-labelledby="vision-heading" className="scroll-mt-28 border border-border bg-white p-5 sm:p-8 lg:p-10">
          <p className="mb-4 text-sm font-semibold leading-relaxed text-teal-dark"><TranslationText>Human Rights Protection Foundation Pakistan (HRPF)</TranslationText></p>
          <h2 id="vision-heading" className={headingClass}><TranslationText>{vision.title}</TranslationText></h2>
          <div className="mt-6 max-w-3xl space-y-5">
            {vision.blocks.map((block, index) => (
              <p key={index} className={paragraphClass}><TranslationText>{block.text}</TranslationText></p>
            ))}
          </div>
        </section>

        <section id="our-mission" aria-labelledby="mission-heading" className="scroll-mt-28 px-1 sm:px-8 lg:px-10">
          <h2 id="mission-heading" className={headingClass}><TranslationText>{mission.title}</TranslationText></h2>
          <p className="mt-4 max-w-3xl text-lg font-semibold leading-relaxed text-teal-dark sm:text-xl"><TranslationText>{mission.tagline}</TranslationText></p>
          <div className="mt-6 max-w-3xl space-y-5">
            {mission.blocks.map((block, index) => (
              <p key={index} className={paragraphClass}><TranslationText>{block.text}</TranslationText></p>
            ))}
          </div>
        </section>

        <section id="mission-priorities" aria-labelledby="priorities-heading" className="scroll-mt-28">
          <h2 id="priorities-heading" className={headingClass}><TranslationText>Our Core Mission Priorities</TranslationText></h2>
          <ol role="list" className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5">
            {mission.priorities.map((priority, index) => (
              <li key={priority.title} id={`priority-${index + 1}`} className="min-w-0 scroll-mt-28 border border-border bg-white p-5 sm:p-6">
                <span aria-hidden="true" className="mb-4 flex size-10 items-center justify-center rounded-full bg-teal/10 text-lg font-semibold text-teal-dark">{index + 1}</span>
                <h3 className="break-words font-serif text-xl font-semibold leading-snug text-navy"><TranslationText>{priority.title}</TranslationText></h3>
                <p className={`mt-3 ${paragraphClass}`}><TranslationText>{priority.text}</TranslationText></p>
              </li>
            ))}
          </ol>
        </section>

        <section id="our-commitment" aria-labelledby="commitment-heading" className="scroll-mt-28 border border-border bg-white p-5 sm:p-8 lg:p-10">
          <h2 id="commitment-heading" className={headingClass}><TranslationText>Our Commitment</TranslationText></h2>
          <div className="mt-6 max-w-3xl space-y-5">
            {mission.commitment.map((paragraph, index) => (
              <p key={index} className={paragraphClass}><TranslationText>{paragraph}</TranslationText></p>
            ))}
          </div>
          <p className="mt-8 border-t border-border pt-6 text-lg font-semibold leading-relaxed text-teal-dark sm:text-xl"><TranslationText>{mission.closing}</TranslationText></p>
        </section>
      </div>
    </div>
  );
}
