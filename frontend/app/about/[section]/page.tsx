import { notFound } from "next/navigation";
import ContentView from "@/components/content/ContentView";
import { publicRead, type Content } from "@/lib/public-content";
const sections: Record<string, string> = {
  "who-we-are": "Who We Are",
  mission: "Mission",
  vision: "Vision",
  "core-values": "Core Values",
  "aims-and-objectives": "Aims and Objectives",
  "chairman-message": "Chairman’s Message",
  "our-approach": "Our Approach",
  "our-commitment": "Our Commitment",
  "thematic-pillars": "Thematic Pillars",
  "areas-of-work": "Areas of Work",
};
export default async function AboutSection({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!sections[section]) notFound();
  return (
    <ContentView
      title={sections[section]}
      result={await publicRead<Content>(`content/${section}`)}
    />
  );
}
