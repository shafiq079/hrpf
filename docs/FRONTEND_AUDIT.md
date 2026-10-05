# HRPF Frontend Source Audit - M0

Date: 2026-10-05
Repository: https://github.com/shafiq079/hrpf
Baseline commit: d3848c940d8bf260c7b2657a66473df991777296
Scope: source audit only; execution and visual verification pending in Codespaces.

## Stack and structure
- Next.js 16.2.11 App Router; React/React DOM 19.2.4; TypeScript strict mode.
- Tailwind 4; Framer Motion ^12.42.2; Lucide React ^1.26.0.
- npm with package-lock.json; scripts dev, build, start and lint.
- Root folders: app/, components/, data/, lib/, public/.
- 31 page files including five dynamic pages; 13 data modules.
- No backend/, frontend/, API route handlers, admin routes, CI workflows or tests in baseline.
- next.config.ts has no API rewrite or Cloudinary image configuration.
- AGENTS.md requires installed Next.js guide review before code changes.

## Design to preserve
- Brand blue #009EDB; navy #0B2A3A; gold #F2A900; off-white #F7FAFC; light-blue #EAF7FC.
- Inter body text, Lora headings and square corners defined in globals.css.
- Sticky header, overlay hero, responsive card grids, institutional footer and reveal animations.
- Source inspection is not a visual browser signoff; desktop/mobile screenshots remain pending.

## Findings
| Finding | Evidence | Planned treatment |
| --- | --- | --- |
| Form submissions are simulated | lib/forms.ts; form components call simulateSubmit and sampleReference | Connect to validated Express endpoints; references allocated in MongoDB |
| Newsletter implies email confirmation without sending anything | components/layout/NewsletterForm.tsx | Replace with sourced contact/action block; retain grid |
| Complaint meanings differ | ComplaintForm is feedback about HRPF; ReportViolationForm is an external-concern wizard | Extend external-concern wizard for the client-required complaint flow |
| Unsupported statistics | data/impactStats.ts contains demo people/cases/countries/donation figures | Remove values and reuse layout only for supported facts |
| Unsupported people/partners/projects | data/team.ts, partners.ts, projects.ts and campaigns.ts | Replace with authoritative people/content; hide unsourced records |
| Incorrect history | app/layout.tsx JSON-LD, Footer.tsx and About timeline use 2015 | Remove unsupported history; use brief-approved facts with provenance |
| Report downloads not connected | data/reports.ts; ResourceCard shows File coming soon | Use real report metadata and API download endpoint |
| Social links are placeholders | Footer points to platform homepages; Contact includes href="#" | Settings-driven approved links |
| Mobile dialog accessibility incomplete | MobileNavigation sets aria-hidden and transforms but lacks focus trap, inert handling and restoration | Extend current drawer without redesign |
| Closed drawer still contains focusable controls | aria-hidden and pointer-events do not remove keyboard focusability | Unmount or use proper inert/visibility handling |
| Navigation needs replacement | data/navigation.ts includes Impact, News, top-level Reports, internships and governance | Apply approved sitemap |
| SEO needs verified data | lib/seo.ts and root metadata lack final HRPF identity/locales/images | Extend helpers; add sitemap/robots and safe JSON-LD |
| Policies are prototype drafts | privacy-policy, terms-of-use, safeguarding-policy and accessibility pages | Retain suitable layouts; replace unsupported policy commitments |
| No multilingual implementation | Root html lang=en; no locale catalog/routing | Introduce English/Urdu architecture and reviewed RTL content |

## Component reuse map
| Existing component | HRPF use |
| --- | --- |
| Header / MobileNavigation / Footer | Approved navigation, language control and source-driven footer |
| Container / PageHero / SectionHeading / Prose | All informational pages |
| PrimaryButton / CallToAction | Membership, complaint and donation actions |
| TeamCard | Board and documented office-bearer profiles |
| NewsCard / NewsExplorer | Blogs and categories |
| ResourceCard / ReportsExplorer | Progress reports; adapt cards for certificates |
| AppImage | Cloudinary public images with explicit dimensions/sizes |
| Accordion | Full constitutional objects and sourced FAQ sections |
| fields / FormMessage / SubmitButton | Secure complaint, membership and contact forms |
| ProjectCard / FeaturedProjects | Report-backed work highlights; avoid fictional projects |
| EmptyState / SearchInput / FilterBar | Public listings and future admin modules |

## Existing route disposition
| Existing route | Planned disposition |
| --- | --- |
| / | Preserve layout; replace content/data and unsupported sections |
| /about | Split into approved About pages; redirect overview to Who We Are |
| /our-work and detail pages | Approved What We Do content; map only valid source-backed details |
| /news and detail pages | Blogs; do not migrate fictional post records |
| /reports | Redirect to /about/progress-reports |
| /team | Board of Directors; Our Team reuses documented office-bearers |
| /get-involved | Native membership page and Get Involved navigation |
| /report-a-violation, /get-help, /complaints | Consolidate into approved complaint route; remove conflicting demo intake behavior |
| /donate | Supplied bank/JazzCash details; no gateway |
| /contact | Preserve layout; source-driven contacts and real form |
| /media | Gallery Media Coverage |
| /projects, /campaigns, /events and detail pages | Reuse components for verified work/gallery/blog content; remove unsourced individual records |
| /impact, /governance, /careers | Remove unsupported public routes/navigation; no fictional replacement records |
| /partner-with-us | Use Contact rather than an extra unsupported intake workflow |
| /faq | Use approved, sourced FAQ content within relevant pages; no unsupported promises |
| /search | Do not expose global search until its published-content API scope is implemented |
| /privacy-policy | Approved privacy page and redirect |
| /terms-of-use | Approved terms page and redirect |
| /safeguarding-policy | Draft only until HRPF policy is confirmed |
| /accessibility | Reuse layout for verified accessibility statement |

Redirect specific legacy detail URLs only when a real destination is known. Removed unsupported details return proper not-found/gone responses; no blanket redirects to unrelated content.

## M1 migration boundary
- Move existing app/, components/, data/, lib/, public/ and frontend package/config files into frontend/.
- Do not rewrite components, introduce src/ or change the theme during the move.
- Keep root AGENTS.md and project documentation at root.
- Add backend and infrastructure separately; exact files follow verified M0 results.

## Owner verification
- npm ci
- npm run lint
- npx tsc --noEmit
- npm run build
- npm run dev -- --hostname 0.0.0.0
- Open forwarded port 3000: home, About, work, team, reports, contact and report-a-violation.
- Compare desktop 1440px and mobile 390px; include intermediate-width navigation in review.
- Use dummy form data only; demo submissions are not delivered or saved.
- Record failures without assuming any check passed.
