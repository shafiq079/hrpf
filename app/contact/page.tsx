import {
  Clock,
  Globe,
  HandHelping,
  Handshake,
  Heart,
  LifeBuoy,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Phone,
  Rss,
  Share2,
} from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import SectionHeading from "@/components/shared/SectionHeading";
import NoticeBanner from "@/components/shared/NoticeBanner";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import ContactForm from "./ContactForm";

export const metadata = createMetadata({
  title: "Contact",
  description:
    "Contact Human Rights Protection Foundation regarding programmes, partnerships, volunteering, donations, media inquiries or general organizational information.",
  path: "/contact",
});

interface ContactCard {
  title: string;
  line: string;
  icon: ComponentType<LucideProps>;
}

const contactCards: ContactCard[] = [
  {
    title: "General Inquiries",
    line: "Questions about our organization, programmes and activities.",
    icon: Mail,
  },
  {
    title: "Partnership Inquiries",
    line: "Explore collaboration with institutions and civil-society partners.",
    icon: Handshake,
  },
  {
    title: "Media Inquiries",
    line: "Press, interviews and requests for public information.",
    icon: Megaphone,
  },
  {
    title: "Volunteer Support",
    line: "Guidance on volunteering and community involvement.",
    icon: HandHelping,
  },
  {
    title: "Donation Questions",
    line: "Information about supporting our work responsibly.",
    icon: Heart,
  },
  {
    title: "Technical Support",
    line: "Help with this website and accessibility issues.",
    icon: LifeBuoy,
  },
];

// Generic social links only — no brand icons are used on this site.
const socialLinks: { label: string; icon: ComponentType<LucideProps> }[] = [
  { label: "HRPF on social media", icon: Share2 },
  { label: "HRPF community updates", icon: MessageCircle },
  { label: "HRPF news feed", icon: Rss },
  { label: "HRPF website and network", icon: Globe },
];

export default function ContactPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="CONTACT"
        title="Contact Human Rights Protection Foundation"
        description="Contact us regarding programmes, partnerships, volunteering, donations, media inquiries or general organizational information."
        breadcrumbs={[{ label: "Contact" }]}
      />

      {/* Contact category cards */}
      <section className="bg-off-white py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="How Can We Help"
            title="Reach the Right Team"
            description="Choose the area that best matches your inquiry so we can direct your message to the right people."
          />
          <CardGrid cols={3} className="mt-12">
            {contactCards.map((card) => {
              const Icon = card.icon;
              return (
                <li key={card.title} className={cardGridCellClass}>
                  <span className="inline-flex h-11 w-11 items-center justify-center bg-teal/10 text-teal-dark">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold">{card.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {card.line}
                  </p>
                </li>
              );
            })}
          </CardGrid>
        </Container>
      </section>

      {/* Form + details */}
      <section className="bg-soft-gray py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            {/* Form */}
            <div>
              <SectionHeading
                eyebrow="Send a Message"
                title="Get in Touch"
                description="Complete the form below and a member of our team will respond as soon as possible."
              />
              <div className="mt-8 rounded-lg border border-border bg-white p-6 sm:p-8">
                <ContactForm />
              </div>
            </div>

            {/* Sidebar: details, response time, emergency, social */}
            <div className="space-y-6">
              {/* Contact details */}
              {/* TODO: replace placeholder contact details before production */}
              <div className="rounded-lg border border-border bg-white p-6">
                <h2 className="text-lg font-semibold">Contact Details</h2>
                <dl className="mt-4 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail
                      className="mt-0.5 h-5 w-5 shrink-0 text-teal-dark"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="font-medium text-text">Email</dt>
                      <dd className="text-muted">info@hrpf.org</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone
                      className="mt-0.5 h-5 w-5 shrink-0 text-teal-dark"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="font-medium text-text">Phone</dt>
                      <dd className="text-muted">+00 000 000 0000</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="mt-0.5 h-5 w-5 shrink-0 text-teal-dark"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="font-medium text-text">Address</dt>
                      <dd className="text-muted">
                        Organization address to be added
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock
                      className="mt-0.5 h-5 w-5 shrink-0 text-teal-dark"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="font-medium text-text">Hours</dt>
                      <dd className="text-muted">
                        Monday to Friday, 9:00 AM–5:00 PM
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* Response-time note */}
              <NoticeBanner variant="info" title="Expected response time">
                We aim to respond within 3–5 working days.
              </NoticeBanner>

              {/* Emergency warning */}
              <NoticeBanner variant="warning" title="In an emergency">
                If someone is in immediate danger, contact your local emergency
                service. This form is not monitored for emergencies.
              </NoticeBanner>

              {/* Social links */}
              <div className="rounded-lg border border-border bg-white p-6">
                <h2 className="text-lg font-semibold">Follow Our Work</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Connect with us to stay informed about our activities and
                  updates.
                </p>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <li key={social.label}>
                        <a
                          href="#"
                          aria-label={social.label}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-teal hover:text-teal"
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="mt-10">
            <div className="flex aspect-[16/6] w-full items-center justify-center rounded-lg border border-dashed border-border bg-white text-sm font-medium text-muted">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-dark" aria-hidden="true" />
                Map placeholder
              </span>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
