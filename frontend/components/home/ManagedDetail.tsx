import { notFound } from "next/navigation";
import { readHomeDetail } from "@/lib/home-feed";
import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import Prose from "@/components/shared/Prose";
import AppImage from "@/components/shared/AppImage";
export default async function ManagedDetail({
  kind,
  slug,
}: {
  kind: "projects" | "news" | "blogs";
  slug: string;
}) {
  const row = await readHomeDetail(kind, slug);
  if (!row) notFound();
  return (
    <main id="main-content">
      <PageHero
        heroImage={kind === "projects" ? "teamwork" : "writing"}
        backgroundImage={row.image && !row.image.includes("project-placeholder") ? row.image : undefined}
        eyebrow="HRPF Pakistan"
        title={row.title}
        description={row.summary ?? row.excerpt}
        breadcrumbs={[{ label: kind === "projects" ? "Projects" : "Blogs", href: kind === "projects" ? "/projects" : "/blogs" }, { label: row.title }]}
      />
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl">
          {row.image && (
            <div className="relative mb-10 aspect-[16/10] overflow-hidden rounded-lg border border-border">
              <AppImage
                src={row.image}
                alt={row.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <Prose>
            {row.blocks.map(
              (
                b: { type: string; text?: string; items?: string[] },
                i: number,
              ) =>
                b.type === "heading" ? (
                  <h2 key={i}>{b.text}</h2>
                ) : b.type === "list" ? (
                  <ul key={i}>
                    {b.items?.map((item, n) => (
                      <li key={n}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={i}>{b.text}</p>
                ),
            )}
          </Prose>
        </div>
      </Container>
    </main>
  );
}
