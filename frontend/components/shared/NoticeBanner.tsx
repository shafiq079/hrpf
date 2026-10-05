import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import { AlertTriangle, Info, ShieldCheck } from "lucide-react";

type NoticeVariant = "info" | "warning" | "confidential";

interface NoticeBannerProps {
  variant?: NoticeVariant;
  title?: string;
  children: ReactNode;
  /** Override the default icon for the chosen variant. */
  icon?: ComponentType<LucideProps>;
}

const variantStyles: Record<
  NoticeVariant,
  { wrap: string; icon: string; defaultIcon: ComponentType<LucideProps> }
> = {
  info: {
    wrap: "border-border bg-soft-gray text-text",
    icon: "text-teal-dark",
    defaultIcon: Info,
  },
  warning: {
    wrap: "border-red/30 bg-red/5 text-text",
    icon: "text-red-dark",
    defaultIcon: AlertTriangle,
  },
  confidential: {
    wrap: "border-teal/30 bg-teal/5 text-text",
    icon: "text-teal-dark",
    defaultIcon: ShieldCheck,
  },
};

/**
 * Callout used for development notices, confidentiality messages and emergency
 * guidance. Information is conveyed by icon + text, not colour alone.
 */
export default function NoticeBanner({
  variant = "info",
  title,
  children,
  icon,
}: NoticeBannerProps) {
  const styles = variantStyles[variant];
  const Icon = icon ?? styles.defaultIcon;

  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${styles.wrap}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${styles.icon}`} aria-hidden="true" />
      <div className="text-sm leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? "mt-1 text-muted" : "text-muted"}>{children}</div>
      </div>
    </div>
  );
}
