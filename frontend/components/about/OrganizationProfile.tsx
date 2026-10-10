import { Download, ExternalLink, FileText } from "lucide-react";
import Link from "@/components/translation/TranslationLink";
import TranslationText from "@/components/translation/TranslationText";
import { organizationProfile as profile } from "@/data/organization-profile";
import { documentSize } from "@/lib/document-display";

export default function OrganizationProfile() {
  const document = profile.document;
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
      <div className="min-w-0">
        <p className="eyebrow"><TranslationText>Our organization</TranslationText></p>
        <h2 className="mt-3 text-3xl sm:text-4xl"><TranslationText>Human Rights Protection Foundation Pakistan</TranslationText></h2>
        <div className="mt-6 space-y-5 leading-relaxed text-muted">
          <p><TranslationText>{profile.introduction}</TranslationText></p>
          <p><TranslationText>{profile.approach}</TranslationText></p>
        </div>
        <div className="mt-10 space-y-7 border-t border-border pt-8">
          {profile.topics.map(topic => (
            <section key={topic.title}>
              <h3 className="text-xl"><TranslationText>{topic.title}</TranslationText></h3>
              <p className="mt-3 leading-relaxed text-muted"><TranslationText>{topic.description}</TranslationText></p>
            </section>
          ))}
        </div>
        <Link href="/our-work" className="mt-8 inline-flex min-h-11 items-center font-semibold text-teal-dark underline underline-offset-4">
          <TranslationText>Explore our work</TranslationText>
        </Link>
      </div>
      <aside aria-labelledby="profile-document-heading" className="min-w-0 border border-border bg-white p-6 sm:p-8">
        <FileText size={36} className="text-teal-dark" aria-hidden="true" />
        <h2 id="profile-document-heading" className="mt-5 text-2xl"><TranslationText>Organizational profile</TranslationText></h2>
        <p className="mt-4 text-sm leading-relaxed text-muted"><TranslationText>Read the complete profile covering the Foundation’s background, registration, governance, areas of work and progress.</TranslationText></p>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex flex-wrap gap-x-2"><dt className="font-semibold"><TranslationText>Prepared:</TranslationText></dt><dd><TranslationText>{document.prepared}</TranslationText></dd></div>
          <div className="flex flex-wrap gap-x-2"><dt className="font-semibold"><TranslationText>File:</TranslationText></dt><dd><TranslationText>{`PDF · ${document.pages} pages · ${documentSize(document.bytes)}`}</TranslationText></dd></div>
        </dl>
        <div className="mt-7 flex flex-col gap-3">
          <a href={document.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy-dark">
            <TranslationText>View profile (PDF)</TranslationText><ExternalLink size={16} aria-hidden="true" /><span className="sr-only"><TranslationText> (opens in a new tab)</TranslationText></span>
          </a>
          <a href={document.href} download={document.filename} className="inline-flex min-h-12 items-center justify-center gap-2 border border-navy/20 px-5 py-3 text-sm font-semibold text-navy hover:bg-navy/5">
            <Download size={16} aria-hidden="true" /><TranslationText>Download PDF</TranslationText>
          </a>
        </div>
      </aside>
    </div>
  );
}
