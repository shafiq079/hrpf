import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "@/components/translation/TranslationLink";
import { createMetadata } from "@/lib/seo";
import { contactDetails as details, contactSocialLinks } from "@/data/contactDetails";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import ContactForm from "./ContactForm";

export const metadata = createMetadata({
  title: "Contact",
  description: "Contact HRPF Pakistan by email, phone or enquiry form. Find our office in Mianwal Ranjha, Mandi Bahauddin and open its location in Google Maps.",
  path: "/contact",
});
const contactLink = "inline-flex min-h-11 items-center gap-2 break-all font-semibold text-teal-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2";

export default function ContactPage() {
  return <main id="main-content" className="flex-1">
    <PageHero heroImage="contact" eyebrow="GET IN TOUCH" title="Contact HRPF" description="Ask about our work, membership, partnerships, contributions or public information. We welcome your enquiries." breadcrumbs={[{ label: "Contact" }]} />
    <section className="bg-off-white py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          <div className="min-w-0 rounded-lg border border-border bg-white p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl">Send a message</h2>
            <p className="mt-3 mb-7 text-sm leading-relaxed text-muted">Use this form for general enquiries. For a rights concern with supporting documents, use <Link href="/file-a-complaint" className="font-semibold text-teal-dark underline">File a Complaint</Link>.</p>
            <ContactForm />
          </div>
          <div className="min-w-0 space-y-6">
            <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
              <h2 className="text-2xl">Contact details</h2>
              <dl className="mt-5 space-y-5">
                <div><dt className="flex items-center gap-2 text-sm text-muted"><Mail className="h-4 w-4" aria-hidden="true" />Email</dt><dd className="mt-1 flex flex-col items-start">{[details.email,details.additionalEmail].map(email => <Link key={email} href={`mailto:${email}`} className={contactLink}><span dir="ltr" translate="no" className="notranslate">{email}</span></Link>)}</dd></div>
                <div><dt className="flex items-center gap-2 text-sm text-muted"><Phone className="h-4 w-4" aria-hidden="true" />Phone</dt><dd className="mt-1"><Link href={details.phoneHref} className={contactLink}><span dir="ltr" translate="no" className="notranslate">{details.phone}</span></Link></dd></div>
                <div><dt className="flex items-center gap-2 text-sm text-muted"><Phone className="h-4 w-4" aria-hidden="true" />Office telephone</dt><dd className="mt-1"><Link href={details.landlineHref} className={contactLink}><span dir="ltr" translate="no" className="notranslate">{details.landline}</span></Link></dd></div>
              </dl>
            </div>
            <article className="rounded-lg border border-border bg-white p-6 sm:p-8" aria-labelledby="office-location">
              <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-teal-dark" aria-hidden="true" /><h2 id="office-location" className="text-2xl">Our office</h2></div>
              <address className="mt-4 text-sm not-italic leading-relaxed text-text">{details.address}<br />Postal code: <span dir="ltr" translate="no" className="notranslate">{details.postalCode}</span></address>
              <p className="mt-2 text-sm text-muted">Please call or email before visiting to arrange a suitable time.</p>
            </article>
            <div className="rounded-lg border border-border bg-soft-gray p-6 sm:p-8">
              <h2 className="text-xl">Follow our work</h2>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">{contactSocialLinks.map(social => <li key={social.label}><a href={social.href} target="_blank" rel="noopener noreferrer" className={contactLink}>{social.label}<span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul>
            </div>
            <p className="text-sm leading-relaxed text-muted">For immediate danger, contact your local emergency service. Please do not wait for a website or email response.</p>
          </div>
        </div>
        <section className="mt-10 overflow-hidden border border-border bg-white" aria-labelledby="office-map-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <h2 id="office-map-heading" className="text-2xl">Office location</h2>
            <a href={details.mapUrl} target="_blank" rel="noopener noreferrer" className={contactLink}>Open in Google Maps<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
          </div>
          <div className="notranslate border-t border-border bg-off-white" translate="no" dir="ltr">
            <iframe
              title="HRPF Pakistan office location in Google Maps"
              src={details.mapEmbedUrl}
              width="1200"
              height="420"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="block h-[320px] w-full border-0 sm:h-[420px]"
            />
          </div>
        </section>
      </Container>
    </section>
  </main>;
}
