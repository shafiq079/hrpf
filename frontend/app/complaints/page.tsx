import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import PrimaryButton from "@/components/shared/PrimaryButton";
import { createMetadata } from "@/lib/seo";
import ContactForm from "@/app/contact/ContactForm";
export const metadata = createMetadata({ title: "Feedback About HRPF", description: "Send feedback or a concern about HRPF through the Foundation’s enquiry service.", path: "/complaints" });
export default function FeedbackPage() {
  return <main id="main-content" className="flex-1"><PageHero eyebrow="FEEDBACK" title="Share a Concern About HRPF" description="Use this form for feedback about the Foundation, its communications or activities. Your message is emailed to the Foundation’s designated recipients and a copy is queued for you." breadcrumbs={[{ label: "Feedback About HRPF" }]} />
    <section className="bg-off-white py-14 sm:py-20"><Container className="max-w-3xl"><SectionHeading title="Send Your Feedback" description="This is the routine HRPF enquiry channel. It is not an independent safeguarding channel or an emergency service. For a human-rights concern requiring documents, use File a Complaint." /><PrimaryButton href="/file-a-complaint" variant="outline" className="mt-5">File a Complaint</PrimaryButton><div className="mt-8 border border-border bg-white p-6 sm:p-8"><ContactForm defaultInquiryType="Feedback" /></div></Container></section></main>;
}
