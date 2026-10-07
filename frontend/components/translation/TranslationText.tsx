import type { ReactNode } from "react";

/**
 * Replace the whole span when React changes its text. Translation engines may
 * replace text nodes with font elements; React must not reconcile those nodes.
 * Use only for display text, never for user-entered or private values.
 */
export default function TranslationText({ children }: { children: ReactNode }) {
  const text = String(children ?? "");
  return <span key={text}>{children}</span>;
}
