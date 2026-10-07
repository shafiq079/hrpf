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
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          {section === "progress-reports" ? <PublicDocuments kind="reports" page={page} /> :
           section === "registration-and-certificates" ? <PublicDocuments kind="certificates" page={page} /> :
           section === "board-of-directors" ? <PublicBoard page={page} /> : section === "our-team" ? <PublicBoard kind="team" page={page} /> : (
            <div className="mx-auto max-w-3xl">
              {section === "mission-and-vision" ? <>
                <h2 className="font-serif text-2xl font-semibold text-navy">Our Mission</h2>
                <ContentBlocks blocks={source.pages.mission.blocks} />
                <h2 className="mt-12 font-serif text-2xl font-semibold text-navy">Our Vision</h2>
                <ContentBlocks blocks={source.pages.vision.blocks} />
              </> : <ContentBlocks blocks={section === "who-we-are" ? source.pages["who-we-are"].blocks : section === "aims-and-objectives" ? source.pages["aims-and-objectives"].blocks : source.pages["chairman-message"].blocks} />}
            </div>
           )}
          <div className="mt-12 border-t border-border pt-6"><Link href="/about" className="text-sm font-semibold text-teal-dark">Explore About HRPF</Link></div>
        </Container>
      </section>
    </main>
  );
}
