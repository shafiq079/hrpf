import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import { createMetadata } from "@/lib/seo";
import ContactForm from "@/app/contact/ContactForm";
import { aboutProfile } from "@/data/about-profile";
export const metadata = createMetadata({ title: "Partner With Us", description: "Discuss collaboration with HRPF Pakistan to advance human dignity and the public interest.", path: "/partner-with-us" });
export default function PartnerPage() {
  return <main id="main-content" className="flex-1"><PageHero eyebrow="PARTNERSHIPS" title="Work Together for Human Dignity" description={aboutProfile.collaboration} breadcrumbs={[{ label: "Partner With Us" }]} />
    <section className="bg-off-white py-14 sm:py-20"><Container className="max-w-3xl"><SectionHeading title="Propose a Collaboration" description="Tell us about your organization, the area of work and how you would like to contribute. HRPF will consider your enquiry in relation to its mission and available resources." /><div className="mt-8 border border-border bg-white p-6 sm:p-8"><ContactForm defaultInquiryType="Partnership" /></div></Container></section></main>;
}
