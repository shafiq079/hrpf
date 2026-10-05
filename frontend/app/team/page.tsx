import { ArrowRight } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import TeamCard from "@/components/shared/TeamCard";
import CallToAction from "@/components/shared/CallToAction";
import {
  team,
  teamCategories,
  teamCategoryDescriptions,
} from "@/data/team";

export const metadata = createMetadata({
  title: "Our Team",
  description:
    "Meet the board, leadership, programme staff, legal-referral coordinators, researchers, communicators, advisors and volunteers supporting Human Rights Protection Foundation.",
  path: "/team",
});

export default function TeamPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="OUR PEOPLE"
        title="People Behind the Mission"
        description="Our work is supported by professionals, volunteers, advisors and community representatives committed to responsible human-rights protection. Explore each role and what it contributes to the foundation."
        breadcrumbs={[
          { label: "About Us", href: "/about" },
          { label: "Our Team" },
        ]}
        actions={[
          {
            label: "About Us",
            href: "/about",
            variant: "outlineDark",
          },
          {
            label: "Get Involved",
            href: "/get-involved",
            variant: "navy",
          },
        ]}
      />

      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="space-y-16">
            {teamCategories.map((category) => {
              const members = team.filter(
                (member) => member.category === category
              );
              if (members.length === 0) return null;

              return (
                <div key={category} id={category.toLowerCase().replace(/\s+/g, "-")}>
                  <SectionHeading
                    as="h2"
                    title={category}
                    description={teamCategoryDescriptions[category]}
                  />
                  <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => (
                      <li key={`${category}-${member.position}-${member.name}`}>
                        <TeamCard member={member} showResponsibilities />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <CallToAction
        title="Join the People Protecting Human Dignity"
        description="Whether you volunteer your time or build your career with us, there is a place for you in this work."
        actions={[
          {
            label: "Get Involved",
            href: "/get-involved",
            variant: "navy",
            icon: ArrowRight,
          },
          {
            label: "View Careers",
            href: "/careers",
            variant: "outlineDark",
          },
        ]}
      />
    </main>
  );
}
