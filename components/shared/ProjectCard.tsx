import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Project } from "@/data/projects";
import AppImage from "./AppImage";

interface ProjectCardProps {
  project: Project;
}

const statusStyles: Record<Project["status"], string> = {
  Ongoing: "bg-teal text-white",
  Completed: "bg-navy text-white",
  Proposed: "bg-gold text-navy",
  "Emergency Response": "bg-red text-white",
};

/** Project card with image, status badge, focus area, location and summary. */
export default function ProjectCard({ project }: ProjectCardProps) {
  const {
    title,
    focusArea,
    status,
    summary,
    image,
    imageAlt,
    href,
    location,
    startYear,
  } = project;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white transition-shadow duration-200 hover:shadow-[0_8px_24px_-14px_rgba(8,47,67,0.28)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <AppImage
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span
          className={`absolute left-3 top-3 z-10 rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow">{focusArea}</p>
        <h3 className="mt-2 text-xl font-semibold">
          <Link
            href={href}
            className="transition-colors hover:text-teal-dark focus-visible:text-teal-dark"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">
          {summary}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {location}
          </span>
          <span>Started {startYear}</span>
        </div>
        <Link
          href={href}
          className="group/link mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-dark transition-colors hover:text-navy"
          aria-label={`View project: ${title}`}
        >
          View Project
          <ArrowRight
            className="h-4 w-4 transition-transform duration-150 group-hover/link:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
