import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import PrimaryButton from "@/components/shared/PrimaryButton";
export default function Complaint() {
  return (
    <main id="main-content">
      <PageHero title="Contact HRPF about a concern" eyebrow="HRPF Pakistan" />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl border border-border p-8">
          <h2 className="font-serif text-2xl text-navy">
            Online complaint intake is not available yet
          </h2>
          <p className="my-6 text-muted">
            Please contact the Foundation using its published phone or email
            details.
          </p>
          <PrimaryButton href="/contact">Contact information</PrimaryButton>
        </div>
      </Container>
    </main>
  );
}
