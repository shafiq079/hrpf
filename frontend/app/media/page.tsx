import { Download, Newspaper, User } from "lucide-react";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import EmptyState from "@/components/shared/EmptyState";
import NewsCard from "@/components/shared/NewsCard";
import AppImage from "@/components/shared/AppImage";
import { createMetadata } from "@/lib/seo";
import { newsArticles } from "@/data/news";
import MediaInquiryForm from "./MediaInquiryForm";

export const metadata = createMetadata({
  title: "Media Centre",
  description:
    "Press releases, media statements, resources and media inquiry contact for journalists and editors.",
  path: "/media",
});

const pressReleases = newsArticles.filter(
  (article) => article.category === "Press Releases",
);

const galleryPhotos = Array.from({ length: 6 }, (_, index) => ({
  src: `/images/media/photo-${index + 1}.jpg`,
  alt: `HRPF activity photograph ${index + 1} (placeholder image).`,
}));

export default function MediaPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="MEDIA CENTRE"
        title="Media Centre"
        description="Press releases, media statements, resources and media inquiry contact for journalists and editors."
        breadcrumbs={[{ label: "Media" }]}
      />

      {/* Press Releases */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            title="Press Releases"
            description="Official announcements and statements issued by HRPF."
          />
          <div className="mt-10">
            {pressReleases.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pressReleases.map((article) => (
                  <NewsCard key={article.slug} article={article} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No press releases yet"
                description="Official press releases will be listed here once published."
                icon={Newspaper}
              />
            )}
          </div>
        </Container>
      </section>

      {/* Media Statements */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            title="Media Statements"
            description="Short public statements responding to specific issues or events."
          />
          <div className="mt-10">
            <EmptyState title="No statements published yet" />
          </div>
        </Container>
      </section>

      {/* HRPF in the News */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            title="HRPF in the News"
            description="Selected external coverage that mentions HRPF's work."
          />
          <div className="mt-10">
            <EmptyState
              title="No verified coverage yet"
              description="Verified external media coverage will be listed here once available."
            />
          </div>
        </Container>
      </section>

      {/* Photo Gallery */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            title="Photo Gallery"
            description="A selection of imagery for editorial use."
          />
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {galleryPhotos.map((photo) => (
              <li key={photo.src}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
                  <AppImage
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Video Gallery */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            title="Video Gallery"
            description="Recordings of events, explainers and campaign videos."
          />
          <div className="mt-10">
            <EmptyState title="No videos published yet" />
          </div>
        </Container>
      </section>

      {/* Brand Resources */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            title="Brand Resources"
            description="Logos and brand guidance for approved editorial use."
          />
          <div className="mt-8 max-w-xl rounded-lg border border-border bg-white p-6 sm:p-8">
            <h3 className="text-[18px] font-semibold">Logo pack</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              A downloadable pack of HRPF logos and usage guidance will be
              available here. The download is not yet available.
            </p>
            <button
              type="button"
              disabled
              title="File coming soon"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
              Download logo pack
            </button>
            <p className="mt-3 text-xs text-muted">File coming soon.</p>
          </div>
        </Container>
      </section>

      {/* Spokesperson Information */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            title="Spokesperson Information"
            description="Point of contact for on-the-record media requests."
          />
          <div className="mt-8 max-w-xl rounded-lg border border-border bg-white p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft-gray text-muted">
                <User className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[17px] font-semibold text-navy">Full Name</p>
                <p className="text-sm text-muted">Communications Officer</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              This is placeholder information. Verified spokesperson details and
              contact information will be published here before public release.
            </p>
          </div>
        </Container>
      </section>

      {/* Media Inquiry Form */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                as="h2"
                title="Media Inquiry"
                description="Journalists and editors can use this form to reach the communications team."
              />
            </div>
            <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
              <MediaInquiryForm />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
