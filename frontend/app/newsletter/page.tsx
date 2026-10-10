import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import NewsletterAction from "./NewsletterAction";
import { createMetadata } from "@/lib/seo";
export const metadata = { ...createMetadata({ title: "Newsletter Subscription", description: "Confirm or cancel your HRPF newsletter subscription.", path: "/newsletter" }), robots: { index: false, follow: false } };
export default function NewsletterPage() {
  return <main id="main-content" className="flex-1"><PageHero heroImage="writing" eyebrow="HRPF UPDATES" title="Your Newsletter Subscription" breadcrumbs={[{ label: "Newsletter" }]} /><section className="bg-off-white py-14"><Container className="max-w-2xl"><NewsletterAction /></Container></section></main>;
}
