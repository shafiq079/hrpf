"use client";

import { useLinkStatus } from "next/link";
import TranslationText from "@/components/translation/TranslationText";
import Link from "@/components/translation/TranslationLink";

function PageLinkLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return <><TranslationText>{label}</TranslationText>{pending && <span role="status" className="ml-2 text-xs text-muted"><TranslationText>Loading…</TranslationText></span>}</>;
}

export default function CollectionPagination({ path, page, pages, query = {} }: { path: string; page: number; pages: number; query?: Record<string, string> }) {
  if (pages <= 1) return null;
  const href = (value: number) => `${path}?${new URLSearchParams({ ...query, page: String(value) })}`;
  return (
    <nav aria-label="Content pages" className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm">
      {page > 1 ? <Link href={href(page - 1)} prefetch={false} scroll={false} className="font-semibold text-teal-dark"><PageLinkLabel label="Previous page" /></Link> : <span />}
      <span className="text-muted"><TranslationText>Page </TranslationText><TranslationText>{page}</TranslationText> <TranslationText>of </TranslationText><TranslationText>{pages}</TranslationText></span>
      {page < pages ? <Link href={href(page + 1)} prefetch={false} scroll={false} className="font-semibold text-teal-dark"><PageLinkLabel label="Next page" /></Link> : <span />}
    </nav>
  );
}
