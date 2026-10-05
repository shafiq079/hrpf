import type { FocusArea } from "@/data/focusAreas";

interface FocusAreaCardProps {
  area: Pick<FocusArea, "title" | "description" | "icon">;
}

/** Compact card presenting a single human-rights focus area. */
export default function FocusAreaCard({ area }: FocusAreaCardProps) {
  const { title, description, icon: Icon } = area;

  return (
    <article className="flex h-full flex-col">
      <span className="flex h-11 w-11 items-center justify-center bg-teal/10 text-teal">
        <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        {description}
      </p>
    </article>
  );
}
