import Link from "@/components/translation/TranslationLink";
import { Users } from "lucide-react";
import {
  readPublicCollection,
  type PublicBoardMember,
} from "@/lib/public-collections";
import PersonCard from "@/components/people/PersonCard";
import CollectionPagination from "./CollectionPagination";
import EmptyState from "./EmptyState";
export default async function PublicBoard({
  page = 1,
}: {
  page?: number;
}) {
  const result = await readPublicCollection<PublicBoardMember>("board", page);
  return (
    <>
      <div className="mb-10 flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="eyebrow">
            Leadership and direction
          </p>
          <h2 className="mt-3 font-serif text-3xl text-navy">
            Meet our Board of Directors
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            Meet the people who guide the Human Rights Protection Foundation Pakistan. Explore their backgrounds, responsibilities and contributions to the Foundation.
          </p>
        </div>
        <Link
          href="/about/our-team"
          className="shrink-0 text-sm font-semibold text-teal-dark"
        >
          Explore Our Team →
        </Link>
      </div>
      {result.data.length ? (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((person, index) => (
            <PersonCard
              key={person.slug}
              person={person}
              featured={page === 1 && index === 0}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={
            result.status === "unavailable"
              ? "Profiles temporarily unavailable"
              : "Profiles are being prepared"
          }
          description={
            result.status === "unavailable"
              ? "Please try again later."
              : "Profiles will appear here after they are reviewed and published."
          }
        />
      )}
      <CollectionPagination path="/about/board-of-directors" page={page} pages={result.pages} />
    </>
  );
}
