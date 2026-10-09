import { ExternalLink } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";

export const metadata = createMetadata({ title: "Become a Member", description: "Apply for HRPF membership using the Foundation’s membership form.", path: "/become-a-member" });
export default function BecomeMemberPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero eyebrow="MEMBERSHIP" title="Become a Member" description="Join HRPF Pakistan in promoting human dignity, access to justice and institutional accountability."
        breadcrumbs={[{ label: "Become a Member" }]} />
      <section className="bg-off-white py-16 sm:py-20 lg:py-24"><Container>
        <div className="mx-auto max-w-2xl rounded-lg border border-border bg-white p-8 sm:p-10">
          <h2 className="font-serif text-2xl font-semibold text-navy">Apply for Membership</h2>
          <p className="mt-4 leading-relaxed text-muted">Complete HRPF’s membership application using the form below. The application opens in Google Forms.</p>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSfaG3tm0xiiFQrMX9yGSxKW5rSSa4ILvIZrmaLiNSDa86IK5w/viewform?sfnsn=scwspwa"
            target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-md bg-teal px-6 py-3 font-semibold text-white hover:bg-teal-dark">
            Open Membership Form <ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </Container></section>
    </main>
  );
}
