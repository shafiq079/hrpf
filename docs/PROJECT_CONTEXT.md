# HRPF Project Context

## Current deployment decision — 2026-10-07

The owner explicitly removed ClamAV to support a Render free deployment. New
uploads and seeds require type/signature/size validation, not antivirus scanning;
existing clean assets remain compatible. HTTPS email via Resend and an embedded
Mongo outbox processor remove the need for SMTP ports or a paid worker. See
[RENDER_FREE.md](RENDER_FREE.md) for configuration, sleep/quota limits and owner
acceptance. Earlier scanner/standalone-worker requirements below are historical
and are superseded by this decision. Development remains the working branch.


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

## Authority and workflow
- Read HRPF_Project_Brief.md from Project Files first in every new chat.
- Source priority: brief and owner messages; individual sources; PROFILE HRPF.docx as fallback only.
- Implementation plan approved on 2026-10-05.
- Owner runs code in GitHub Codespaces and reports verification results.
- Work on development; main is stable. Deliver one verified milestone per message.
- Never request, print or commit credentials.

## Repository and audit baseline
- Repository: https://github.com/shafiq079/hrpf
- Prototype baseline: d3848c940d8bf260c7b2657a66473df991777296.
- Next.js 16.3.8 App Router (upgraded from prototype 16.2.11), React/React DOM 19.2.4, Tailwind 4, TypeScript, npm/package-lock.json.
- M1 moved the application to frontend/: app/, components/, data/, lib/, public/.
- Frontend and backend are independent packages with separate lockfiles; no root package.json, npm workspaces or shared app runner.
- Hosting target: Vercel Root Directory frontend; Render Root Directory backend.
- Root holds shared repository documentation, Git and Codespaces/CI configuration only.
- 31 page files, including five dynamic page files; 13 local data modules.
- Baseline had no backend, app API routes, admin panel, CI workflows or tests.
- M1 adds independent app infrastructure. M2 implements the backend foundations described below; public/admin UI wiring remains planned.
- Source audit completed. Assistant baseline lint, typecheck and build passed.
- All 182 application/content/asset files were byte-identical immediately after the folder move. M1 acceptance subsequently fixes the mobile drawer in one component: unmount when closed and use a body portal when open to remove overflow/focusability and the sticky-header height constraint; theme and content remain unchanged.
- Owner Codespaces localhost live/ready checks returned 200 on 2026-10-05: frontend proxy, Express and real MongoDB/Redis connectivity verified.
- Updated Next.js and matching ESLint config to 16.3.8; applied compatible transitive dependency fixes. Production dependency audit reports zero findings.
- Full audit retains five dev-only package findings caused by one unpatched braces advisory in the Next ESLint rootDir-glob dependency chain; no custom rootDir glob is configured and it is not a runtime dependency. See docs/M1_VERIFICATION.md.
- Owner delegated UI review and explicitly authorized M1 merge on 2026-10-05; no further owner review is required.
- Delegated Chromium review passed on seven desktop routes and five mobile routes, including open-drawer height/navigation, with no browser errors. See docs/M1_VERIFICATION.md for evidence and limits.
- See docs/FRONTEND_AUDIT.md for evidence and migration decisions.

## Preserve the prototype
- Keep blue/navy/gold palette, Inter/Lora fonts, square corners, spacing, cards and animation style.
- Reuse Header, MobileNavigation, Footer, PageHero, Container, PrimaryButton, AppImage, Accordion and existing cards/forms.
- In M1 move existing application folders into frontend/ without introducing src/ or redesigning components.
- Keep the existing alias convention @/* relative to the frontend root.
- Root AGENTS.md requires reading the installed Next.js guides before authoring Next.js changes.

## Target architecture
- frontend/: existing Next.js application and later public/admin routes.
- backend/: Express API, MongoDB models, upload services, email worker and seed scripts.
- MongoDB Atlas is authoritative; separate hrpf_dev and hrpf_prod databases.
- Cloudinary stores public assets and authenticated sensitive assets under separate environment namespaces.
- Implemented Redis uses: shared client/account limits, public read-through cache helpers, purpose-bound form-ticket mirrors and BullMQ outbox jobs.
- Implemented: Next beforeFiles rewrites /api/* to Express on port 5000.
- INTERNAL_API_URL is an optional server-only upstream origin, default http://127.0.0.1:5000.
- Frontend port 3000; backend port 5000; only 3000 is automatically forwarded.
- Node 24 devcontainer uses backend/compose.yaml with Redis 8; Redis is not publicly forwarded.
- Rebuilt workspace gets REDIS_URL=redis://redis:6379; host CLI alternative uses 127.0.0.1.
- backend/.env is ignored; secret-free .env.example is tracked; inherited secrets override .env.
- M1 security: Helmet, exact-origin CORS, bounded JSON, Zod configuration/query validation, redacted errors.
- M2 replaces process-local limits with atomic Redis limits. TRUST_PROXY_CIDRS defaults empty; configure only a verified deployment chain before production.
- Implemented auth: HttpOnly JWT access/rotating refresh cookies, Mongo session families, live role/active/version checks, signed session-bound CSRF, reset-token consumption and immediate session revocation.
- Implemented MongoDB transactional outbox plus a separate BullMQ/Nodemailer worker. SMTP acceptance followed by a crash can duplicate mail; exactly-once delivery is not promised.

## Planned public routes and endpoints
- Navigation: Home, About, What We Do, Gallery, Blogs, Get Involved, Contact.
- Progress Reports is under About. Gallery categories: media-coverage and in-action.
- English is the authored source. The owner selected automatic multilingual public
  text translation through a browser language dropdown; no `/ur/` routes are added.
  See TEXT_TRANSLATION.md for the current approved scope.
- Main reads: /api/settings/public, /api/content/:key, /api/board, /api/blogs, /api/gallery, /api/reports, /api/certificates.
- Report download: GET /api/reports/:id/download.
- Main submissions: POST /api/complaints, /api/membership-applications and /api/contact-messages.
- Form tickets/uploads: /api/forms/session and /api/form-uploads.
- Auth: /api/auth/*; private operational endpoints: /api/admin/*.
- Implemented M2: health, /api/auth/*, form session/uploads, complaints, membership applications and contact submissions; admin users, staged/restricted assets, audit/outbox reads and outbox retry. backend/openapi.json lists the exact implemented contracts.
- Health readiness also requires additive index preparation. Production business routes fail closed before Mongo/index/Redis availability. Public content reads and operational review/approval/additional-information endpoints remain planned.
- Errors: {error:{code,message,fields?,requestId}}; success: {data:...}.

## Implemented collection foundations
- User, Member, MembershipApplication, BoardMember, Complaint.
- BlogPost, BlogCategory, GalleryItem, Report, Certificate.
- ContactMessage, Setting, AuditLog.
- Supporting: ContentPage, Asset, AuthSession, Counter, EmailOutbox and FormTicket.
- Strict Mongoose schemas, unique/partial/TTL/read indexes; additive preparation never drops indexes.
- Complaint identity uses entity-bound AES-256-GCM and a separate keyed CNIC lookup hash.
- Form submission atomically consumes a ticket, claims clean owned files, allocates a reference and stores applicant/admin outbox records. Same-ticket/key retries do not duplicate records.
- Membership stays disabled without validated enabled policy; applications snapshot fee and validity, remain payment-unverified, and do not create members.
- Files require a clean ClamAV scan before Cloudinary storage; M2 stages authenticated assets only. Reviewed public publication is a later content workflow.
- Sensitive attachments require backend authorization on each delivery request.
- User updates use optimistic versions plus a transaction governance lock to preserve the last active super administrator. Operational case statuses and membership approval concurrency follow in later workflows.

## Source and import decisions
- Board: seven people from Board of Directors.docx, ordered by the brief.
- Dr. Sidra Mubashir: designation Joint Chairperson; slotLabel Vice Chairman; rank 3.
- Gallery: 200 manifest records; 24 hidden duplicates; 176 unique candidates before privacy review.
- Preserve AI_RESTORATION metadata on 17 in-action records.
- Three progress reports; convert 2024 DOCX to PDF and review public copies.
- Five certificate scans represent four distinct documents; show historical validity dates.
- Seed scripts: dry-run, stable keys, checksums, resume and preservation of admin edits.
- M3 implements those scripts in backend/: seed:check, seed:plan, seed:prepare and seed:import (offline by default; --database reads, --apply inserts missing drafts).
- Tracked source manifest contains 231 unpublished records and 227 exact references. SourceImport checkpoints retain checksums/review tasks and commit atomically with drafts/audit; reruns never overwrite edits or recreate deletions.
- Local preparation creates 216 pending candidates without provider upload. Gallery drafts allow missing assets; document validation prevents publication without a reviewed asset or while a duplicate link remains.
- Four private settings, ten English pages and three attributed draft report overviews are prepared. Membership policy stays unset. The 2024 PDF conversion/full constitutional proofreading/public release remain pending.
- No invented members, statistics, partnerships, fees, certificate validity or legal outcomes.
- Native paid membership submission remains disabled until policy is configured.

## Working commands
- In backend/: npm ci; npm run setup (preserves .env); npm run setup:security (generates only missing keys); npm run check; npm run dev.
- First administrator: configure seed variables privately; npm run admin:create on an empty User collection.
- Separate email process: npm run worker:dev or built npm run worker with configured SMTP.
- Integration checks: npm run test:integration, using isolated real MongoDB replica-set and disposable Redis; never target organizational Redis.
- In frontend/: npm ci; npm run check; npm run dev -- --hostname 0.0.0.0.
- Stop/restart each app independently. npm run build and npm start are local to each app.
- CI has independent frontend/backend jobs; backend additionally runs MongoDB/Redis integration and production audit without organization credentials.
- MONGODB_DB_NAME is a name such as hrpf_dev, never a URI; blank uses default and whitespace is trimmed.
- Inherited environment/Codespaces secrets take priority over backend/.env.
- INTERNAL_API_URL on Vercel targets the Render HTTPS origin; FRONTEND_URL on Render targets the public frontend origin.

## Continuity
- PROJECT_CONTEXT.md: architecture and authoritative current state.
- DECISIONS.md: dated decisions and reasons.
- PROGRESS.md: completed work, current work, next action and blockers.
- Every working session ends with a HANDOFF and complete changed docs text.

## M1 handoff
- PR #1 merged into main on 2026-10-05 at 68865eff5fff6225eb4b97fbaf06662d5d5a8095.
- Final reviewed implementation: 32e473c481f3f1816aa66873d634669d2ce1a412; GitHub run 37323882076 passed.
- Development was fast-forwarded to the main merge; handoff docs continue on development.
- M1 is complete. M2 backend foundations are implemented on development; see the M2 handoff below.

## M2 handoff — 2026-10-05
- Local backend checks passed: 18 health/security tests, 16 real MongoDB/Redis integration tests, both typechecks, build and OpenAPI drift check.
- Production backend audit: zero findings. Frontend files are unchanged; prior M1 acceptance remains applicable.
- External Cloudinary, ClamAV, Turnstile, SMTP and production proxy-chain checks remain pending private configuration; fixtures exercise failure gates and services without sending external messages.
- No organization records imported, sensitive files uploaded externally, or live email sent. Prototype UI forms still simulate submissions.
- M2 implementation 160c81561080d1cac235701cc0229dcf16aa7e14 is published on development in PR #2 to main. GitHub CI run 37343608697 passed frontend/backend jobs, real integration and production audits. Merge authorization from the owner was specific to M1.
- Built API smoke verified automatic index preparation, live/ready 200 and CSRF 200. Subsequent handoff edits are documentation only.
- Next work: source/seed preparation in the approved plan, followed by public content and form/admin UI wiring. Do not claim that M2 enables the existing frontend forms.

## M3 handoff — 2026-10-05
- Source/seed preparation is implemented and locally verified; see M3_VERIFICATION.md and backend/seed/README.md.
- Checks passed: 22 unit/source tests, eight real seed integration scenarios, all 16 M2 integration checks, typechecks/build/OpenAPI and zero production audit findings.
- Source ZIP verification, decoding of all 200 gallery images and built CLI import/rerun/dry-run smoke passed. No organizational Atlas records, external uploads or live email were created.
- Existing PR #2 remains open from development to main and includes M2/M3. Frontend tree is unchanged; public source-driven pages/APIs and reviewed asset release follow next.
- Published M3 implementation: 61eb156fd7cc300d078a7659c9d096fa881f9e00. GitHub CI run 37380616908 passed both independent jobs, backend/seed integration and production audits. PR #2 now describes M2/M3; later handoff edits are documentation only.

## Current M4 boundary
M1 and M2/M3 are merged into main. M4 is on development in PR #3.
Fixed NGO copy uses the owner-supplied page text, profile and current public details bundled in the frontend. Home, ten About sections, What We Do, contact, social links and donation details require no database seed, admin approval or publishing step. The fixed-page API and admin publishing kind were removed; legacy ContentPage seed rows remain source inventory without destructive database cleanup.

Admin scope remains users, members, membership applications, complaints, board, blogs, gallery, reports, certificates, settings, contact inbox and audit logs. Fixed-page CMS/review is excluded. Blog/gallery/document/board data remain managed records. File protection and membership/complaint operational approvals remain separate from fixed text.

Admin UI, real form wiring and operational workflows are next. See M4_VERIFICATION.md.


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
