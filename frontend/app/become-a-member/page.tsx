import MembershipForm from "@/components/forms/MembershipForm";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";

export const metadata = createMetadata({
  title: "Become a Member",
  description:
    "Apply for HRPF membership using the Foundation’s membership form.",
  path: "/become-a-member",
});
export default function BecomeMemberPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="MEMBERSHIP"
        title="Become a Member"
        description="Join HRPF Pakistan in promoting human dignity, access to justice and institutional accountability."
        breadcrumbs={[{ label: "Become a Member" }]}
      />
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <MembershipForm />
        </Container>
      </section>
    </main>
  );
}
