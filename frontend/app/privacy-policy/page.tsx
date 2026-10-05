import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import Link from "next/link";
export default function Page() {
  return (
    <main id="main-content">
      <PageHero title="Privacy" />
      <Container className="py-14 lg:py-20">
        <p className="text-muted">
          The Foundation’s approved privacy information is awaiting publication.
        </p>
        <Link href="/contact" className="mt-6 inline-block text-teal-dark">
          Contact the Foundation →
        </Link>
      </Container>
    </main>
  );
}
