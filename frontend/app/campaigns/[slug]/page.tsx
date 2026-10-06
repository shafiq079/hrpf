import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Check,
  Link2,
  Mail,
  Share2,
  Target,
} from "lucide-react";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import PrimaryButton from "@/components/shared/PrimaryButton";
import CallToAction from "@/components/shared/CallToAction";
import EmptyState from "@/components/shared/EmptyState";
import { createMetadata } from "@/lib/seo";
import { campaigns, getCampaign } from "@/data/campaigns";
import CampaignVolunteerForm from "./CampaignVolunteerForm";

export function generateStaticParams() {
  return campaigns.map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) return {};
  return createMetadata({
    title: campaign.title,
    description: campaign.description,
    path: campaign.href,
  });
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();

  const {
    title,
    description,
    image,
    imageAlt,
    objective,
    whyItMatters,
    keyFacts,
    activities,
    timeline,
    resources,
    progress,
  } = campaign;

  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="CAMPAIGN"
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Campaigns", href: "/campaigns" },
          { label: title },
        ]}
        backgroundImage={image}
        imageAlt={imageAlt}
        actions={[
          { label: "Join Campaign", href: "#join", variant: "navy" },
          { label: "Donate", href: "/donate", variant: "gold" },
        ]}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-14">
            <div className="lg:col-span-2">
              {objective && (
                <div>
                  <SectionHeading
                    as="h2"
                    eyebrow="Campaign Objective"
                    title="What This Campaign Aims to Achieve"
                  />
                  <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                    {objective}
                  </p>
                </div>
              )}

              {whyItMatters && (
                <div className="mt-12">
                  <SectionHeading
                    as="h2"
                    eyebrow="Why It Matters"
                    title="The Case for Action"
                  />
                  <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                    {whyItMatters}
                  </p>
                </div>
              )}

              {keyFacts && keyFacts.length > 0 && (
                <div className="mt-12">
                  <SectionHeading
                    as="h2"
                    eyebrow="Key Facts"
                    title="Points to Know"
                  />
                  <ul className="mt-5 space-y-3">
                    {keyFacts.map((fact) => (
                      <li
                        key={fact}
                        className="flex items-start gap-2.5 rounded-lg border border-border bg-white p-4 text-[15px] leading-relaxed text-text"
                      >
                        <Target
                          className="mt-0.5 h-5 w-5 shrink-0 text-teal-dark"
                          aria-hidden="true"
                        />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activities && activities.length > 0 && (
                <div className="mt-12">
                  <SectionHeading
                    as="h2"
                    eyebrow="Activities"
                    title="What the Campaign Involves"
                  />
                  <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {activities.map((activity) => (
                      <li
                        key={activity}
                        className="flex items-start gap-2 text-[15px] text-text"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-teal-dark"
                          aria-hidden="true"
                        />
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {timeline && timeline.length > 0 && (
                <div className="mt-12">
                  <SectionHeading
                    as="h2"
                    eyebrow="Timeline"
                    title="How the Campaign Progresses"
                  />
                  <ol className="mt-5 space-y-4 border-l border-border pl-6">
                    {timeline.map((entry) => (
                      <li key={`${entry.period}-${entry.milestone}`} className="relative">
                        <span
                          aria-hidden="true"
                          className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-teal bg-white"
                        />
                        <p className="text-sm font-semibold text-navy">
                          {entry.period}
                        </p>
                        <p className="mt-1 text-[15px] leading-relaxed text-muted">
                          {entry.milestone}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Sidebar: progress + resources */}
            <aside className="lg:col-span-1">
              <div className="rounded-lg border border-border bg-white p-6">
                <h2 className="text-lg font-semibold">Campaign Progress</h2>
                <p className="mt-1 text-sm text-muted">
                  Progress towards this awareness goal.
                </p>
                <div
                  className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-soft-gray"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${title} progress`}
                >
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-text">
                  {progress}%
                </p>
              </div>

              <div className="mt-6 rounded-lg border border-border bg-white p-6">
                <h2 className="text-lg font-semibold">Campaign Resources</h2>
                {resources && resources.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {resources.map((resource) => (
                      <li
                        key={resource}
                        className="text-[15px] leading-relaxed text-text"
                      >
                        {resource}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">
                    Related publications will be shared here as they become
                    available.
                  </p>
                )}
                <PrimaryButton
                  href="/about/progress-reports"
                  variant="outline"
                  size="md"
                  className="mt-4"
                >
                  Browse Reports &amp; Resources
                </PrimaryButton>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* Updates */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            as="h2"
            eyebrow="Updates"
            title="Latest From This Campaign"
          />
          <div className="mt-8">
            <EmptyState
              title="No updates yet"
              description="Updates about this campaign's activities and milestones will appear here once available."
            />
          </div>
        </Container>
      </section>

      {/* Volunteer form */}
      <section id="join" className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-2xl">
            <SectionHeading
              as="h2"
              eyebrow="Get Involved"
              title="Join This Campaign"
              description="Tell us how you'd like to support this campaign and we'll be in touch."
            />
            <div className="mt-8 rounded-lg border border-border bg-white p-6 sm:p-8">
              <CampaignVolunteerForm campaignTitle={title} />
              <p className="mt-4 text-xs text-muted">
                This form is a demonstration only — no data is transmitted or
                stored. A secure backend is required for production use.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Social sharing */}
      <section className="bg-soft-gray py-12">
        <Container>
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-lg font-semibold">Share This Campaign</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-navy transition-colors hover:border-teal hover:text-teal-dark"
                aria-label="Share this campaign"
              >
                <Share2 className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-navy transition-colors hover:border-teal hover:text-teal-dark"
                aria-label="Copy link to this campaign"
              >
                <Link2 className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-navy transition-colors hover:border-teal hover:text-teal-dark"
                aria-label="Share this campaign by email"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Container>
      </section>

      <CallToAction
        title="Help Us Extend This Campaign's Reach"
        description="Your support helps us raise awareness and strengthen protection across communities."
        actions={[
          { label: "Donate", href: "/donate", variant: "gold" },
          { label: "Get Involved", href: "/get-involved", variant: "outlineDark" },
        ]}
      />
    </main>
  );
}
