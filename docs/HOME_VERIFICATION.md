# Homepage content and managed feeds

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

## Verification

- Existing component literal CSS classes and section order match the original.
- Three supplied STANDARD_CLEANUP WebPs are copied byte-for-byte; no AI edits.
- Frontend lint, typecheck and production build pass.
- Homepage SSR regression checks sourced copy/photos, excludes fabricated claims,
  verifies live feed refresh, detail routes/404s, source fallback for empty/offline
  feeds and cookie isolation. Included in independent frontend CI.
- Backend checks, 22 unit/source tests, 25 real MongoDB/Redis/BullMQ integration
  scenarios and eight seed recovery/preservation scenarios pass.
- New integration scenarios exercise RBAC, CSRF, draft exclusion, stale versions,
  CRUD/publishing, cover ownership/delivery and immediate revocation on editing.
- OpenAPI is generated from route input contracts.

Visual/interactive browser verification could not run: agent-browser's bundled
Chrome installer hit a certificate-chain error; a manually fetched Chrome binary
confirmed that this environment denies the Unix sockets needed for browser startup.
No desktop/mobile screenshot or browser interaction pass is claimed. The SSR suite
and unchanged original CSS/layout checks do pass.
