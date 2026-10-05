import Link from "next/link";
export default function Pagination({
  page,
  pages,
  href,
  query = {},
}: {
  page: number;
  pages: number;
  href: string;
  query?: Record<string, string>;
}) {
  if (pages <= 1) return null;
  const url = (n: number) =>
    `${href}?${new URLSearchParams({ ...query, page: String(n) })}`;
  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-6"
    >
      {page > 1 && (
        <Link className="font-semibold text-teal-dark" href={url(page - 1)}>
          Previous
        </Link>
      )}
      <span>
        Page {page} of {pages}
      </span>
      {page < pages && (
        <Link className="font-semibold text-teal-dark" href={url(page + 1)}>
          Next
        </Link>
      )}
    </nav>
  );
}
