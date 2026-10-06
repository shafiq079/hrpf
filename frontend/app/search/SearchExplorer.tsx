"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import SearchInput from "@/components/shared/SearchInput";
import FilterSelect from "@/components/shared/FilterSelect";
import FilterBar from "@/components/shared/FilterBar";
import EmptyState from "@/components/shared/EmptyState";
import { mainNavigation } from "@/data/navigation";
import { campaigns } from "@/data/campaigns";
import { events } from "@/data/events";

export type EntryType = "Pages" | "Projects" | "Blogs" | "Progress Reports" | "Campaigns" | "Events";
export interface IndexEntry {
  type: EntryType;
  title: string;
  description: string;
  href: string;
}
const entryTypes: EntryType[] = ["Pages", "Projects", "Blogs", "Progress Reports", "Campaigns", "Events"];
const pageEntries: IndexEntry[] = [
  ...mainNavigation.flatMap(item => [item, ...(item.children ?? [])]).map(item => ({
    type: "Pages" as const, title: item.label, description: `Explore ${item.label} at HRPF Pakistan.`, href: item.href,
  })),
  { type: "Pages", title: "File a Complaint", description: "Provide information about a human-rights concern.", href: "/file-a-complaint" },
  { type: "Pages", title: "Donate", description: "Support the Foundation’s work.", href: "/donate" },
  { type: "Pages", title: "Contact", description: "Get in touch with HRPF.", href: "/contact" },
  { type: "Pages", title: "Get Help", description: "Request information or guidance.", href: "/get-help" },
  { type: "Pages", title: "FAQ", description: "Answers to common questions about HRPF.", href: "/faq" },
  { type: "Pages", title: "Partner With Us", description: "Explore partnerships with the Foundation.", href: "/partner-with-us" },
  { type: "Pages", title: "Feedback about HRPF", description: "Share feedback about the Foundation’s work.", href: "/complaints" },
];
const otherEntries: IndexEntry[] = [
  ...campaigns.map(row => ({ type: "Campaigns" as const, title: row.title, description: row.description, href: row.href })),
  ...events.map(row => ({ type: "Events" as const, title: row.title, description: row.description, href: row.href })),
];

const popularPages = pageEntries.slice(0, 6);

export default function SearchExplorer({ entries }: { entries: IndexEntry[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");

  const trimmedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!trimmedQuery) return [];
    return [...pageEntries, ...entries, ...otherEntries].filter((entry) => {
      const matchesType = !type || entry.type === type;
      if (!matchesType) return false;
      const haystack = `${entry.title} ${entry.description}`.toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [trimmedQuery, type, entries]);

  const grouped = useMemo(() => {
    return entryTypes
      .map((entryType) => ({
        type: entryType,
        items: results.filter((entry) => entry.type === entryType),
      }))
      .filter((group) => group.items.length > 0);
  }, [results]);

  const hasQuery = trimmedQuery.length > 0;

  const clear = () => {
    setQuery("");
    setType("");
  };

  return (
    <div>
      <FilterBar>
        <div className="w-full sm:max-w-md">
          <SearchInput
            id="site-search"
            label="Search the site"
            placeholder="Search pages, projects, blogs, progress reports…"
            value={query}
            onChange={setQuery}
          />
        </div>
        <FilterSelect
          id="site-search-type"
          label="Content type"
          value={type}
          onChange={setType}
          options={entryTypes}
          allLabel="All content"
        />
      </FilterBar>

      <p className="mt-3 text-xs text-muted">
        Results match titles and descriptions from site pages and the latest published content, ordered by content type.
      </p>

      {hasQuery && (
        <p className="mt-6 text-sm font-medium text-text" role="status">
          {results.length}{" "}
          {results.length === 1 ? "result" : "results"} for &ldquo;
          {query.trim()}&rdquo;
        </p>
      )}

      <div className="mt-6">
        {!hasQuery && (
          <EmptyState
            title="Start typing to search."
            description="Search pages and the latest published projects, blogs and progress reports."
          />
        )}

        {hasQuery && results.length === 0 && (
          <EmptyState
            title="No results found"
            description="Try a different or more general keyword, or explore a popular page below."
            icon={SearchX}
            action={
              <button
                type="button"
                onClick={clear}
                className="text-sm font-semibold text-teal-dark transition-colors hover:text-navy"
              >
                Clear search
              </button>
            }
          />
        )}

        {hasQuery && results.length === 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-text">Popular pages</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {popularPages.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="inline-flex rounded-md border border-border bg-white px-3 py-1.5 text-sm text-navy transition-colors hover:border-teal hover:text-teal-dark"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasQuery && grouped.length > 0 && (
          <div className="space-y-10">
            {grouped.map((group) => (
              <div key={group.type}>
                <h2 className="text-lg font-semibold">
                  {group.type}
                  <span className="ml-2 text-sm font-normal text-muted">
                    ({group.items.length})
                  </span>
                </h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {group.items.map((entry) => (
                    <li
                      key={`${entry.type}-${entry.href}-${entry.title}`}
                      className="rounded-lg border border-border bg-white p-5 transition-shadow duration-200 hover:shadow-[0_8px_24px_-14px_rgba(8,47,67,0.28)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[16px] font-semibold leading-snug">
                          <Link
                            href={entry.href}
                            className="transition-colors hover:text-teal-dark focus-visible:text-teal-dark"
                          >
                            {entry.title}
                          </Link>
                        </h3>
                        <span className="shrink-0 rounded-full bg-soft-gray px-2.5 py-0.5 text-xs font-medium text-muted">
                          {entry.type}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {entry.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
