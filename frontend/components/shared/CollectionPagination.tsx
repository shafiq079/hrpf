import TranslationText from "@/components/translation/TranslationText";
import Link from "@/components/translation/TranslationLink";

export default function CollectionPagination({ path, page, pages, query = {} }: { path: string; page: number; pages: number; query?: Record<string, string> }) {
  if (pages <= 1) return null;
  const href = (value: number) => `${path}?${new URLSearchParams({ ...query, page: String(value) })}`;
  return (
    <nav aria-label="Content pages" className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm">
      {page > 1 ? <Link href={href(page - 1)} className="font-semibold text-teal-dark"><TranslationText>Previous page</TranslationText></Link> : <span />}
      <span className="text-muted"><TranslationText>Page </TranslationText><TranslationText>{page}</TranslationText> <TranslationText>of </TranslationText><TranslationText>{pages}</TranslationText></span>
      {page < pages ? <Link href={href(page + 1)} className="font-semibold text-teal-dark"><TranslationText>Next page</TranslationText></Link> : <span />}
    </nav>
  );
}
