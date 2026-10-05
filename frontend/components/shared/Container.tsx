import type { ElementType, ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Render as a different semantic element (e.g. "section", "header"). */
  as?: ElementType;
}

/**
 * Centered content container shared across the whole site.
 * Enforces the editorial max-width and responsive horizontal padding.
 */
export default function Container({
  children,
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={`mx-auto w-full max-w-[75rem] px-[18px] sm:px-6 ${className}`}
    >
      {children}
    </Tag>
  );
}
