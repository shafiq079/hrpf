import Link from "@/components/translation/TranslationLink";
import type { PublicBoardMember } from "@/lib/public-collections";
import PersonPortrait from "./PersonPortrait";
export default function PersonProfile({
  person,
}: {
  person: PublicBoardMember;
}) {
  const sections = person.sections ?? [];
  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(260px,1fr)_2fr] lg:gap-12">
        <div className="max-w-sm overflow-hidden rounded-lg border border-border">
          <PersonPortrait person={person} priority />
        </div>
        <div className="self-center">
          <p className="eyebrow">Human Rights Protection Foundation Pakistan</p>
          <h1 className="mt-4 font-serif text-4xl text-navy sm:text-5xl">
            {person.name}
          </h1>
          <p className="mt-4 text-lg font-semibold text-teal-dark">
            {person.designation}
          </p>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
            {person.bio
              .split(/\n\s*\n/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-5 text-sm font-semibold">
            {person.showOnBoard !== false && (
              <Link href="/about/board-of-directors" className="text-teal-dark">
                Board of Directors →
              </Link>
            )}
            {person.showOnTeam && (
              <Link href="/about/our-team" className="text-teal-dark">
                Our Team →
              </Link>
            )}
          </div>
        </div>
      </div>
      {sections.length > 0 && (
        <div className="mt-14 grid gap-10 border-t border-border pt-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
          <nav
            aria-label="Profile contents"
            className="self-start lg:sticky lg:top-28"
          >
            <p className="eyebrow">In this profile</p>
            <ol className="mt-4 space-y-3 text-sm text-muted">
              {sections.map((section, index) => (
                <li key={index}>
                  <a
                    href={"#profile-section-" + index}
                    className="hover:text-teal-dark"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="max-w-3xl space-y-10">
            {sections.map((section, index) => (
              <section
                key={index}
                id={"profile-section-" + index}
                className="scroll-mt-28"
              >
                <h2 className="font-serif text-2xl text-navy sm:text-3xl">
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-4 leading-relaxed text-muted">
                  {section.body
                    .split(/\n\s*\n/)
                    .filter(Boolean)
                    .map((paragraph, p) => (
                      <p key={p} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
