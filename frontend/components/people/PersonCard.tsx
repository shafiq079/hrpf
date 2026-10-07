import Link from "@/components/translation/TranslationLink";
import { ArrowUpRight } from "lucide-react";
import type { PublicBoardMember } from "@/lib/public-collections";
import PersonPortrait from "./PersonPortrait";
export default function PersonCard({
  person,
  featured = false,
}: {
  person: PublicBoardMember;
  featured?: boolean;
}) {
  return (
    <article
      className={
        "group overflow-hidden rounded-lg border border-border bg-white " +
        (featured
          ? "sm:col-span-2 lg:col-span-3 sm:grid sm:grid-cols-[minmax(220px,1fr)_2fr]"
          : "flex h-full flex-col")
      }
    >
      <PersonPortrait person={person} />
      <div
        className={
          "flex flex-1 flex-col " +
          (featured ? "justify-center p-7 sm:p-10 lg:p-12" : "p-6")
        }
      >
        <p className="eyebrow">{person.designation}</p>
        <h2
          className={
            "mt-3 font-serif text-navy " +
            (featured ? "text-3xl sm:text-4xl" : "text-2xl")
          }
        >
          <Link
            href={"/about/people/" + person.slug}
            className="hover:text-teal-dark"
          >
            {person.name}
          </Link>
        </h2>
        {person.bio && (
          <p
            className={
              "mt-5 text-sm leading-relaxed text-muted " +
              (featured ? "max-w-2xl sm:text-base" : "line-clamp-4")
            }
          >
            {person.bio}
          </p>
        )}
        <Link
          href={"/about/people/" + person.slug}
          className="mt-6 inline-flex items-center gap-2 self-start border-b border-teal/30 pb-1 text-sm font-semibold text-teal-dark"
        >
          Read full profile<span className="sr-only"> of {person.name}</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
