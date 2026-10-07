"use client";
import TranslationText from "@/components/translation/TranslationText";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { type Project, projectStatuses } from "@/data/projects";
import SearchInput from "@/components/shared/SearchInput";
import FilterSelect from "@/components/shared/FilterSelect";
import FilterBar from "@/components/shared/FilterBar";
import ProjectCard from "@/components/shared/ProjectCard";
import EmptyState from "@/components/shared/EmptyState";
import PrimaryButton from "@/components/shared/PrimaryButton";

const INITIAL_VISIBLE = 6;

/** Client-side search, filtering and progressive loading for projects. */
export default function ProjectsExplorer({ projects }: { projects: (Project & { startedLabel?: string })[] }) {
  const [query, setQuery] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const focusAreaOptions = useMemo(
    () => Array.from(new Set(projects.map((p) => p.focusArea))).sort(),
    [projects],
  );
  const locationOptions = useMemo(
    () => Array.from(new Set(projects.map((p) => p.location))).sort(),
    [projects],
  );
  const yearOptions = useMemo(
    () =>
      Array.from(new Set(projects.filter((p) => p.startYear > 0).map((p) => String(p.startYear)))).sort(
        (a, b) => Number(b) - Number(a),
      ),
    [projects],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesQuery =
        normalizedQuery === "" ||
        project.title.toLowerCase().includes(normalizedQuery) ||
        project.summary.toLowerCase().includes(normalizedQuery);
      const matchesFocusArea =
        focusArea === "" || project.focusArea === focusArea;
      const matchesStatus = status === "" || project.status === status;
      const matchesLocation = location === "" || project.location === location;
      const matchesYear = year === "" || String(project.startYear) === year;
      return (
        matchesQuery &&
        matchesFocusArea &&
        matchesStatus &&
        matchesLocation &&
        matchesYear
      );
    });
  }, [projects, query, focusArea, status, location, year]);

  const hasFilters =
    query !== "" ||
    focusArea !== "" ||
    status !== "" ||
    location !== "" ||
    year !== "";

  const clearFilters = () => {
    setQuery("");
    setFocusArea("");
    setStatus("");
    setLocation("");
    setYear("");
    setVisibleCount(INITIAL_VISIBLE);
  };

  const visibleProjects = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visibleProjects.length;

  return (
    <div>
      <FilterBar
        actions={
          hasFilters ? (
            <PrimaryButton
              type="button"
              onClick={clearFilters}
              variant="outline"
              size="md"
            >
              <TranslationText>Clear filters
            </TranslationText></PrimaryButton>
          ) : undefined
        }
      >
        <div className="w-full sm:w-64">
          <SearchInput
            value={query}
            onChange={(value) => {
              setQuery(value);
              setVisibleCount(INITIAL_VISIBLE);
            }}
            label="Search projects"
            placeholder="Search projects..."
            id="projects-search"
          />
        </div>
        <FilterSelect
          id="projects-focus-area"
          label="Focus area"
          value={focusArea}
          onChange={(value) => {
            setFocusArea(value);
            setVisibleCount(INITIAL_VISIBLE);
          }}
          options={focusAreaOptions}
          allLabel="All focus areas"
        />
        <FilterSelect
          id="projects-status"
          label="Status"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setVisibleCount(INITIAL_VISIBLE);
          }}
          options={projectStatuses}
          allLabel="All statuses"
        />
        <FilterSelect
          id="projects-location"
          label="Location"
          value={location}
          onChange={(value) => {
            setLocation(value);
            setVisibleCount(INITIAL_VISIBLE);
          }}
          options={locationOptions}
          allLabel="All locations"
        />
        <FilterSelect
          id="projects-year"
          label="Start year"
          value={year}
          onChange={(value) => {
            setYear(value);
            setVisibleCount(INITIAL_VISIBLE);
          }}
          options={yearOptions}
          allLabel="All years"
        />
      </FilterBar>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        <TranslationText>Showing </TranslationText><TranslationText>{visibleProjects.length}</TranslationText> <TranslationText>of </TranslationText><TranslationText>{filtered.length}</TranslationText>{" "}
        <TranslationText>{filtered.length === 1 ? "project" : "projects"}</TranslationText>
      </p>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={SearchX}
            title="No projects found"
            description="Try adjusting your search or filters."
            action={
              <PrimaryButton
                type="button"
                onClick={clearFilters}
                variant="navy"
                size="md"
              >
                <TranslationText>Clear filters
              </TranslationText></PrimaryButton>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} startedLabel={project.startedLabel} />
            ))}
          </div>

          {remaining > 0 && (
            <div className="mt-10 flex justify-center">
              <PrimaryButton
                type="button"
                onClick={() =>
                  setVisibleCount((count) => count + INITIAL_VISIBLE)
                }
                variant="outline"
                size="lg"
              >
                <TranslationText>Load More
              </TranslationText></PrimaryButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}
