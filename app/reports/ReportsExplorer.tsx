"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { reports, resourceCategories } from "@/data/reports";
import SearchInput from "@/components/shared/SearchInput";
import FilterSelect from "@/components/shared/FilterSelect";
import FilterBar from "@/components/shared/FilterBar";
import ResourceCard from "@/components/shared/ResourceCard";
import EmptyState from "@/components/shared/EmptyState";
import Container from "@/components/shared/Container";

/** Client-side search and filtering for the reports & resources library. */
export default function ReportsExplorer() {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");
  const [fileType, setFileType] = useState("");
  const [language, setLanguage] = useState("");

  const years = useMemo(() => {
    const unique = new Set(reports.map((report) => String(report.year)));
    return Array.from(unique).sort((a, b) => b.localeCompare(a));
  }, []);

  const fileTypes = useMemo(() => {
    return Array.from(new Set(reports.map((report) => report.fileType))).sort();
  }, []);

  const languages = useMemo(() => {
    return Array.from(new Set(reports.map((report) => report.language))).sort();
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesQuery =
        normalized === "" ||
        report.title.toLowerCase().includes(normalized) ||
        report.summary.toLowerCase().includes(normalized);
      const matchesYear = year === "" || String(report.year) === year;
      const matchesCategory = category === "" || report.category === category;
      const matchesFileType = fileType === "" || report.fileType === fileType;
      const matchesLanguage = language === "" || report.language === language;
      return (
        matchesQuery &&
        matchesYear &&
        matchesCategory &&
        matchesFileType &&
        matchesLanguage
      );
    });
  }, [query, year, category, fileType, language]);

  const hasFilters =
    query !== "" ||
    year !== "" ||
    category !== "" ||
    fileType !== "" ||
    language !== "";

  function clearFilters() {
    setQuery("");
    setYear("");
    setCategory("");
    setFileType("");
    setLanguage("");
  }

  return (
    <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
      <Container>
        <FilterBar
          actions={
            hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-teal-dark transition-colors hover:text-navy"
              >
                Clear filters
              </button>
            ) : undefined
          }
        >
          <div className="w-full sm:w-64">
            <SearchInput
              value={query}
              onChange={setQuery}
              label="Search resources"
              placeholder="Search reports..."
              id="reports-search"
            />
          </div>
          <FilterSelect
            id="reports-year"
            label="Year"
            value={year}
            onChange={setYear}
            options={years}
            allLabel="All years"
          />
          <FilterSelect
            id="reports-category"
            label="Topic"
            value={category}
            onChange={setCategory}
            options={resourceCategories}
            allLabel="All topics"
          />
          <FilterSelect
            id="reports-type"
            label="Document type"
            value={fileType}
            onChange={setFileType}
            options={fileTypes}
            allLabel="All types"
          />
          <FilterSelect
            id="reports-language"
            label="Language"
            value={language}
            onChange={setLanguage}
            options={languages}
            allLabel="All languages"
          />
        </FilterBar>

        <p className="mt-6 text-sm text-muted">
          Showing {filtered.length}{" "}
          {filtered.length === 1 ? "resource" : "resources"}
        </p>

        {filtered.length > 0 ? (
          <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((report) => (
              <li key={report.slug}>
                <ResourceCard resource={report} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={FileText}
              title="No resources found"
              description="Try adjusting your search terms or filters to see more results."
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-semibold text-teal-dark transition-colors hover:text-navy"
                >
                  Clear filters
                </button>
              }
            />
          </div>
        )}
      </Container>
    </section>
  );
}
