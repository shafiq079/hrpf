# HRPF Progress

## Homepage content update (2026-10-06)

Homepage-only replacement is implemented on development. All nine original
homepage sections, component order, literal CSS classes, theme and image positions
are retained. Supplied archive photos replace the three stock photos; card images
also use source photos. See HOME_SOURCE_MAP.json for exact filenames and hashes.
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
