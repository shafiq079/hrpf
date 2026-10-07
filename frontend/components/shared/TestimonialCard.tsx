import TranslationText from "@/components/translation/TranslationText";
import { Quote } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  /** Optional initials shown in the avatar. */
  initials?: string;
}

/** Compact testimonial card for use in grids and sidebars. */
export default function TestimonialCard({
  quote,
  name,
  role,
  initials,
}: TestimonialCardProps) {
  const avatarText =
    initials ??
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <figure className="flex h-full flex-col rounded-lg border border-border bg-white p-6">
      <Quote className="h-7 w-7 text-teal" aria-hidden="true" />
      <blockquote className="mt-3 flex-1 font-serif text-[17px] italic leading-snug text-navy">
        <TranslationText>&ldquo;</TranslationText><TranslationText>{quote}</TranslationText><TranslationText>&rdquo;
      </TranslationText></blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
          <TranslationText>{avatarText}</TranslationText>
        </span>
        <span>
          <span className="block text-sm font-semibold text-text"><span className="notranslate" translate="no">{name}</span></span>
          <span className="block text-sm text-muted"><TranslationText>{role}</TranslationText></span>
        </span>
      </figcaption>
    </figure>
  );
}
