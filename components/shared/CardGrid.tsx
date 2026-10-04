import type { ReactNode } from "react";

type Cols = 2 | 3 | 4 | 5;

const colClasses: Record<Cols, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
};

interface CardGridProps {
  children: ReactNode;
  cols?: Cols;
  as?: "ul" | "ol" | "div";
  className?: string;
}

/**
 * Tight institutional border-grid: shared edges, no gutters between cells.
 * Pair with `cardGridCellClass` on each direct child.
 */
export default function CardGrid({
  children,
  cols = 3,
  as: Tag = "ul",
  className = "",
}: CardGridProps) {
  return (
    <Tag
      className={`grid gap-0 border-l border-t border-border ${colClasses[cols]} ${className}`}
    >
      {children}
    </Tag>
  );
}

/** Apply to each direct child of CardGrid (li / article / div). */
export const cardGridCellClass =
  "flex h-full flex-col border-b border-r border-border bg-white p-6";
