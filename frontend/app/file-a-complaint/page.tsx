import { LifeBuoy, ShieldCheck } from "lucide-react";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import NoticeBanner from "@/components/shared/NoticeBanner";
import ReportViolationForm from "@/components/forms/ReportViolationForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "File a Complaint",
  description:
    "Provide information about a possible human-rights concern. Reports are reviewed carefully and handled with care; submitting a report does not guarantee a specific outcome.",
  path: "/file-a-complaint",
});

export default function ReportViolationPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="Report a Concern"
        title="File a Complaint"
        description="Use this form to provide information about a possible human-rights concern. Reports are reviewed carefully, but submitting a report does not guarantee investigation, representation or a specific outcome."
        breadcrumbs={[{ label: "File a Complaint" }]}
      />

      <section className="bg-off-white py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-12">
            {/* Form */}
            <div className="order-2 lg:order-1">
              <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
                <ReportViolationForm />
              </div>
            </div>

            {/* Guidance sidebar */}
            <aside className="order-1 space-y-4 lg:order-2">
              <NoticeBanner
                variant="confidential"
                title="Your privacy matters"
                icon={ShieldCheck}
              >
                Your information will be handled carefully and shared only where
                necessary and appropriate.
              </NoticeBanner>

              <NoticeBanner variant="warning" title="In an emergency" icon={LifeBuoy}>
                If someone is in immediate danger, contact the relevant local
                emergency service or qualified emergency-support organization.
              </NoticeBanner>

              <div className="rounded-lg border border-border bg-white p-5">
                <h2 className="text-base font-semibold text-navy">
                  Before you begin
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                  <li>Have your CNIC picture and written complaint ready.</li>
                  <li>
                    Include previous proceedings and decisions where applicable.
                  </li>
                  <li>
                    Your complete form and uploaded files will be emailed to you and HRPF’s administrator.
                  </li>
                  <li>
                    Submitting a report does not create a lawyer-client
                    relationship.
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
