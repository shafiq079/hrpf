import { UserRound } from "lucide-react";
import AppImage from "@/components/shared/AppImage";
import TranslationText from "@/components/translation/TranslationText";
import type { PublicTeamMember } from "@/lib/public-collections";

export default function TeamMemberCard({ member }: { member: PublicTeamMember }) {
  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-white">
      <div className="relative aspect-[4/3] bg-soft-gray">
        {member.photo ? (
          <AppImage src={member.photo} alt={member.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover object-top" />
        ) : (
          <div className="flex h-full items-center justify-center"><UserRound size={56} className="text-muted" aria-hidden="true" /></div>
        )}
      </div>
      <div className="p-5 sm:p-6">
        <p className="break-words text-sm font-semibold leading-relaxed text-teal-dark"><TranslationText>{member.designation}</TranslationText></p>
        <h3 className="mt-2 break-words font-serif text-2xl leading-snug text-navy"><TranslationText>{member.name}</TranslationText></h3>
        <dl className="mt-5 space-y-5 border-t border-border pt-5 text-sm">
          <div>
            <dt className="font-semibold text-navy"><TranslationText>Responsibilities</TranslationText></dt>
            <dd className="mt-2 whitespace-pre-line break-words text-start leading-relaxed text-text"><TranslationText>{member.responsibilities}</TranslationText></dd>
          </div>
          <div>
            <dt className="font-semibold text-navy"><TranslationText>Reporting to</TranslationText></dt>
            <dd className="mt-2 break-words text-start leading-relaxed text-text"><TranslationText>{member.reportingTo}</TranslationText></dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
