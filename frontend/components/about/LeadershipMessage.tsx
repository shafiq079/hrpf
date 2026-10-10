import Link from "@/components/translation/TranslationLink";
import TranslationText from "@/components/translation/TranslationText";
import PersonPortrait from "@/components/people/PersonPortrait";
import ContentBlocks from "@/components/shared/ContentBlocks";
import { readPublicPerson } from "@/lib/people";
import source from "@/data/about-source.json";

/** Use the message author's reviewed profile photo, including future admin edits. */
export default async function LeadershipMessage() {
  const result = await readPublicPerson("muhammad-yousaf-badar");
  const person = result.status === "ok" ? result.data : null;

  return (
    <div className={person?.photo ? "grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14" : "mx-auto max-w-3xl"}>
      {person?.photo ? (
        <figure className="mx-auto w-full max-w-sm self-start border border-border bg-white lg:mx-0">
          <PersonPortrait person={person} />
          <figcaption className="p-5">
            <p className="font-serif text-xl font-semibold text-navy"><TranslationText>{person.name}</TranslationText></p>
            <p className="mt-2 text-sm font-medium text-teal-dark"><TranslationText>{person.designation}</TranslationText></p>
            <Link href={`/about/people/${person.slug}`} className="mt-4 inline-block text-sm font-semibold text-teal-dark hover:underline">
              <TranslationText>Read full profile</TranslationText>
            </Link>
          </figcaption>
        </figure>
      ) : null}
      <div className="min-w-0"><ContentBlocks blocks={source.pages["chairman-message"].blocks} /></div>
    </div>
  );
}
