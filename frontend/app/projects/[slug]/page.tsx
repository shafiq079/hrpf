import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readHomeDetail } from "@/lib/home-feed";
import { createMetadata } from "@/lib/seo";
import ProjectDetailView from "@/components/projects/ProjectDetailView";
import type { ProjectDetail } from "@/lib/project-details";

export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ locale?: string }>;
};
export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await searchParams;
  const project = (await readHomeDetail(
    "projects",
    slug,
    locale === "ur" ? "ur" : "en",
  )) as ProjectDetail | null;
  if (!project) return {};
  return createMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
}
export default async function ProjectPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { locale } = await searchParams;
  const project = (await readHomeDetail(
    "projects",
    slug,
    locale === "ur" ? "ur" : "en",
  )) as ProjectDetail | null;
  if (!project) notFound();
  return (
    <main
      id="main-content"
      className="flex-1"
      dir={locale === "ur" ? "rtl" : undefined}
    >
      <ProjectDetailView project={project} />
    </main>
  );
}
