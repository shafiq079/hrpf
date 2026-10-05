import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import CopyValue from "@/components/content/CopyValue";
import { ngoDetails } from "@/data/ngo";
export default function Donate() {
  const donations = ngoDetails.donations;
  const labels: Record<string, string> = {
    accountTitle: "Account title",
    bank: "Bank",
    branch: "Branch",
    accountNumber: "Account number",
    iban: "IBAN",
    jazzCash: "JazzCash",
  };
  return (
    <main id="main-content">
      <PageHero title="Donate" eyebrow="Support HRPF Pakistan" />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
              <h2 className="font-serif text-3xl text-navy">
                Donation details
              </h2>
              <dl className="mt-6">
                {Object.entries(donations).map(([key, value]) => (
                  <CopyValue
                    key={key}
                    label={labels[key] ?? key}
                    value={value}
                  />
                ))}
              </dl>
        </div>
      </Container>
    </main>
  );
}
