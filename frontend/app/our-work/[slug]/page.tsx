import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";
import { focusAreas, getFocusArea } from "@/data/focusAreas";
import WorkAreaView from "@/components/work/WorkAreaView";
import { getWorkAreaContent } from "@/data/workAreas";

export function generateStaticParams() {
  return focusAreas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = getFocusArea(slug);
  if (!area) return {};
  return createMetadata({
    title: area.title,
    description: getWorkAreaContent(slug)?.description ?? area.description,
    path: `/our-work/${slug}`,
  });
}

export default async function FocusAreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = getWorkAreaContent(slug);
  if (!content) notFound();
  return <WorkAreaView content={content} />;
}
