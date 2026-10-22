import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Legacy animation option; retained for existing callers and ignored. */
  delay?: number;
  className?: string;
}

/**
 * Keep content visible in server-rendered HTML. Reading the homepage must not
 * depend on JavaScript hydration or a scroll animation completing.
 */
export default function Reveal({
  children,
  className = "",
}: RevealProps) {
  return <div className={className}>{children}</div>;
}
