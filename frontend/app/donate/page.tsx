import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import CopyValue from "@/components/content/CopyValue";
import { ContentState } from "@/components/content/ContentView";
import { publicSettings } from "@/lib/public-content";
export default async function Donate() {
  const result = await publicSettings(),
    donations = result.status === "ok" ? result.data.donations : undefined;
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
          {donations ? (
            <>
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
            </>
          ) : (
            <ContentState
              status={
                result.status === "unavailable" ? "unavailable" : "missing"
              }
            />
          )}
        </div>
      </Container>
    </main>
  );
}
