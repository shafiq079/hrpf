"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import SearchInput from "@/components/shared/SearchInput";
import FilterSelect from "@/components/shared/FilterSelect";
import FilterBar from "@/components/shared/FilterBar";
import EmptyState from "@/components/shared/EmptyState";
import { projects } from "@/data/projects";
import { newsArticles } from "@/data/news";
import { reports } from "@/data/reports";
import { campaigns } from "@/data/campaigns";
import { events } from "@/data/events";

/*
  Fully client-side search over a static, in-memory index built from the
  project's data files plus a curated list of key pages. Nothing is fetched or
  persisted; results update as you type.
*/

type EntryType =
  | "Pages"
  | "Projects"
  | "News"
  | "Reports"
  | "Campaigns"
  | "Events";

interface IndexEntry {
  type: EntryType;
  title: string;
  description: string;
  href: string;
}

const entryTypes: EntryType[] = [
  "Pages",
  "Projects",
  "News",
  "Reports",
  "Campaigns",
  "Events",
];

const pageEntries: IndexEntry[] = [
  {
    type: "Pages",
    title: "About HRPF",
    description:
      "Who we are, our mission, vision and approach to human-rights protection.",
    href: "/about",
  },
  {
    type: "Pages",
    title: "Our Work",
    description:
      "Focus areas including women's rights, children's rights and access to justice.",
    href: "/our-work",
  },
  {
    type: "Pages",
    title: "Impact",
    description:
      "How we measure and report on the difference our work makes.",
    href: "/impact",
  },
  {
    type: "Pages",
    title: "Get Involved",
    description:
      "Volunteer, become a member, join a campaign or contribute your skills.",
    href: "/get-involved",
  },
  {
    type: "Pages",
    title: "Donate",
    description: "Support responsible human-rights protection with a donation.",
    href: "/donate",
  },
  {
    type: "Pages",
    title: "Contact",
    description: "Get in touch with the HRPF team.",
    href: "/contact",
  },
  {
    type: "Pages",
    title: "Reports and Resources",
    description:
      "Annual reports, research, policy briefs, guides and awareness materials.",
    href: "/reports",
  },
  {
    type: "Pages",
    title: "Team",
    description: "Meet the people behind HRPF's programmes and operations.",
    href: "/team",
  },
  {
    type: "Pages",
    title: "Governance",
    description:
      "Our governance structure, accountability and organizational policies.",
    href: "/governance",
  },
  {
    type: "Pages",
    title: "FAQ",
    description:
      "Answers to common questions about HRPF, reporting, help and privacy.",
    href: "/faq",
  },
  {
    type: "Pages",
    title: "Partner With Us",
    description:
      "Explore responsible partnerships and submit a partnership inquiry.",
    href: "/partner-with-us",
  },
  {
    type: "Pages",
    title: "Get Help",
    description:
      "Request general information, guidance or referral to appropriate support.",
    href: "/get-help",
  },
  {
    type: "Pages",
    title: "Report a Violation",
    description:
      "Confidentially report a human-rights concern, including anonymously.",
    href: "/report-a-violation",
  },
  {
    type: "Pages",
    title: "Complaints",
    description:
      "Share feedback or a complaint about HRPF and how we work.",
    href: "/complaints",
  },
];

const searchIndex: IndexEntry[] = [
  ...pageEntries,
  ...projects.map((project) => ({
    type: "Projects" as const,
    title: project.title,
    description: project.summary,
    href: project.href,
  })),
  ...newsArticles.map((article) => ({
    type: "News" as const,
    title: article.title,
    description: article.summary,
    href: article.href,
  })),
  ...reports.map((report) => ({
    type: "Reports" as const,
    title: report.title,
    description: report.summary,
    href: "/reports",
  })),
  ...campaigns.map((campaign) => ({
    type: "Campaigns" as const,
    title: campaign.title,
    description: campaign.description,
    href: campaign.href,
  })),
  ...events.map((event) => ({
    type: "Events" as const,
    title: event.title,
    description: event.description,
    href: event.href,
  })),
];

const popularPages = pageEntries.slice(0, 6);

export default function SearchExplorer() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");

  const trimmedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!trimmedQuery) return [];
    return searchIndex.filter((entry) => {
      const matchesType = !type || entry.type === type;
      if (!matchesType) return false;
      const haystack = `${entry.title} ${entry.description}`.toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [trimmedQuery, type]);

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
            placeholder="Search pages, projects, news, reports…"
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
        Results are matched by title and description across this site&apos;s
        content, ordered by content type.
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
            description="Search across pages, projects, news, reports, campaigns and events."
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
