import { notFound } from "next/navigation";
import ContentView from "@/components/content/ContentView";
import { publicRead, type Content } from "@/lib/public-content";
export default async function Blog({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) notFound();
  const result = await publicRead<Content>(`blogs/${slug}`);
  if (result.status === "missing") notFound();
  return <ContentView title="Blog" result={result} />;
}
