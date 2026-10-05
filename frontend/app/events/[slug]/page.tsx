import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Users2,
} from "lucide-react";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import EventCard from "@/components/shared/EventCard";
import EmptyState from "@/components/shared/EmptyState";
import AppImage from "@/components/shared/AppImage";
import { createMetadata } from "@/lib/seo";
import { events, getEvent } from "@/data/events";
import { formatDate } from "@/lib/format";
import EventRegistrationForm from "./EventRegistrationForm";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  return createMetadata({
    title: event.title,
    description: event.description,
    path: event.href,
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const {
    title,
    type,
    date,
    time,
    location,
    description,
    image,
    imageAlt,
    past,
    organizer,
    speakers,
    agenda,
  } = event;

  const relatedEvents = events
    .filter((item) => item.slug !== slug)
    .slice(0, 3);

  const details: { icon: typeof Calendar; label: string; value: string }[] = [
    { icon: Calendar, label: "Date", value: formatDate(date) },
    { icon: Clock, label: "Time", value: time },
    { icon: MapPin, label: "Location", value: location },
    { icon: Tag, label: "Type", value: type },
  ];
  if (organizer) {
    details.splice(3, 0, {
      icon: Users2,
      label: "Organizer",
      value: organizer,
    });
  }

  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow={type}
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Events", href: "/events" },
          { label: title },
        ]}
        backgroundImage={image}
        imageAlt={imageAlt}
      />

      {/* Details block */}
      <section className="bg-off-white py-12 sm:py-16">
        <Container>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {details.map((detail) => {
              const Icon = detail.icon;
              return (
                <div
                  key={detail.label}
                  className="flex items-start gap-3 rounded-lg border border-border bg-white p-4"
                >
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-teal-dark"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {detail.label}
                    </dt>
                    <dd className="mt-0.5 text-[15px] font-medium text-text">
                      {detail.value}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </Container>
      </section>

      <section className="bg-off-white pb-16 sm:pb-20 lg:pb-24">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-14">
            <div className="lg:col-span-2">
              <SectionHeading
                as="h2"
                eyebrow="About This Event"
                title="Description"
              />
              <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                {description}
              </p>

              {agenda && agenda.length > 0 && (
                <div className="mt-12">
                  <SectionHeading as="h2" eyebrow="Agenda" title="What to Expect" />
                  <ul className="mt-5 divide-y divide-border rounded-lg border border-border bg-white">
                    {agenda.map((entry) => (
                      <li
                        key={`${entry.time}-${entry.item}`}
                        className="flex gap-4 p-4"
                      >
                        <span className="w-20 shrink-0 text-sm font-semibold text-navy">
                          {entry.time}
                        </span>
                        <span className="text-[15px] leading-relaxed text-text">
                          {entry.item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {speakers && speakers.length > 0 && (
                <div className="mt-12">
                  <SectionHeading as="h2" eyebrow="Speakers" title="Who You'll Hear From" />
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {speakers.map((speaker) => (
                      <div
                        key={`${speaker.name}-${speaker.role}`}
                        className="rounded-lg border border-border bg-white p-5"
                      >
                        <p className="text-base font-semibold text-navy">
                          {speaker.name}
                        </p>
                        <p className="mt-1 text-sm text-muted">{speaker.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registration or post-event content */}
              <div id="register" className="mt-12">
                {past ? (
                  <>
                    <SectionHeading
                      as="h2"
                      eyebrow="Registration"
                      title="This Event Has Ended"
                    />
                    <div className="mt-6">
                      <EmptyState
                        icon={Clock}
                        title="Registration closed"
                        description="This event has already taken place, so registration is no longer available."
                      />
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold">Post-event gallery</h3>
                      <p className="mt-1 text-sm text-muted">
                        Photos from this past event (sample stock photography for
                        demonstration).
                      </p>
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[1, 2, 3].map((index) => (
                          <div
                            key={index}
                            className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border"
                          >
                            <AppImage
                              src={`/images/events/${slug}-gallery-${index}.jpg`}
                              alt={`Sample gallery placeholder ${index} for ${title}`}
                              fill
                              sizes="(max-width: 640px) 100vw, 33vw"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <SectionHeading
                      as="h2"
                      eyebrow="Registration"
                      title="Register for This Event"
                      description="Reserve your place using the form below."
                    />
                    <div className="mt-6 rounded-lg border border-border bg-white p-6 sm:p-8">
                      <EventRegistrationForm eventTitle={title} />
                      <p className="mt-4 text-xs text-muted">
                        This form is a demonstration only — no data is
                        transmitted or stored. A secure backend is required for
                        production use.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar: map placeholder */}
            <aside className="lg:col-span-1">
              <div className="rounded-lg border border-border bg-white p-6">
                <h2 className="text-lg font-semibold">Location</h2>
                <p className="mt-1 text-[15px] text-muted">{location}</p>
                <div className="mt-4 flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-border bg-soft-gray text-center">
                  <span className="inline-flex flex-col items-center gap-2 text-muted">
                    <MapPin className="h-6 w-6" aria-hidden="true" />
                    <span className="text-sm font-medium">Map placeholder</span>
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* Related events */}
      {relatedEvents.length > 0 && (
        <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              as="h2"
              eyebrow="More Events"
              title="Related Events"
            />
            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {relatedEvents.map((item) => (
                <EventCard key={item.slug} event={item} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
