import { Users } from "lucide-react";
import { readPublicCollection, type PublicBoardMember } from "@/lib/public-collections";
import AppImage from "./AppImage";
import EmptyState from "./EmptyState";

export default async function PublicBoard() {
  const result = await readPublicCollection<PublicBoardMember>("board");
  if (!result.data.length) return <EmptyState icon={Users}
    title={result.status === "unavailable" ? "Board information temporarily unavailable" : "Board profiles are being prepared"}
    description={result.status === "unavailable" ? "Please try again later." : "Board profiles will appear here when their details are reviewed and activated."} />;
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {result.data.map(member => (
        <li key={member.slug} className="rounded-lg border border-border bg-white p-6">
          {member.photo ? <div className="relative h-20 w-20 overflow-hidden rounded-full">
            <AppImage src={member.photo} alt={member.name} fill sizes="80px" className="object-cover" />
          </div> : <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-teal/10 font-serif text-xl font-semibold text-teal-dark">
            {member.name.split(" ").filter(part => part !== "Dr.").slice(0, 2).map(part => part[0]).join("")}
          </span>}
          <h2 className="mt-4 text-lg font-semibold text-navy">{member.name}</h2>
          <p className="mt-2 text-sm font-medium text-teal-dark">{member.designation}</p>
          {member.bio && <p className="mt-3 text-sm leading-relaxed text-muted">{member.bio}</p>}
        </li>
      ))}
    </ul>
  );
}
