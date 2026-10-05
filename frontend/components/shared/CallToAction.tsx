import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import Container from "./Container";
import PrimaryButton from "./PrimaryButton";
import type { ButtonVariant } from "./PrimaryButton";

export interface CtaAction {
  label: string;
  href: string;
  variant?: ButtonVariant;
  icon?: ComponentType<LucideProps>;
  iconPosition?: "left" | "right";
}

interface CallToActionProps {
  title: string;
  description?: string;
  actions: CtaAction[];
  /** Navy (default) or soft light band. */
  tone?: "navy" | "light";
}

/** Reusable closing call-to-action band, matching the homepage style. */
export default function CallToAction({
  title,
  description,
  actions,
  tone = "navy",
}: CallToActionProps) {
  const isNavy = tone === "navy";

  return (
    <section className={isNavy ? "bg-navy py-16 lg:py-20" : "bg-soft-gray py-16 lg:py-20"}>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className={`text-[26px] leading-tight sm:text-[32px] lg:text-[36px] ${
              isNavy ? "text-white" : ""
            }`}
          >
            {title}
          </h2>
          {description && (
            <p
              className={`mx-auto mt-4 max-w-xl text-[15px] leading-relaxed sm:text-base ${
                isNavy ? "text-white/80" : "text-muted"
              }`}
            >
              {description}
            </p>
          )}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            {actions.map((action) => (
              <PrimaryButton
                key={action.label}
                href={action.href}
                variant={action.variant ?? "navy"}
                size="lg"
                icon={action.icon}
                iconPosition={action.iconPosition ?? "right"}
              >
                {action.label}
              </PrimaryButton>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
