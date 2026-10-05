import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import PrimaryButton from "@/components/shared/PrimaryButton";
export default function GetInvolved() {
  return (
    <main id="main-content">
      <PageHero title="Get Involved" eyebrow="HRPF Pakistan" />
      <Container className="py-14 lg:py-20">
        <div className="grid gap-8 md:grid-cols-2">
          <section className="border border-border p-8">
            <h2 className="font-serif text-3xl text-navy">Membership</h2>
            <p className="mt-4 text-muted">
              Website membership applications will open after the Foundation
              confirms its membership policy. For now, use the Foundation’s
              existing application form.
            </p>
            <a
              className="mt-6 inline-block bg-navy px-6 py-3 font-semibold text-white"
              href="https://docs.google.com/forms/d/e/1FAIpQLSfaG3tm0xiiFQrMX9yGSxKW5rSSa4ILvIZrmaLiNSDa86IK5w/viewform?sfnsn=scwspwa"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open membership form ↗
            </a>
            <p className="mt-3 text-sm text-muted">
              Opens Google Forms in a new tab.
            </p>
          </section>
          <section className="border border-border p-8">
            <h2 className="font-serif text-3xl text-navy">
              Other ways to help
            </h2>
            <p className="mt-4 text-muted">
              Contact the Foundation about volunteering, partnerships or other
              ways to contribute.
            </p>
            <div className="mt-6">
              <PrimaryButton href="/contact">Contact HRPF</PrimaryButton>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
