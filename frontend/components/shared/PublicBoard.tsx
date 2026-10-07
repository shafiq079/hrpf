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
  kind = "board",
  page = 1,
}: {
  kind?: "board" | "team";
  page?: number;
}) {
  const result = await readPublicCollection<PublicBoardMember>(kind, page);
  const board = kind === "board";
  const path = board ? "/about/board-of-directors" : "/about/our-team";
  return (
    <>
      <div className="mb-10 flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="eyebrow">
            {board ? "Leadership and direction" : "People behind our work"}
          </p>
          <h2 className="mt-3 font-serif text-3xl text-navy">
            {board
              ? "Meet our Board of Directors"
              : "Our office-bearers and team"}
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            {board
              ? "Meet the people who guide the Human Rights Protection Foundation Pakistan. Explore their backgrounds, responsibilities and contributions to the Foundation."
              : "Meet the people supporting HRPF’s administration, finance, information and digital communication. These profiles include the Foundation’s office-bearers who also serve on its Board of Directors."}
          </p>
        </div>
        <Link
          href={board ? "/about/our-team" : "/about/board-of-directors"}
          className="shrink-0 text-sm font-semibold text-teal-dark"
        >
          {board ? "Explore Our Team" : "View Board of Directors"} →
        </Link>
      </div>
      {result.data.length ? (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((person, index) => (
            <PersonCard
              key={person.slug}
              person={person}
              featured={board && page === 1 && index === 0}
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
      <CollectionPagination path={path} page={page} pages={result.pages} />
      {!board && (
        <div className="mt-12 rounded-lg bg-navy p-7 text-white sm:p-10">
          <h2 className="font-serif text-2xl text-white">Connect with HRPF</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
            For enquiries about the Foundation’s work or opportunities to
            contribute, contact HRPF or explore membership.
          </p>
          <div className="mt-5 flex flex-wrap gap-6 text-sm font-semibold">
            <Link
              href="/contact"
              className="text-white underline underline-offset-4"
            >
              Contact HRPF
            </Link>
            <Link
              href="/become-a-member"
              className="text-white underline underline-offset-4"
            >
              Become a Member
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
