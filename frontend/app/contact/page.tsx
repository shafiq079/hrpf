import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import { ngoDetails } from "@/data/ngo";
export default function Contact() {
  const contact = ngoDetails.contact;
  return (
    <main id="main-content">
      <PageHero title="Contact" eyebrow="HRPF Pakistan" />
      <Container className="py-14 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2">
          <section>
              <h2 className="font-serif text-3xl text-navy">Get in touch</h2>
              <address className="mt-6 not-italic text-muted">
                {contact.address}
                <br />
                {contact.postalCode}
              </address>
              <div className="mt-6 space-y-3">
                {[contact.phone, contact.landline].map((phone) => (
                  <a
                    key={phone}
                    className="block text-teal-dark"
                    href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                  >
                    {phone}
                  </a>
                ))}
                {contact.emails.map((email) => (
                  <a
                    key={email}
                    className="block text-teal-dark"
                    href={`mailto:${email}`}
                  >
                    {email}
                  </a>
                ))}
              </div>
          </section>
          <section className="border border-border p-8">
            <h2 className="font-serif text-2xl text-navy">
              Online contact form
            </h2>
            <p className="mt-4 text-muted">
              Online submissions are not available yet. Please use the published
              phone or email details to contact the Foundation.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
