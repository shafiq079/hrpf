import { Tv } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import { collectionPage, readPublicCollection, type PublicInterview } from "@/lib/public-collections";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import EmptyState from "@/components/shared/EmptyState";
import CollectionPagination from "@/components/shared/CollectionPagination";
import InterviewGrid from "@/components/gallery/InterviewGrid";
export const dynamic = "force-dynamic";
export const metadata = createMetadata({
  title: "TV Interviews",
  description: "Watch published television interviews and conversations about HRPF’s advocacy.",
  path: "/gallery/tv-interviews"
});
export default async function TVInterviewsPage({
  searchParams
}: {
  searchParams: Promise<{
    page?: string | string[];
    q?: string;
  }>;
}) {
  const params = await searchParams,
    page = collectionPage(params.page),
    q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const result = await readPublicCollection<PublicInterview>("interviews", page, undefined, 12, "en", q);
  return <main id="main-content" className="flex-1"><PageHero eyebrow="GALLERY" title="TV Interviews" description="Television conversations about human rights and the Foundation’s work." breadcrumbs={[{
      label: "Gallery",
      href: "/gallery"
    }, {
      label: "TV Interviews"
    }]} /><section className="bg-off-white py-12 sm:py-16"><Container>
    <form action="/gallery/tv-interviews" className="mb-8 flex max-w-lg gap-2"><label className="flex-1"><span className="sr-only">Search interviews</span><input name="q" defaultValue={q} maxLength={80} placeholder="Search interviews…" className="w-full rounded-md border border-border bg-white px-4 py-3 text-sm" /></label><button className="rounded-md bg-teal-dark px-4 py-3 text-sm font-semibold text-white">Search</button></form>
    {result.data.length ? <InterviewGrid items={result.data} /> : <EmptyState icon={Tv} title={result.status === "unavailable" ? "Interviews temporarily unavailable" : q ? "No matching interviews" : "Interview recordings are not available here yet"} description={result.status === "unavailable" ? "Please try again later." : "You can visit HRPF Pakistan’s YouTube channel for available videos."} action={<a href="https://youtube.com/@hrpfpakistan" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-teal-dark">Visit HRPF on YouTube <span className="sr-only">(opens in a new tab)</span></a>} />}
    <CollectionPagination path="/gallery/tv-interviews" page={page} pages={result.pages} query={q ? {
          q
        } : {}} />
  </Container></section></main>;
}
