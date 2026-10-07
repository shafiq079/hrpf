import TranslationText from "@/components/translation/TranslationText";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  /** Use a light color scheme on dark (navy) backgrounds. */
  tone?: "dark" | "light";
  className?: string;
  /** Heading level for correct document hierarchy. Defaults to h2. */
  as?: "h2" | "h3";
}

/**
 * Reusable eyebrow + heading + supporting text block used to open sections.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  className = "",
  as: Heading = "h2",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const isLight = tone === "light";

  return (
    <div
      className={`${isCenter ? "mx-auto text-center" : "text-left"} ${
        isCenter ? "max-w-2xl" : ""
      } ${className}`}
    >
      {eyebrow && (
        <p className={`eyebrow ${isLight ? "text-teal" : ""}`}><TranslationText>{eyebrow}</TranslationText></p>
      )}
      <Heading
        className={`mt-3 text-[28px] leading-tight sm:text-[34px] lg:text-[40px] ${
          isLight ? "text-white" : ""
        }`}
      >
        {typeof title === "string" ? <TranslationText>{title}</TranslationText> : title}
      </Heading>
      {description && (
        <p
          className={`mt-4 text-[15px] leading-relaxed sm:text-base ${
            isLight ? "text-white/80" : "text-muted"
          } ${isCenter ? "mx-auto" : "max-w-2xl"}`}
        >
          <TranslationText>{description}</TranslationText>
        </p>
      )}
    </div>
  );
}
