import TranslationText from "@/components/translation/TranslationText";
import Link from "@/components/translation/TranslationLink";
import { ArrowRight } from "lucide-react";
import type { Campaign } from "@/data/campaigns";
import AppImage from "./AppImage";

interface CampaignCardProps {
  campaign: Campaign;
}

const statusStyles: Record<Campaign["status"], string> = {
  Active: "bg-teal text-white",
  Upcoming: "bg-gold text-navy",
  Completed: "bg-navy text-white",
};

/** Campaign card with image, status, goal and an illustrative progress bar. */
export default function CampaignCard({ campaign }: CampaignCardProps) {
  const { title, status, goal, description, image, imageAlt, href, progress } =
    campaign;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white transition-shadow duration-200 hover:shadow-[0_8px_24px_-14px_rgba(8,47,67,0.28)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <AppImage
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span
          className={`absolute left-3 top-3 z-10 rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyles[status]}`}
        >
          <TranslationText>{status}</TranslationText>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold">
          <Link
            href={href}
            className="transition-colors hover:text-teal-dark focus-visible:text-teal-dark"
          >
            <TranslationText>{title}</TranslationText>
          </Link>
        </h3>
        <p className="mt-1 text-sm font-medium text-teal-dark"><TranslationText>{goal}</TranslationText></p>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">
          <TranslationText>{description}</TranslationText>
        </p>

        {/* Progress */}
        <div className="mt-4">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-soft-gray"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${title} progress`}
          >
            <div
              className="h-full rounded-full bg-teal"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            <TranslationText>{progress}</TranslationText><TranslationText>% of awareness goal
          </TranslationText></p>
        </div>

        <Link
          href={href}
          className="group/link mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-dark transition-colors hover:text-navy"
        >
          <TranslationText>Join Campaign
          </TranslationText><ArrowRight
            className="h-4 w-4 transition-transform duration-150 group-hover/link:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
