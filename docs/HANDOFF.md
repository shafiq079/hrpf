# Current handoff: All six Our Work menu pages redesigned

## Current milestone — 2026-10-08

The owner accepted the general Women’s Rights page and asked for the remaining
menu pages one by one. Implemented Children’s Rights, Access to Justice, Minority
Rights, Education and Awareness, and Research and Advocacy in that sequence.
All six use the approved institutional layout, supplied photographs, distinct
priorities/approach/FAQs and **Projects in this field** from released managed records.

`frontend/components/work/WorkAreaView.tsx` replaces the women-only view without
changing its layout. `frontend/data/workAreas.ts` supplies all six source-based
page configurations; women’s existing fixed content remains in `womensRights.ts`.
No hardcoded cases, source notes, photo captions, fake metrics or prototype
programme/testimonial sections appear in these category pages.

Projects use each category title as the existing editor Focus area, including
straight or curly apostrophes. The source-seeded children’s health project matches
Children’s Rights; the women’s project matches Women’s Rights. No seed or live
publication writes are required or performed here. If another field has no released
projects, it shows the general page and a simple empty-project state.

Frontend lint/type/build, four existing tests and expanded public SSR/navigation
passed. Browser checks cover all five new pages’ desktop/mobile images, metadata,
anchors, keyboard FAQs and project links, plus women’s regression and isolated
Urdu RTL/English restoration. No backend changes in this continuation.

Development remains the working branch; PR #8 contains the complete six-page
redesign. Main is not merged. See `OUR_WORK_REDESIGN.md` for the source map,
photo provenance and full scope. Next content review: Our Work overview and its two
legacy non-menu categories, if requested. Caching remains deferred until the owner
is satisfied with the page corrections.

## Prior translation milestone — 2026-10-08

Complaint workflow, ClamAV removal and Render free email/deployment configuration
were merged into main through PR #6 (`cf8ecbd`) with checks passing. Development
was fast-forwarded to that merge before this milestone.

The owner chose automatic translation of visible website text across multiple
languages, superseding the manually managed Urdu-only route/editor proposal.
GTranslate's nonprofit free translation engine is integrated lazily on public pages, with
English source content, RTL direction, React-safe changing text and navigation,
and private input/review/admin exclusions. See `TEXT_TRANSLATION.md` for scope,
provider operation and review instructions. This new work stays on development.
Local frontend checks passed. Live public Urdu/French translation and collection
interactions passed; private complaint payload/English-restore and mobile checks
used a network-isolated provider engine. No reseeding or API key is required.
The owner rejected the above-header strip after functional review. It is replaced
by a bottom-left white floating globe/language-code button and an upward narrow
language panel titled "Translate", following the supplied GTranslate Float
screenshot. Each language appears once in its native name, with no search box
or automatic-translation footer, per the owner's follow-up. Existing
translation behaviour uses the same hidden provider-owned native select.
The newer Our Work direction above supersedes the earlier caching-first sequence.

## Current deployment decision — 2026-10-07

The owner explicitly removed ClamAV to support a Render free deployment. New
uploads and seeds require type/signature/size validation, not antivirus scanning;
existing clean assets remain compatible. HTTPS email via Resend and an embedded
Mongo outbox processor remove the need for SMTP ports or a paid worker. See
[RENDER_FREE.md](RENDER_FREE.md) for configuration, sleep/quota limits and owner
acceptance. Earlier scanner/standalone-worker requirements below are historical
and are superseded by this decision. Development remains the working branch.


The user clarified that both the user and admin must receive a complete form copy
by email. `/file-a-complaint` now submits real identity/contact/address, complaint,
previous-proceedings and scanned private file data. Complete text/HTML copies with
all uploaded files use the durable SMTP outbox. `/admin/complaints` provides private
review, assignment, status/history, notes and per-copy delivery state/retry. See
`COMPLAINTS.md` for exact fields, controls, private setup and Codespaces review.

Progress Reports, Certificates, Board of Directors and Our Team were merged into
main through PR #5 (`0b161e9`) with both CI jobs passing. Development began this
milestone at the same merge. New complaint changes stay on development until an
explicit new merge instruction. Next planned functional milestone: Urdu
translation, then global future-content performance and production hardening.

Actual email requires private SMTP and approved ADMIN_NOTIFY_EMAILS configuration,
the separate worker and Turnstile frontend/backend configuration. No live external
email or owner-provider write is claimed. The owner's existing Cloudinary PDF
policy block remains unresolved at account level. Permanent ClamAV/worker hosting
and global caching remain deferred.

---

# HRPF handoff

## Current state and next task — 2026-10-07

The complete Gallery implementation and 200-entry archive importer were merged
into main through PR #4 (`3c9b2a7`), after both CI jobs passed. Development was
fast-forwarded to the same merge commit. This supersedes the older branch-state
instructions below. Future implementation work continues on development.

The owner requires reusable caching that automatically supports future admin
uploads, not only the current source dataset. Website speed is an explicit
requirement, but the owner has deferred caching/performance until the end of
functional implementation. See [PERFORMANCE_PLAN.md](PERFORMANCE_PLAN.md) for
that deferred scope and acceptance checks; no performance cache is implemented.

Return to the earlier post-Gallery order: Progress Reports and Registration /
Certificates; then Board of Directors / Our Team; then the complaint workflow;
then Urdu translation. Next: managed public document pages, their admin inputs
and sourced import/preview, beginning with Progress Reports and Certificates.

## Current branch state and Gallery — 2026-10-07

All previous homepage, navigation, rich project/blog, admin and source seed work
is now on `main` through merged PR #3 (`9795ada`). This supersedes the historical
branch-status statements below. The owner explicitly asked for Gallery work on
`development`; keep it there until a later explicit merge request.

Gallery now has a searchable press/photo archive, zoomable viewer, sourced
captions, AI restoration labels and TV interview cards with click-to-load hosted
players. `/admin/gallery` supports the existing content accounts, private image
uploads, previews, drafts, publication, withdrawal and deletion for both kinds.
See GALLERY.md for the complete fields/API/security contract and local checks.
`npm run seed:gallery -- --apply` now covers all 200 supplied archive entries:
44 press cuttings and 132 photographs/graphics publish once; 24 indexed duplicates
remain hidden. The original four releases are preserved, including later admin
edits. Original WebP bytes, source CSVs and scene descriptions are bundled; the
command verifies/scans all files, reports progress and resumes interrupted uploads
without re-uploading completed releases. Use `seed:gallery` for offline checks
and `seed:gallery -- --database` for a read-only plan first. Private application
uses the owner's existing Codespaces services. No real individual interview
URLs were supplied, so no fake interviews are seeded. No private provider write
or interactive visual acceptance is claimed in this environment.
Permanent ClamAV startup/production deployment remains explicitly deferred.

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
