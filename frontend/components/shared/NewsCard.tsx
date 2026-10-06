import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NewsArticle } from "@/data/news";
import AppImage from "./AppImage";
import { formatDate } from "@/lib/format";

interface NewsCardProps {
  article: NewsArticle;
  dateLabel?: string;
}

/** Editorial article card for the Latest News section. */
export default function NewsCard({ article, dateLabel }: NewsCardProps) {
  const { category, title, summary, image, imageAlt, href, date, readingTime } =
    article;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white transition-shadow duration-200 hover:shadow-[0_8px_24px_-14px_rgba(8,47,67,0.28)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <AppImage
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow">{category}</p>
        <h3 className="mt-2 text-[19px] font-semibold leading-snug">
          <Link
            href={href}
            className="transition-colors hover:text-teal-dark focus-visible:text-teal-dark"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">
          {summary}
        </p>
        <p className="mt-4 text-xs text-muted">
          {dateLabel ? (
            <span>{dateLabel}</span>
          ) : (
            <time dateTime={date}>{formatDate(date)}</time>
          )}
          <span aria-hidden="true"> · </span>
          {readingTime}
        </p>
        <Link
          href={href}
          className="group/link mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-dark transition-colors hover:text-navy"
          aria-label={`Read the story: ${title}`}
        >
          Read Story
          <ArrowRight
            className="h-4 w-4 transition-transform duration-150 group-hover/link:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
