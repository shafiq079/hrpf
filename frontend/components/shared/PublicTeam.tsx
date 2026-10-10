import { Users } from "lucide-react";
import { readPublicCollection, type PublicTeamMember } from "@/lib/public-collections";
import TranslationText from "@/components/translation/TranslationText";
import TeamMemberCard from "@/components/people/TeamMemberCard";
import CollectionPagination from "./CollectionPagination";
import EmptyState from "./EmptyState";

export default async function PublicTeam({ page = 1 }: { page?: number }) {
  const result = await readPublicCollection<PublicTeamMember>("team", page);
  return (
    <>
      <h2 className="mb-8 font-serif text-3xl text-navy"><TranslationText>Our Operational Team</TranslationText></h2>
      {result.data.length ? (
        <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map(member => <TeamMemberCard key={member.id} member={member} />)}
        </div>
      ) : (
        <EmptyState icon={Users} title={result.status === "unavailable" ? "Team temporarily unavailable" : "Nothing to show here"} description={result.status === "unavailable" ? "Please try again later." : undefined} />
      )}
      <CollectionPagination path="/about/our-team" page={page} pages={result.pages} />
    </>
  );
}
