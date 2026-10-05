"use client";

import { useMemo, useState } from "react";
import { CalendarX } from "lucide-react";
import SearchInput from "@/components/shared/SearchInput";
import FilterSelect from "@/components/shared/FilterSelect";
import FilterBar from "@/components/shared/FilterBar";
import EventCard from "@/components/shared/EventCard";
import EmptyState from "@/components/shared/EmptyState";
import { events, eventTypes } from "@/data/events";
import type { EventItem } from "@/data/events";

export default function EventsExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter((event) => {
      const matchesQuery =
        !normalizedQuery ||
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.description.toLowerCase().includes(normalizedQuery);
      const matchesCategory = !category || event.type === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  const upcoming = filtered.filter((event) => !event.past);
  const past = filtered.filter((event) => event.past);

  const renderList = (list: EventItem[]) => (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {list.map((event) => (
        <EventCard key={event.slug} event={event} />
      ))}
    </div>
  );

  return (
    <div>
      <FilterBar>
        <div className="w-full sm:w-72">
          <SearchInput
            id="events-search"
            label="Search events"
            placeholder="Search events..."
            value={query}
            onChange={setQuery}
          />
        </div>
        <FilterSelect
          id="events-category"
          label="Event type"
          value={category}
          onChange={setCategory}
          options={eventTypes}
          allLabel="All types"
        />
      </FilterBar>

      <section className="mt-10">
        <h2 className="text-[22px] font-semibold sm:text-[26px]">
          Upcoming events
        </h2>
        <div className="mt-6">
          {upcoming.length > 0 ? (
            renderList(upcoming)
          ) : (
            <EmptyState
              icon={CalendarX}
              title="No upcoming events"
              description="No upcoming events match your search. Try adjusting your filters."
            />
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[22px] font-semibold sm:text-[26px]">Past events</h2>
        <div className="mt-6">
          {past.length > 0 ? (
            renderList(past)
          ) : (
            <EmptyState
              icon={CalendarX}
              title="No past events"
              description="No past events match your search. Try adjusting your filters."
            />
          )}
        </div>
      </section>
    </div>
  );
}
