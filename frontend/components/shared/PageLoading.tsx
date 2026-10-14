import type { ReactNode } from "react";
import Container from "./Container";

export default function PageLoading({ variant = "cards", hero }: { variant?: "cards" | "article" | "admin"; hero?: ReactNode }) {
  return <main id="main-content" aria-busy="true" className="flex-1" data-page-loading={variant}>
    <div aria-hidden="true" className="hrpf-navigation-progress"><span className="hrpf-loading-runner" /></div>
    <p role="status" className="sr-only">Loading page content…</p>
    {hero ?? (variant !== "admin" && <div aria-hidden="true" className="bg-navy py-16 sm:py-20"><Container>
      <div className="hrpf-skeleton h-3 w-28 bg-white/15" />
      <div className="hrpf-skeleton mt-5 h-10 w-3/4 max-w-lg bg-white/15" />
      <div className="hrpf-skeleton mt-5 h-4 w-full max-w-xl bg-white/15" />
    </Container></div>)}
    <section className="bg-off-white py-12 sm:py-16"><Container>
      <div aria-hidden="true">
        {variant === "admin" && <div className="hrpf-skeleton mb-8 h-12 w-full bg-navy/10" />}
        {variant === "article" ? <div className="mx-auto max-w-3xl space-y-5">
          <div className="hrpf-skeleton aspect-video w-full bg-navy/10" />
          {Array.from({ length: 8 }, (_, index) => <div key={index} className={`hrpf-skeleton h-4 bg-navy/10 ${index % 3 === 2 ? "w-3/4" : "w-full"}`} />)}
        </div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="overflow-hidden rounded-lg border border-border bg-white">
            <div className="hrpf-skeleton aspect-[4/3] bg-navy/10" />
            <div className="space-y-4 p-6"><div className="hrpf-skeleton h-5 w-4/5 bg-navy/10" /><div className="hrpf-skeleton h-4 w-full bg-navy/10" /><div className="hrpf-skeleton h-4 w-2/3 bg-navy/10" /></div>
          </div>)}
        </div>}
      </div>
    </Container></section>
  </main>;
}
