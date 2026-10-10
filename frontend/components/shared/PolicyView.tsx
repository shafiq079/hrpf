import Link from "@/components/translation/TranslationLink";
import Container from "./Container";
import PageHero from "./PageHero";
import Prose from "./Prose";
import type { WebsitePolicy } from "@/data/websitePolicies";

export default function PolicyView({ policy }: { policy: WebsitePolicy }) {
  const updatedAt = policy.updatedAt || "2026-10-09";
  const updatedLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${updatedAt}T00:00:00Z`));
  return <main id="main-content" className="flex-1">
    <PageHero heroImage={policy.heroImage} eyebrow={policy.eyebrow} title={policy.title} description={policy.description} breadcrumbs={[{ label: policy.title }]} />
    <section className="bg-off-white py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
          <aside className="mb-9 lg:mb-0">
            <nav aria-label="On this page" className="lg:sticky lg:top-24">
              <p className="eyebrow text-teal-dark">On this page</p>
              <ul className="mt-4 border-l border-border">
                {policy.sections.map(section => <li key={section.id}>
                  <Link href={`#${section.id}`} className="-ml-px flex min-h-11 items-center border-l-2 border-transparent py-2 pl-4 text-sm text-muted hover:border-teal hover:text-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2">{section.title}</Link>
                </li>)}
              </ul>
            </nav>
          </aside>
          <div className="min-w-0 max-w-3xl">
            <p className="text-sm text-muted">Last updated: <time dateTime={updatedAt}>{updatedLabel}</time></p>
            <Prose className="mt-6">
              <p>{policy.introduction}</p>
              {policy.sections.map(section => <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2>{section.title}</h2>
                {section.paragraphs.map(text => <p key={text}>{text}</p>)}
                {section.links ? <ul>{section.links.map(link => <li key={link.href}><Link href={link.href} className="break-words">{link.label}</Link></li>)}</ul> : null}
              </section>)}
            </Prose>
          </div>
        </div>
      </Container>
    </section>
  </main>;
}
