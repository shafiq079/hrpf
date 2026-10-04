import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import CampaignCard from "@/components/shared/CampaignCard";
import CallToAction from "@/components/shared/CallToAction";
import { createMetadata } from "@/lib/seo";
import { campaigns } from "@/data/campaigns";

export const metadata = createMetadata({
  title: "Campaigns",
  description:
    "Join our awareness campaigns addressing specific human-rights concerns.",
  path: "/campaigns",
});

export default function CampaignsPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="CAMPAIGNS"
        title="Campaigns for Awareness and Action"
        description="Join our awareness campaigns addressing specific human-rights concerns."
        breadcrumbs={[{ label: "Campaigns" }]}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.slug} campaign={campaign} />
            ))}
          </div>
        </Container>
      </section>

      <CallToAction
        title="Support the Campaigns That Matter to You"
        description="Lend your voice, your time or your resources to help extend awareness and protection across communities."
        actions={[
          { label: "Get Involved", href: "/get-involved", variant: "navy" },
          { label: "Donate", href: "/donate", variant: "gold" },
        ]}
      />
    </main>
  );
}
