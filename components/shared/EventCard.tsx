import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import type { EventItem } from "@/data/events";
import { formatDate } from "@/lib/format";

interface EventCardProps {
  event: EventItem;
}

/** Event card with a calendar-style date block and key details. */
export default function EventCard({ event }: EventCardProps) {
  const { title, type, date, time, location, description, href, past } = event;
  const [year, month, day] = date.split("-");
  const monthShort = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ][Number(month) - 1];

  return (
    <article className="flex h-full gap-4 rounded-lg border border-border bg-white p-5">
      {/* Calendar-style date */}
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-md bg-navy text-white">
        <span className="text-xl font-semibold leading-none">{day}</span>
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide">
          {monthShort}
        </span>
        <span className="text-[10px] text-white/60">{year}</span>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="rounded bg-teal/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-dark">
            {type}
          </span>
          {past && (
            <span className="rounded bg-soft-gray px-2 py-0.5 text-[11px] font-medium text-muted">
              Past event
            </span>
          )}
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-snug">
          <Link
            href={href}
            className="transition-colors hover:text-teal-dark focus-visible:text-teal-dark"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">
          {description}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={date}>{formatDate(date)}</time>, {time}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {location}
          </span>
        </div>
      </div>
    </article>
  );
}
