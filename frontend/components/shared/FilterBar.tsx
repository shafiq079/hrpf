import type { ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
  /** Optional right-aligned slot (e.g. a "Clear filters" button). */
  actions?: ReactNode;
}

/**
 * Presentational wrapper that lays out filter controls in a bordered bar.
 * State is owned by the parent (client) page.
 */
export default function FilterBar({ children, actions }: FilterBarProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          {children}
        </div>
        {actions && <div className="flex items-end">{actions}</div>}
      </div>
    </div>
  );
}
