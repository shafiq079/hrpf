import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import { createMetadata } from "@/lib/seo";
import EventsExplorer from "./EventsExplorer";

export const metadata = createMetadata({
  title: "Events",
  description:
    "Join our workshops, training sessions, webinars and community events.",
  path: "/events",
});

export default function EventsPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="EVENTS"
        title="Events, Workshops and Training"
        description="Join our workshops, training sessions, webinars and community events."
        breadcrumbs={[{ label: "Events" }]}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <EventsExplorer />
        </Container>
      </section>
    </main>
  );
}
