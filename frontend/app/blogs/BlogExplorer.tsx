"use client";
import TranslationText from "@/components/translation/TranslationText";

import { useMemo, useState } from "react";
import { Newspaper } from "lucide-react";
import type { NewsArticle } from "@/data/news";
import SearchInput from "@/components/shared/SearchInput";
import FilterSelect from "@/components/shared/FilterSelect";
import FilterBar from "@/components/shared/FilterBar";
import NewsCard from "@/components/shared/NewsCard";
import EmptyState from "@/components/shared/EmptyState";

/** Search and filter the current page of published blogs. */
export default function BlogExplorer({ articles }: { articles: NewsArticle[] }) {
  const newsArticles = articles;
  const newsCategories = [...new Set(articles.map(article => article.category))];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");

  const years = useMemo(() => {
    const unique = new Set(newsArticles.map((article) => article.date.slice(0, 4)));
    return Array.from(unique).sort((a, b) => b.localeCompare(a));
  }, [newsArticles]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return newsArticles.filter((article) => {
      const matchesQuery =
        normalized === "" ||
        article.title.toLowerCase().includes(normalized) ||
        article.summary.toLowerCase().includes(normalized);
      const matchesCategory =
        category === "" || article.category === category;
      const matchesYear = year === "" || article.date.slice(0, 4) === year;
      return matchesQuery && matchesCategory && matchesYear;
    });
  }, [query, category, year, newsArticles]);

  const hasFilters = query !== "" || category !== "" || year !== "";

  function clearFilters() {
    setQuery("");
    setCategory("");
    setYear("");
  }

  return (
    <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[75rem] px-[18px] sm:px-6">
        <FilterBar
          actions={
            hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-teal-dark transition-colors hover:text-navy"
              >
                <TranslationText>Clear filters
              </TranslationText></button>
            ) : undefined
          }
        >
          <div className="w-full sm:w-64">
            <SearchInput
              value={query}
              onChange={setQuery}
              label="Search blogs on this page"
              placeholder="Search blogs on this page..."
              id="blog-search"
            />
          </div>
          <FilterSelect
            id="blog-category"
            label="Category"
            value={category}
            onChange={setCategory}
            options={newsCategories}
            allLabel="All categories"
          />
          <FilterSelect
            id="blog-year"
            label="Year"
            value={year}
            onChange={setYear}
            options={years}
            allLabel="All years"
          />
        </FilterBar>

        <div className="mt-6">
          <p className="text-sm text-muted">
            <TranslationText>Showing </TranslationText><TranslationText>{filtered.length}</TranslationText>{" "}
            <TranslationText>{filtered.length === 1 ? "article" : "articles"}</TranslationText>
          </p>
        </div>

        {filtered.length > 0 ? (
          <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <li key={article.slug}>
                <NewsCard article={article} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={Newspaper}
              title="No articles found"
              description="Try adjusting your search terms or filters to see more results."
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-semibold text-teal-dark transition-colors hover:text-navy"
                >
                  <TranslationText>Clear filters
                </TranslationText></button>
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
