import { Landmark, Mail, Smartphone } from "lucide-react";
import Link from "@/components/translation/TranslationLink";
import { createMetadata } from "@/lib/seo";
import { paymentDetails as details } from "@/data/paymentDetails";
import Container from "@/components/shared/Container";
import PageHero from "@/components/shared/PageHero";
import PaymentDetail from "./PaymentDetail";

export const metadata = createMetadata({
  title: "Donate",
  description: "Bank account and JazzCash details for supporting Human Rights Protection Foundation Pakistan, with contact information for transfer enquiries.",
  path: "/donate",
});

export default function DonatePage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHero
        eyebrow="SUPPORT OUR WORK"
        title="Support HRPF's Work"
        description="Your contribution helps sustain our work for human dignity, justice and public awareness."
        breadcrumbs={[{ label: "Donate" }]}
      />
      <section className="bg-off-white py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl">Payment details</h2>
            <p className="mt-3 leading-relaxed text-muted">Use the details below to make a transfer through your bank or JazzCash. Check the recipient shown by your payment service before confirming the transfer.</p>
          </div>
          <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-8">
            <article className="min-w-0 rounded-lg border border-border bg-white p-6 sm:p-8" aria-labelledby="bank-transfer-title">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal/10 text-teal-dark"><Landmark className="h-5 w-5" aria-hidden="true" /></span>
                <h3 id="bank-transfer-title" className="text-2xl">Bank transfer</h3>
              </div>
              <dl className="mt-6">
                <div className="pb-5">
                  <dt className="text-sm text-muted">Account title</dt>
                  <dd translate="no" className="notranslate mt-2 font-semibold text-navy">{details.accountTitle}</dd>
                </div>
                <div className="border-t border-border py-5">
                  <dt className="text-sm text-muted">Bank</dt>
                  <dd translate="no" className="notranslate mt-2 font-semibold text-navy">{details.bank}</dd>
                </div>
                <PaymentDetail label="Account number" value={details.accountNumber} />
                <PaymentDetail label="IBAN" value={details.iban} />
                <div className="border-t border-border pt-5">
                  <dt className="text-sm text-muted">Branch address</dt>
                  <dd className="mt-2 leading-relaxed text-text">{details.branch}</dd>
                </div>
              </dl>
            </article>
            <div className="min-w-0 space-y-6">
              <article className="rounded-lg border border-border bg-white p-6 sm:p-8" aria-labelledby="jazzcash-title">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gold/15 text-navy"><Smartphone className="h-5 w-5" aria-hidden="true" /></span>
                  <h3 id="jazzcash-title" translate="no" className="notranslate text-2xl">JazzCash</h3>
                </div>
                <p className="my-5 text-sm leading-relaxed text-muted">Send your contribution using the JazzCash number below.</p>
                <dl><PaymentDetail label="JazzCash number" value={details.jazzCash} /></dl>
              </article>
              <div className="rounded-lg border border-border bg-soft-gray p-6 sm:p-8">
                <h3 className="text-xl">How to give</h3>
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted">
                  <li>Choose bank transfer or JazzCash and copy the relevant details.</li>
                  <li>Complete the transfer in your banking app, at your bank or through JazzCash.</li>
                  <li>Keep your transaction reference. Email HRPF if you need to discuss the transfer or request an acknowledgement.</li>
                </ol>
              </div>
            </div>
          </div>
          <div className="mt-8 rounded-lg border border-border bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3"><Mail className="h-5 w-5 shrink-0 text-teal-dark" aria-hidden="true" /><h2 className="text-2xl">Transfer enquiries</h2></div>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted">For questions about a contribution, share the transfer date, amount and transaction reference by email. This page provides payment details; transfers and acknowledgements are handled outside the website.</p>
            <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
              {[details.email, details.additionalEmail].map(email => <Link key={email} href={`mailto:${email}`} className="inline-flex min-h-11 items-center break-all font-semibold text-teal-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"><span translate="no" dir="ltr" className="notranslate">{email}</span></Link>)}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
