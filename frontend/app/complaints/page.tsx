import Link from "@/components/translation/TranslationLink";
import {
  Banknote,
  FileWarning,
  Lock,
  MessageSquare,
  ShieldAlert,
  UserCog,
  UsersRound,
} from "lucide-react";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import NoticeBanner from "@/components/shared/NoticeBanner";
import ComplaintForm from "@/components/forms/ComplaintForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Complaints and Feedback",
  description:
    "Raise a concern about HRPF, its staff, volunteers, projects, services or organizational conduct. Complaints are handled carefully and confidentially.",
  path: "/complaints",
});

const categories = [
  { title: "Staff Conduct", icon: UserCog },
  { title: "Discrimination", icon: UsersRound },
  { title: "Safeguarding Concern", icon: ShieldAlert },
  { title: "Financial Concern", icon: Banknote },
  { title: "Project Concern", icon: FileWarning },
  { title: "Privacy Concern", icon: Lock },
  { title: "General Feedback", icon: MessageSquare },
];

const process = [
  { step: "1", title: "Acknowledge", detail: "We confirm we have received your complaint." },
  { step: "2", title: "Review", detail: "We assess the concern carefully and confidentially." },
  { step: "3", title: "Respond", detail: "We follow up and, where appropriate, take action." },
  { step: "4", title: "Learn", detail: "We use feedback to improve our work." },
];

export default function ComplaintsPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="Complaints & Feedback"
        title="Complaints and Feedback About HRPF"
        description="Use this page to raise a concern about HRPF, its staff, volunteers, projects, services or organizational conduct."
        breadcrumbs={[{ label: "Complaints" }]}
      />

      <section className="bg-off-white py-14 sm:py-16 lg:py-20">
        <Container>
          <NoticeBanner variant="info" title="Looking to report an external concern?">
            This page is for concerns about HRPF itself. To report a possible
            human-rights concern involving another person or organization, please
            use{" "}
            <Link href="/file-a-complaint" className="font-semibold text-teal-dark underline hover:text-navy">
              Report a Violation
            </Link>
            .
          </NoticeBanner>

          {/* Categories */}
          <div className="mt-10">
            <SectionHeading
              as="h2"
              eyebrow="What can I raise?"
              title="Complaint Categories"
            />
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map(({ title, icon: Icon }) => (
                <li
                  key={title}
                  className="flex items-center gap-3 rounded-lg border border-border bg-white p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal/10 text-teal">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-text">{title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Process + confidentiality */}
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-navy">
                How we handle complaints
              </h2>
              <ol className="mt-5 space-y-4">
                {process.map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                      {item.step}
                    </span>
                    <div>
                      <p className="font-semibold text-text">{item.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-4">
              <NoticeBanner variant="confidential" title="Confidentiality">
                Complaints are handled carefully and confidentially. Information
                is shared only where necessary to review and respond to the
                concern.
              </NoticeBanner>
              <NoticeBanner variant="info" title="Anonymous complaints">
                You may submit a complaint anonymously. Please note this may limit
                our ability to follow up with you directly.
              </NoticeBanner>
            </div>
          </div>

          {/* Form */}
          <div className="mt-12">
            <h2 className="font-serif text-2xl font-semibold text-navy">
              Submit a complaint
            </h2>
            <div className="mt-5 rounded-lg border border-border bg-white p-6 sm:p-8">
              <ComplaintForm />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
