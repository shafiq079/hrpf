import type { ReactNode } from "react";

interface ProseProps {
  children: ReactNode;
  className?: string;
}

/**
 * Readable long-form typography wrapper for policy pages and articles.
 * Styles nested headings, paragraphs and lists without a plugin using
 * Tailwind arbitrary variants.
 */
export default function Prose({ children, className = "" }: ProseProps) {
  return (
    <div
      className={[
        "max-w-none text-[15px] leading-relaxed text-text sm:text-base",
        "[&_h2]:mt-10 [&_h2]:scroll-mt-24 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-navy",
        "[&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-navy",
        "[&_p]:mt-4 [&_p]:text-muted",
        "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-muted",
        "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:text-muted",
        "[&_a]:font-medium [&_a]:text-teal-dark [&_a]:underline hover:[&_a]:text-navy",
        "[&_strong]:font-semibold [&_strong]:text-text",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
