import Link from "@/components/translation/TranslationLink";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";
import { collectionPage } from "@/lib/public-collections";
import { aboutSections } from "@/data/about";
import source from "@/data/about-source.json";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import ContentBlocks from "@/components/shared/ContentBlocks";
import PublicDocuments from "@/components/shared/PublicDocuments";
import PublicBoard from "@/components/shared/PublicBoard";
import AboutProfile, { RegistrationSummary } from "@/components/about/AboutProfile";
import SectionHeading from "@/components/shared/SectionHeading";
import TranslationText from "@/components/translation/TranslationText";
import LeadershipMessage from "@/components/about/LeadershipMessage";
import AimsObjectives from "@/components/about/AimsObjectives";
import MissionVision from "@/components/about/MissionVision";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ section: string }>; searchParams: Promise<{ page?: string | string[] }> };
export async function generateMetadata({ params }: Props) {
  const { section } = await params;
  const entry = aboutSections.find(item => item.slug === section);
  if (!entry) notFound();
  return createMetadata({ title: entry.label, description: entry.description, path: `/about/${section}` });
}
export default async function AboutSectionPage({ params, searchParams }: Props) {
  const { section } = await params;
  const entry = aboutSections.find(item => item.slug === section);
  if (!entry) notFound();
  const page = collectionPage((await searchParams).page);
  const title = section === "message-of-ceo" ? source.pages["chairman-message"].title : entry.label;
  return (
    <main id="main-content" className="flex-1">
      <PageHero eyebrow="ABOUT HRPF" title={title} description={entry.description} breadcrumbs={[{ label: "About Us", href: "/about" }, { label: entry.label }]} />
      {section === "who-we-are" ? <AboutProfile /> : (
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          {section === "progress-reports" ? <PublicDocuments kind="reports" page={page} /> :
           section === "registration-and-certificates" ? <>
             <SectionHeading title="Legal Status and Registration" description="The Foundation’s institutional records reflect its commitment to lawful and responsible organizational practices." />
             <div className="mt-8"><RegistrationSummary /></div>
             <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted"><TranslationText>The Charity Commission certificates record validity periods of 16 May 2022–15 May 2023 and 23 January 2024–22 January 2026. Registration history and document validity dates are shown below.</TranslationText></p>
             <div className="mt-10"><PublicDocuments kind="certificates" page={page} /></div>
           </> :
           section === "board-of-directors" ? <PublicBoard page={page} /> : section === "our-team" ? <PublicBoard kind="team" page={page} /> :
           section === "message-of-ceo" ? <LeadershipMessage /> :
           section === "mission-and-vision" ? <MissionVision /> :
           section === "aims-and-objectives" ? <AimsObjectives /> : (
            <div className="mx-auto max-w-3xl">
              <ContentBlocks blocks={source.pages["chairman-message"].blocks} />
            </div>
           )}
          <div className="mt-12 border-t border-border pt-6"><Link href="/about" className="text-sm font-semibold text-teal-dark">Explore About HRPF</Link></div>
        </Container>
      </section>
      )}
    </main>
  );
}
