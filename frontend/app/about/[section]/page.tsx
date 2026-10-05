import { notFound } from "next/navigation";
import ContentView from "@/components/content/ContentView";
import { ngoPages } from "@/data/ngo";
export function generateStaticParams() {
  return Object.keys(ngoPages).map((section) => ({ section }));
}
export default async function AboutSection({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const content = Object.hasOwn(ngoPages, section)
    ? ngoPages[section]
    : undefined;
  if (!content) notFound();
  return (
    <ContentView
      title={content.title}
      result={{ status: "ok", data: content }}
    />
  );
}
