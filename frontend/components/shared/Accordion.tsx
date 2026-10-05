"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export interface AccordionItem {
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Allow multiple panels open at once. Defaults to single-open. */
  allowMultiple?: boolean;
}

/** Accessible accordion using button + region semantics. */
export default function Accordion({
  items,
  allowMultiple = false,
}: AccordionProps) {
  const baseId = useId();
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setOpenSet((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-white">
      {items.map((item, index) => {
        const isOpen = openSet.has(index);
        const buttonId = `${baseId}-btn-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <div key={item.title}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-navy transition-colors hover:bg-soft-gray focus-visible:outline-2 focus-visible:-outline-offset-2"
              >
                {item.title}
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-teal-dark transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-5 pb-5 text-[15px] leading-relaxed text-muted"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
