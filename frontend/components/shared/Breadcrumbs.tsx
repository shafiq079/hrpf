import TranslationText from "@/components/translation/TranslationText";
import Link from "@/components/translation/TranslationLink";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  /** Use light colors on dark (navy) backgrounds. */
  tone?: "dark" | "light";
  className?: string;
}

/**
 * Accessible breadcrumb trail. Emits BreadcrumbList structured data.
 * The final item represents the current page and is not a link.
 */
export default function Breadcrumbs({
  items,
  tone = "dark",
  className = "",
}: BreadcrumbsProps) {
  const isLight = tone === "light";
  const base = [{ label: "Home", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: base.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: crumb.href } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className={`flex flex-wrap items-center gap-1.5 text-xs ${
          isLight ? "text-white/70" : "text-muted"
        }`}
      >
        {base.map((crumb, index) => {
          const isLast = index === base.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className={`transition-colors ${
                    isLight ? "hover:text-white" : "hover:text-teal-dark"
                  }`}
                >
                  <TranslationText>{crumb.label}</TranslationText>
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLight ? "text-white" : "text-text"}
                >
                  <TranslationText>{crumb.label}</TranslationText>
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  className="h-3.5 w-3.5 opacity-60"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
