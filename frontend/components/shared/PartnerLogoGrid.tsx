import TranslationText from "@/components/translation/TranslationText";
import { partners as defaultPartners, type Partner } from "@/data/partners";

interface PartnerLogoGridProps {
  partners?: Partner[];
}

/*
  Quiet institutional partner strip.
  NOTE: partner names render as grayscale text wordmarks and are placeholders.
  Replace with approved, licensed partner logos before production.
*/
export default function PartnerLogoGrid({
  partners = defaultPartners,
}: PartnerLogoGridProps) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
      {partners.map((partner) => (
        <li key={partner.name}>
          <span
            title={partner.fullName}
            className="font-serif text-xl font-semibold text-muted/70 grayscale transition-colors duration-200 hover:text-navy sm:text-2xl"
          >
            <TranslationText>{partner.name}</TranslationText>
          </span>
        </li>
      ))}
    </ul>
  );
}
