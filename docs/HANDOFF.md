# HRPF handoff

## Populate the project redesign (2026-10-06)

Owner wants populated project pages for review without entering the new fields
manually. Added separate `backend` command `npm run seed:projects -- --apply`
to enrich the three already-published homepage projects with sourced sections,
two gallery photos and one prepared source-summary PDF each. Uses the same
private MongoDB/ClamAV/Cloudinary and SEED_ACTOR_EMAIL configuration. Actual
private execution must run in Codespaces; no live write is claimed here.
See backend/seed/HOMEPAGE.md for preservation/recovery behavior. All 22 seed
tests and backend checks passed locally, including seven new enrichment tests.

## Project detail redesign and project console (2026-10-06)

The owner's requested project redesign is implemented on development. See
PROJECT_DETAILS.md for fields, limits, routes, security behavior and checks.
`/admin/projects` now supports existing content accounts, photo/PDF uploads,
rich sections, preview, draft/publish, edit, withdraw and delete. Reader routes
`/projects/[slug]` and `/programmes/[slug]` share the new view; `/projects` uses
managed records. This supersedes earlier statements that all admin UI is future
work, for projects only. Existing seeded records need no migration or reseed.
Other admin modules and live Codespaces visual acceptance remain outstanding.

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


2026-10-05: M1 and M2/M3 are merged into main (PR #1 and PR #2).
M4 public content APIs, audited publication controls and source-driven frontend
pages are implemented on development. Packages remain independent and the
prototype's visual components/theme are retained. See M4_VERIFICATION.md for
checks and the browser verification limitation.

Start with the Project Files brief, PROJECT_CONTEXT.md, PROGRESS.md,
DECISIONS.md, M2_VERIFICATION.md, M3_VERIFICATION.md and M4_VERIFICATION.md. Backend README/OpenAPI describe exact setup
and implemented routes. Do not read source credential documents or request secrets.

M2 implementation commit is 160c81561080d1cac235701cc0229dcf16aa7e14;
GitHub CI run 37343608697 passed both jobs, including real integration checks.
PR: https://github.com/shafiq079/hrpf/pull/2. M3 adds 231 draft metadata records,
checksummed source verification and repeatable imports/local asset preparation.
See backend/seed/README.md for commands. M3 implementation is published at
61eb156fd7cc300d078a7659c9d096fa881f9e00. GitHub CI run 37380616908 passed
both jobs, including all backend/source tests, both integration suites and
production dependency audits. Subsequent handoff edits are documentation only.
Fixed NGO copy uses the owner-supplied page text, profile and current public details bundled in the frontend. Home, ten About sections, What We Do, contact, social links and donation details require no database seed, admin approval or publishing step. The fixed-page API and admin publishing kind were removed; legacy ContentPage seed rows remain source inventory without destructive database cleanup.

Admin scope remains users, members, membership applications, complaints, board, blogs, gallery, reports, certificates, settings, contact inbox and audit logs. Fixed-page CMS/review is excluded. Blog/gallery/document/board data remain managed records. File protection and membership/complaint operational approvals remain separate from fixed text.

Next: admin interfaces for the listed managed entities and real form wiring. Membership currently uses the supplied Google Form; no live provider writes were made.

M4 PR: https://github.com/shafiq079/hrpf/pull/3. Initial implementation
fa56aceb455e23a11685538650475e54dc7828b0 passed GitHub CI run 37385928032
(both jobs). Final implementation 6b994a33468525286dbf50a6e335761f77f88d7e includes release
hardening and card reuse; GitHub CI run 37386325272 passed both jobs. The fixed-copy correction supersedes the earlier fixed-page publication design. Main is unchanged by M4.


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
