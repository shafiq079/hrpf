import Link from "@/components/translation/TranslationLink";
import { Camera, Tv, ArrowRight } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";

export const metadata = createMetadata({ title: "Gallery", description: "Explore HRPF’s media coverage and TV interviews.", path: "/gallery" });
const categories = [
  { label: "Media Coverage", href: "/gallery/media-coverage", icon: Camera, description: "Browse published press coverage and media images documenting HRPF’s work." },
  { label: "TV Interviews", href: "/gallery/tv-interviews", icon: Tv, description: "Find television interviews and conversations about HRPF’s human-rights advocacy." },
];
export default function GalleryPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero heroImage="camera" eyebrow="GALLERY" title="HRPF in the Media" description="Explore media coverage and interviews connected with the Foundation’s work."
        breadcrumbs={[{ label: "Gallery" }]} />
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container><ul className="grid gap-6 md:grid-cols-2">
          {categories.map(category => (
            <li key={category.href} className="rounded-lg border border-border bg-white p-8">
              <category.icon className="h-10 w-10 text-teal-dark" aria-hidden="true" />
              <h2 className="mt-5 font-serif text-2xl font-semibold text-navy"><Link href={category.href}>{category.label}</Link></h2>
              <p className="mt-3 leading-relaxed text-muted">{category.description}</p>
              <Link href={category.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-dark" aria-label={`Explore ${category.label}`}>
                Explore <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul></Container>
      </section>
    </main>
  );
}
