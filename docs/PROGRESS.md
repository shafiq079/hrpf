# HRPF Progress

## Website policies — 2026-10-08

- PR #8 passed GitHub checks and merged Our Work into main at `877e0e3`;
  development aligned before policy work, as requested.
- Retained Privacy Policy, Terms of Use, Accessibility and Safeguarding routes;
  replaced prototype content with actual complaint/email/translation/retention
  behaviour, limitations and sourced email contacts.
- Shared dated view provides contents navigation, stable anchors and readable
  mobile layout; removed dead PDF downloads and publication placeholders.
- Accessibility avoids unsupported conformance claims; safeguarding avoids
  invented procedures and independent contacts. Disclosed unconnected forms.
- Frontend lint/type/build, existing tests, public SSR/navigation and four-page
  desktop/mobile/keyboard checks pass, with isolated Urdu RTL/English restore.
- Policy changes stay on development. See `WEBSITE_POLICIES.md` for evidence and
  organisation decisions; no backend or form-delivery changes in this task.

## Remaining five Our Work pages — 2026-10-08

- Owner accepted general Women's Rights and requested the other menu pages in sequence.
- Completed Children's Rights, Access to Justice, Minority Rights, Education and
  Awareness, then Research and Advocacy, with distinct general copy and five
  supplied archive photos.
- All six share the approved view and managed Projects in this field sections;
  no fixed cases, source/photo notes, fake statistics or programme/testimonial text.
- Frontend lint/type/build, four tests and expanded public SSR pass, including all
  six focus queries, managed links and empty/offline states. Browser checks cover
  desktop/mobile, metadata/images, anchors, keyboard FAQ and women's RTL regression.
- No backend or seed changes; homepage/overview/two legacy routes retained.
  PR #8 subsequently merged to main at `877e0e3` before the policy task.

## General category pages and managed field projects — 2026-10-08

- Owner clarified that all categories should explain the general approach, with
  specific work shown through managed Projects in this field cards.
- Removed the Women's Rights hardcoded case, source/page references and photo caption.
- General priorities, approach and FAQs now accompany automatically linked released
  Women's Rights projects; source-seeded projects need no duplicate import.
- Added bounded public project focus-area filtering before pagination/counts,
  preserving review/release-date/withdrawal controls and escaped literal matching.
- Frontend lint/type/build, public SSR and desktop/mobile/RTL browser checks pass.
  Backend typecheck and OpenAPI pass; integration covers filtering and publication.
- Updated the six-category plan; remaining pages follow this pattern one by one.

## Our Work redesign: Women's Rights — 2026-10-07

- Translation UI accepted and merged through PR #7; development aligned at `15b953a`.
- Owner prioritised organisation-based redesign of six Our Work pages before caching.
- Recorded supplied-file analysis, claim boundaries, evidence and page sequence in
  `OUR_WORK_REDESIGN.md`; started with Women's Rights only.
- Replaced its prototype page with an archive-photo hero, real priorities,
  source-attributed Dar-ul-Aman case, institutional approach and complaint/contact FAQs.
- Removed invented programme/impact/testimonial content from this page; retained the
  shared theme, header, footer, translation control and other pages for later review.
- Frontend lint/type/build, four tests and public SSR/navigation passed. Browser
  checks cover desktop/mobile/landscape, keyboard FAQ, anchors, image/metadata,
  action destinations, isolated Urdu RTL/English restoration and unchanged next page.
- No backend, database seed or main merge required. Next: Children's Rights.

## Simplified translation panel — 2026-10-08

- Owner requested a narrower panel titled "Translate", no search box, no
  automatic-translation footer/status and one native name per language.
- Reduce width from 20rem to 14rem and keep the scrollable language list,
  selection checkmark, English restore and keyboard dismissal/focus.
- Frontend lint/type/build, four existing tests and public SSR passed. An
  isolated-provider browser verified the 224px panel, "Translate" title, absence
  of search/footer/duplicate labels, language changes, English restore, saved
  navigation, keyboard/outside dismissal, mobile/landscape bounds and retry.

## Floating translation interface — 2026-10-08

- Owner confirmed translation works and requested the bottom-left GTranslate
  Float pattern from the supplied screenshot instead of an above-header strip.
- Remove the strip; add a white globe/language-code button opening an upward
  searchable language panel with native/English names, a current selection
  checkmark and English restoration in the same list.
- Preserve provider loading, supported languages, preferences, RTL and private
  exclusions through the existing hidden provider-owned select. Keep keyboard
  dismissal/focus, mobile safe areas and viewport scrolling in the interface.
- Frontend lint/type/build, four existing browser-side tests and public SSR
  passed. A network-isolated browser checked the floating UI, native/English
  search, empty results, Escape/focus, outside click, Urdu RTL, English reset,
  French saved navigation, mobile/landscape bounds, drawer layering, provider
  retry and admin exclusion with no browser errors. Landscape panel height
  reserves the sticky header so it cannot cover the Close control.

## Automatic text translation — 2026-10-08

- PR #6 merged complaint workflow and Render free/ClamAV removal into main;
  development began this milestone aligned at `cf8ecbd`.
- Owner narrowed multilingual scope to automatic visible text translation with
  a language dropdown. No manually authored Urdu routes/admin fields required.
- Add a lazy GTranslate nonprofit free widget offering all provider languages;
  preserve English content, existing routes, images/documents and backend records.
- Isolate provider-owned dropdown DOM, protect changing client text and use fresh
  document navigation for translated pages. Exclude private form/review values,
  filenames, references, Turnstile and administration from translation.
- Details and owner review: `TEXT_TRANSLATION.md`. Global performance remains the
  next deferred milestone after translation review.
- Completed frontend lint/type/build, four retry/navigation tests, public SSR and
  dependency audit. Live Urdu/French, project sliders, blog filters, gallery zoom,
  pagination and Back passed. Isolated provider-engine tests excluded unique
  synthetic complaint values/files and retained the review on English restore;
  isolated mobile RTL/retry checks passed without browser errors. No live
  complaint submission or email was performed.


## Current deployment decision — 2026-10-07

The owner explicitly removed ClamAV to support a Render free deployment. New
uploads and seeds require type/signature/size validation, not antivirus scanning;
existing clean assets remain compatible. HTTPS email via Resend and an embedded
Mongo outbox processor remove the need for SMTP ports or a paid worker. See
[RENDER_FREE.md](RENDER_FREE.md) for configuration, sleep/quota limits and owner
acceptance. Earlier scanner/standalone-worker requirements below are historical
and are superseded by this decision. Development remains the working branch.


## Complete Gallery archive import (2026-10-07)

Extended `seed:gallery` on development from four preview releases to the full
supplied collection. All 57 newspaper entries belong to Press coverage; all 143
other entries belong to HRPF photographs. The authoritative CSV duplicate links
retain 200 source records with 176 canonical publications and 24 hidden duplicates.
Bundled WebP bytes and source records keep their original checksums. Added visible
scene descriptions and retained the existing preview descriptions/checkpoints.
Scan progress, summary counts, interrupted upload recovery and admin preservation
are covered by real MongoDB tests. Backend checks, all 40 source/seed tests and
34 MongoDB/Redis API tests pass locally. No private owner services were accessed.
Main and the deferred production scanner configuration remain unchanged.

## Populated project detail seed (2026-10-06)

Added opt-in `seed:projects` enrichment of the three existing homepage projects.
Source-based narratives/lists/timeline/qualitative results, six gallery placements
and three bundled project source-brief PDFs allow review of the full new layout.
The original seed checkpoints/news/record identities are retained. All 22 seed
tests pass, including seven new real MongoDB enrichment cases. Live application
uses the owner's private development services in Codespaces.

## Project detail redesign and project console (2026-10-06)

Implemented optional rich project details, cover plus 20 photos, 5 PDFs, safe
transactional media binding/release, shared detail rendering and `/admin/projects`
with preview and draft/publish workflows. Existing managed programme links and
seeded content remain compatible. `/projects` now uses managed records. Full
verification and the localhost browser limitation are recorded in
PROJECT_DETAILS.md. Remaining administration modules are unchanged.

## Homepage content update (2026-10-06)

Homepage-only replacement is implemented on development. All nine original
homepage sections, component order, literal CSS classes, theme and image positions
are retained. Nine supplied archive photos replace the stock hero, preview, quote and card images. See HOME_SOURCE_MAP.json for exact filenames and hashes.
Fixed homepage copy is bundled and requires no seed or admin approval. The sourced
chairman excerpt replaces the invented testimonial. Profile values replace the
unsubstantiated partner wordmarks in the same strip. Verified counts replace
invented impact/donation figures. Footer brand glyphs remain icons with actual
Facebook/TikTok/LinkedIn/YouTube destinations.

Public projects and news feeds are wired to the homepage. News shares BlogPost
records with blogs. Content roles have authenticated/CSRF-protected create/list,
versioned edit/delete, and audited publish/withdraw endpoints. Edits return a record
to draft and revoke its file. Clean owned cover images are delivered through fresh
entity checks. Supporting reader routes /programmes, /programmes/[slug] and /updates/[slug]
render managed bodies; existing project/news listing and other page designs remain
untouched for their later page-by-page work. Admin UI remains future work.
If feeds are empty or unavailable, the same card layouts show source programme
priorities and report overviews with honest labels, without invented project
names, publication dates, beneficiaries or partners. No live NGO database,
Cloudinary upload or email operation was performed. Gallery videos remain in the
admin scope for subsequent work.


## Current owner direction: frontend restored (2026-10-06)

The owner rejected the M4 frontend replacement and subsequent fixed-copy correction.
The entire frontend is restored to the pre-M4 tree at 9c4f900 (original prototype
layout, images, social icons and distinct focus-area icons). M4 backend work is
retained. Earlier descriptions of the M4 public frontend are historical and no
longer describe the current frontend. Its M4-only SSR command/CI step is removed.

Next work must proceed page by page: preserve the theme, layout, components,
image positions and icons; replace only default text with supplied NGO copy and
images with appropriate supplied photos. Additional page redesign is scoped to
individual pages. Do not impose admin approval for fixed NGO page copy.
Admin scope includes gallery image AND video management, alongside users,
memberships, complaints, board, blogs, documents, settings and inboxes.
Restoring the prototype also restores its original placeholder text/form behavior;
this rollback is not a claim that those flows are connected or production-ready.


Updated: 2026-10-05

## Done
- Reviewed the brief and supplied sources; owner approved the implementation plan.
- M0: completed the source audit, reuse map and continuity documents.
- Baseline lint, TypeScript check and production build passed in the assistant workspace.
- M1: moved the prototype into frontend/; all 182 app/component/data/lib/public files and the frontend lockfile are byte-identical to baseline.
- Added Express 5/TypeScript, environment validation, Helmet, exact-origin CORS, bounded JSON and redacted consistent errors.
- Added MongoDB/Redis connection handling, liveness/readiness checks and graceful shutdown.
- Added Node 24 Codespaces/Compose setup, Redis 8, root development commands and CI.
- Read installed Next 16.2.11 rewrite, allowedDevOrigins, environment and typegen guides required by AGENTS.md.
- M1 assistant checks passed: lint, both typechecks, all nine backend tests and both builds.
- Live built-service probe passed: direct and Next-proxied liveness 200, unavailable-dependency readiness 503, allowed-origin 200 and foreign-origin 403.
- Compose/workflow YAML and devcontainer JSON parsed; the pinned Node 24 image manifest returned 200.
- Verified nested env files, dependencies and seed assets are ignored; env example is trackable.
- GitHub PR CI passed for implementation commit f0cd57e2f8f4ad4327961de357f5ad75625a5846 (run 37311094157).

## M1 follow-up — independent app operation
- Owner reported invalid MONGODB_DB_NAME prevented Express listening; Next proxy returned 500.
- Removed root package.json and shared app scripts; each app runs/checks independently.
- Moved Redis Compose into backend/ and adjusted devcontainer paths/setup.
- Split CI into separate frontend/backend checks; documented Vercel/Render root directories.
- Added database-name whitespace/blank normalization and a regression check; invalid values remain redacted.
- Follow-up checks passed independently: frontend lint/typecheck/build; backend typecheck, 10 tests and build.
- Separate npm start processes verified direct and proxied liveness 200 and dependency-unavailable readiness 503.
- Compose paths/workspace mount and CI YAML parsed; no root application runner remains.
- GitHub follow-up CI passed for fa1ace780ec3344636a717467fdb43f794dffd4b (run 37318742183), with independent frontend/backend jobs. Owner Codespaces connectivity is verified below; visual acceptance remains pending.

## Codespaces connectivity verification — 2026-10-05
- Owner supplied localhost port-3000 results at 13:53 UTC: /api/health/live returned 200 alive; /api/health/ready returned 200 ready.
- This confirms the frontend rewrite reaches Express and both MongoDB and Redis ping successfully in the owner environment.
- Backend startup validation is no longer blocking these requests. Persistence of the corrected database-name configuration after restart is not yet confirmed.
- Initial frontend audit confirmed 11 findings. Updated Next.js/matching ESLint config to 16.3.8 and applied compatible transitive fixes. Production audit now has zero findings; full audit retains five dev-only entries from one unpatched braces advisory, documented in M1_VERIFICATION.md.

## Current state
- M1 is complete and merged into main at 68865eff5fff6225eb4b97fbaf06662d5d5a8095.
- M2 backend foundations are implemented on development; frontend and backend remain independent.
- Added all collection schemas/indexes, cookie authentication and refresh-family replay protection, CSRF and role enforcement.
- Added first-admin setup and versioned user administration with concurrent last-super-admin protection.
- Added atomic Redis limits, public cache helpers and recoverable purpose-bound form tickets.
- Added bounded scanned authenticated upload staging, ticket quotas/ownership, restricted delivery and unused-file cleanup.
- Added transactional complaint/membership/contact persistence, counters, identity encryption, idempotency and durable outbox records.
- Added separate BullMQ/Nodemailer worker, redacted delivery diagnostics and authorized failed-mail retry.
- Added generated OpenAPI contract and backend setup documentation.
- Local checks pass: 18 health/security tests, 16 MongoDB replica-set/Redis integration tests, typechecks, build, contract consistency and zero production audit findings.
- M2 implementation 160c81561080d1cac235701cc0229dcf16aa7e14 is published in PR #2 to main. GitHub CI run 37343608697 passed both independent jobs, including real backend integration and both production audits.
- Built API smoke passed: automatic index preparation, liveness/readiness and CSRF issuance all succeeded.

## Exact next step
M3 source/seed preparation is published and verified on development in PR #2.
Continue public content APIs and source-driven frontend pages, including the
release workflow for assets.

## M3 — source/seed preparation
- Added an audited manifest: 231 unpublished metadata records and 227 exact source references.
- Seven inactive board drafts preserve authoritative names/order and the Sidra designation/slot distinction.
- Gallery drafts preserve all 200 CSV records, 24 hidden duplicates, 17 AI restorations and dimensions/type/treatment.
- Three reports, four historical certificate documents, ten English content pages, three attributed draft report overviews and four private settings are prepared.
- Added offline check/plan, atomic local candidate preparation, database dry run and explicit transactional apply.
- Mongo source checkpoints and audit entries commit with drafts; reruns preserve admin edits, native entries and deletions. Conflicts/source drift are reported.
- All local checks passed: 22 unit/source tests, eight real seed integration scenarios, all 16 existing MongoDB/Redis/BullMQ checks, typechecks/build/contract consistency and clean production audit.
- Original ZIP inputs verified; all 200 gallery images decoded and matched CSV dimensions. Built CLI apply/rerun/dry-run smoke passed against disposable MongoDB.
- Prepared 216 local candidates and safely reran preparation; no organizational database/provider/email writes occurred.
- See M3_VERIFICATION.md and backend/seed/README.md. Provider upload/public release are not automatic.
- M3 implementation 61eb156fd7cc300d078a7659c9d096fa881f9e00 is published in the updated M2/M3 PR #2. GitHub CI run 37380616908 passed both jobs, all backend/source integration checks and production audits. Subsequent handoff changes are documentation only.

## M4 implemented
- Public content projections, reviewed file delivery and atomic audited publish/withdraw controls are implemented.
- Fixed frontend copy is bundled from supplied sources; managed board/blog/gallery/document routes consume backend data. Unsupported prototype content and fake receipts are removed.
- Independent frontend/backend checks, 23 integration scenarios, eight seed recovery scenarios, independent frontend SSR checks, full-stack source SSR smoke and both production dependency audits pass.
- M4 is published in PR #3; final implementation 6b994a33468525286dbf50a6e335761f77f88d7e passed GitHub CI run 37386325272 (both jobs).
- See M4_VERIFICATION.md for scope, verification and browser access limitation. Source files are not automatically published.

## Next milestone boundary
- Build admin interfaces for users, members, applications, complaints, board, blogs, gallery, documents, settings, inboxes and audit; wire actual frontend intake flows. No fixed-page CMS or review.
- Require reviewed clean assets for public release; convert/review the 2024 report and redact public document copies.
- Do not seed invented fees, members, statistics, validity or legal outcomes.
- Keep payment verification, member approval and complaint operational workflows separate from the M2 receipt/storage foundations.

## Open items
- Codespaces real connectivity passed; owner delegated visual acceptance and waived further personal review. Local Docker execution was unavailable; configuration validation and owner-hosted health results are recorded in M1_VERIFICATION.md.
- OPEN: five dev-only audit entries from unpatched braces in ESLint tooling; production dependency audit is clean. Monitor upstream; do not force a Next 14 ESLint downgrade.
- TODO-CONFIRM: membership fee/types/duration and legacy register; paid native submissions stay disabled.
- TODO-CONFIRM: SMTP sender/provider/notification settings and live worker transport; M2 tests use a capture sender, never real delivery.
- TODO-CONFIRM: Turnstile exact hostname/action configuration, private ClamAV daemon and Cloudinary authenticated delivery preflight.
- TODO-CONFIRM: production Vercel/Render proxy chain before setting TRUST_PROXY_CIDRS; blank is deliberately conservative.
- TODO-CONFIRM: renewed Charity Commission certificate and clearer PCP/FBR details; show historical dates only.
- TODO-CONFIRM: reviewed Urdu scope/translations, missing OCR Markdown, clean chairman photo, Threads/interview URLs and retention policy.
- TODO-CONFIRM: Cloudinary limits/PDF delivery and production hosting before relevant stages.

## Verification boundary
- M1 health unit tests use injected dependency status; owner-provided localhost readiness 200 confirmed Atlas/Redis in Codespaces at that time. M2 also runs actual isolated MongoDB transactions and Redis/BullMQ integration locally.
- M1 final-head CI passed and PR #1 is merged. Its desktop/mobile checks and runtime dependency remediation remain applicable; frontend is unchanged in M2.
- No organizational database was seeded, sensitive files uploaded externally or live email sent. M3 tests use audited metadata in disposable MongoDB; M2 uses synthetic operational fixtures.
- Public routes now consume reviewed API content. Intake forms are explicitly unavailable pending wiring; source imports remain draft-only. This is not a production activation.
- main remains stable; implementation stays on development.

## Owner correction: fixed page copy
Fixed NGO copy uses the owner-supplied page text, profile and current public details bundled in the frontend. Home, ten About sections, What We Do, contact, social links and donation details require no database seed, admin approval or publishing step. The fixed-page API and admin publishing kind were removed; legacy ContentPage seed rows remain source inventory without destructive database cleanup.

Admin scope remains users, members, membership applications, complaints, board, blogs, gallery, reports, certificates, settings, contact inbox and audit logs. Fixed-page CMS/review is excluded. Blog/gallery/document/board data remain managed records. File protection and membership/complaint operational approvals remain separate from fixed text.


## Homepage heading and seed correction

User requires the original Featured Projects and Latest News & Updates headings
and backend-managed records, including during initial setup. Removed programme/
report fallback cards and conditional headings; empty/offline feeds retain the
sections and headings without resurrecting withdrawn records. Added the separate
backend seed:home command with three documented intervention projects and three
report-derived news summaries, six bundled source covers, offline checksum plan,
ClamAV/Cloudinary upload and transactional publication. Reruns preserve admin
edits, withdrawals and deletions. See backend/seed/HOMEPAGE.md. Live import must
run against the user's privately configured development services; no credentials
or actual live upload/database execution are claimed here.


## Header and canonical route update — 2026-10-06
Implemented the owner-uploaded changes-file header: Our Work, Projects, Blogs,
Gallery (Media Coverage / TV Interviews), Get Involved and the eight-item About
submenu. File a Complaint and Donate are header actions. Removed Impact,
top-level Reports, Internships, Our People and Governance from navigation.
Public News/Updates routes redirect to Blogs; Reports moves to About / Progress
Reports. Existing BlogPost data remains intact; canonical admin Blogs APIs retain
legacy News compatibility. About text comes from supplied organisation pages;
board/documents/media remain reviewed public records. Membership uses the supplied
Google Form. TV recordings, complaint-field/notification changes and translation
remain subsequent work. See NAVIGATION_PLAN.md for the complete route mapping,
source interpretations, tests and Codespaces restart instructions.


## Rich blogs and administrator editor — 2026-10-06
Implemented `/blogs/[slug]` as a full article view, with category/public author,
publication date and reading time, takeaways, structured sections/lists/quotations,
contents, gallery, sources, PDF downloads, sharing and related released articles.
`/admin/blogs` supports the existing authenticated content roles, preview, drafts,
publish, withdraw and delete, using the same atomic media/privacy/version controls
as projects. Existing BlogPost records and legacy News APIs are retained.
Added explicit development-only `seed:blogs` enrichment for the three original
homepage articles, six archive photo attachments and three prepared source brief
PDFs. The source reports, seed preservation rules and Codespaces commands are in
BLOG_DETAILS.md and backend/seed/BLOGS.md. Live seeding requires the owner's
private service configuration; no live database/storage execution is claimed here.


## 2026-10-07 — prior work merged; Gallery on development

Merged PR #3 into main after its verified checks. Development was aligned to
that merge before implementing Gallery. The owner's clarified branch instruction
keeps the new Gallery implementation on development.

Added public press/photo search and modal zoom viewer, restoration/source labels,
managed TV interviews with allowlisted click-to-load YouTube/Vimeo players,
Gallery admin editing/preview/draft/publication/withdraw/delete, atomic image
binding and optimistic versions. Added four real source image examples and a
preservation/recovery seed, documented in GALLERY.md and backend/seed/GALLERY.md.
Local API and seed integration suites pass; owner service execution and visual
acceptance remain Codespaces steps.

## 2026-10-07 — Progress Reports and Registration / Certificates

Implemented generic document administration and improved public cards with a lazy
viewer, downloads, summaries, dates, edition/release notes and historical validity
labels. Added reviewed source import with hashes, all-files-first scans, transactional
release checkpoints and preservation of admin work and deletions. Bundled three
explicitly edited public report editions and four distinct original certificate
scans; originals with private case material are not committed or uploaded.

Validation includes both package checks, real Mongo/Redis API integration, full
source seed integration, production frontend SSR and rendered PDF review. Main
merge, global caching and permanent scanner hosting remain separate tasks.

## Board of Directors and Our Team — 2026-10-07

Implemented managed listings and full individual profiles using the supplied Word
biographies and original seven embedded photos. Added `/admin/board` with current
administrator permission checks, versioned audited draft CRUD, page placement,
optional Urdu sections, private previews and reviewed portrait publication.
`seed:board` verifies exact source photos, scans all before writes and safely
resumes while preserving admin/native/deleted content. The chairman's full twelve
sections are retained; actual Joint Chairperson designation is preserved.
No new staff biographies or private provider URLs are exposed. Further global
caching and permanent ClamAV hosting remain deferred. Next: complaint workflow.


## Complete complaint form and email workflow — 2026-10-07

- Owner specified complete submitted form email copies for user and admin.
- Replaced external-concern simulation with real three-step identity/complaint/files/review intake.
- Added exact private file attachments, escaped full-field HTML/text, durable retry and no silent omission.
- Added stable upload keys and saved-submission recovery after the upload window.
- Added private admin case listing/detail, assignment, guarded status transitions, notes/history and delivery retry.
- Updated complaint privacy disclosure, OpenAPI and private configuration examples.
- Main has Documents/Board/Team through merged PR #5 (0b161e9); complaint milestone stays on development.
- Live SMTP/provider/verification acceptance requires private setup; see COMPLAINTS.md.
- Local validation passed: 43 API/email integration tests, 53 source seed tests, 3 browser-side retry/limit tests, backend check/OpenAPI, frontend lint/type/build and production SSR. Complete complaint mail is exercised through the real BullMQ worker with a capture sender.
