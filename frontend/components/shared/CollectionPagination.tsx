import Link from "next/link";

export default function CollectionPagination({ path, page, pages }: { path: string; page: number; pages: number }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Content pages" className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm">
      {page > 1 ? <Link href={`${path}?page=${page - 1}`} className="font-semibold text-teal-dark">Previous page</Link> : <span />}
      <span className="text-muted">Page {page} of {pages}</span>
      {page < pages ? <Link href={`${path}?page=${page + 1}`} className="font-semibold text-teal-dark">Next page</Link> : <span />}
    </nav>
  );
}
