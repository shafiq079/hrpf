import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

export type ButtonVariant =
  | "teal"
  | "navy"
  | "gold"
  | "red"
  | "outline"
  | "outlineDark";
export type ButtonSize = "md" | "lg";

interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Optional leading or trailing Lucide icon. */
  icon?: ComponentType<LucideProps>;
  iconPosition?: "left" | "right";
  className?: string;
  fullWidth?: boolean;
}

interface LinkButtonProps extends BaseProps {
  href: string;
  type?: never;
  onClick?: never;
}

interface ActionButtonProps extends BaseProps {
  href?: never;
  type?: "button" | "submit";
  onClick?: () => void;
}

type PrimaryButtonProps = LinkButtonProps | ActionButtonProps;

const variantStyles: Record<ButtonVariant, string> = {
  // Brand accent (links / secondary brand actions)
  teal: "bg-teal text-white hover:bg-teal-dark active:bg-teal-dark",
  // Main institutional buttons
  navy: "bg-navy text-white hover:bg-navy-dark active:bg-navy-dark",
  // Donate / important CTA — warm gold with navy text
  gold: "bg-gold text-navy hover:bg-gold-dark active:bg-gold-dark",
  // Urgent: Report a Violation
  red: "bg-red text-white hover:bg-red-dark active:bg-red-dark",
  outline:
    "border border-navy/20 bg-transparent text-navy hover:border-navy hover:bg-navy/5",
  outlineDark:
    "border border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-[15px]",
};

/**
 * Shared call-to-action button. Renders a Next.js Link when `href` is provided,
 * otherwise a native <button>. Supports the institutional color variants.
 */
export default function PrimaryButton(props: PrimaryButtonProps) {
  const {
    children,
    variant = "navy",
    size = "md",
    icon: Icon,
    iconPosition = "right",
    className = "",
    fullWidth = false,
  } = props;

  const classes = [
    "group inline-flex items-center justify-center gap-2 rounded-md font-semibold",
    "transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconEl = Icon ? (
    <Icon
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 transition-transform duration-150 ${
        iconPosition === "right"
          ? "group-hover:translate-x-0.5"
          : "group-hover:-translate-x-0.5"
      }`}
    />
  ) : null;

  const content = (
    <>
      {iconPosition === "left" && iconEl}
      {children}
      {iconPosition === "right" && iconEl}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      className={classes}
    >
      {content}
    </button>
  );
}
