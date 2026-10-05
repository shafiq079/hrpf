# M4 public content and publication controls

M4 replaces public prototype content with independently fetched backend projections.
It is an implementation milestone, not a production activation or document release.

## Implemented

- Public settings allow only identity, contact, social links and donations, with field-level schemas that strip extra properties. Private settings are excluded.
- Content and blogs require approved review, publication at or before the current time, and the exact requested English/Urdu locale. Unpublished articles return 404; outages render an unavailable state rather than invented content.
- Public board records require activation and retain authoritative designation/slot distinctions. Photos are optional; missing photos show initials rather than invented people.
- Gallery, reports and certificates join clean public claimed files to the exact released entity before pagination/counting. Duplicate gallery entries are excluded.
- Bounded literal blog-title search, gallery categories, pagination, masonry and an accessible native-dialog image viewer with zoom and keyboard navigation.
- Public files remain authenticated in Cloudinary. The backend rechecks the current publication state before streaming; no provider ID/URL, source checksum or restricted original enters a public response. HTTP responses and frontend data fetches are no-store; released images bypass Next's image optimizer cache so withdrawal remains effective.
- Report download links deliver only the reviewed public PDF. Successful GET transfers increment downloads; HEAD does not.
- Authenticated review lists and publish/withdraw endpoints require entity permissions. Mutations require exact-Origin CSRF, current active roles, a matching optimistic version and explicit release review attestation. Clean staged files must belong to the publishing operator; complaint/membership evidence cannot be repurposed. Record, asset visibility and audit entries commit atomically.
- Board creation now defaults inactive. Source imports continue creating unpublished/private drafts and preserve edits.
- Approved navigation and sourced Home/About/What We Do/Board/Blogs/Gallery/Reports/Certificates/Contact/Donate pages retain the existing typography, palette, hero, card and footer styles. Membership uses the supplied Google Form until policy is confirmed.
- Unsupported fictional projects, events, campaigns and old detail routes return 404. Relevant old list routes redirect. Online forms display their unavailable state instead of simulated receipts; operational frontend intake is a later milestone.
- Removed fabricated founding year, metrics, testimonials, partner content, platform-homepage social links and newsletter simulation from public routes. Unapproved legal policies are explicitly pending.

## Verification

- Frontend lint, route-aware TypeScript and production build pass. Independent `npm run test:public` covers 19 rendered routes, five real 404s, publication freshness, pending/unavailable states and cookie isolation; it is included in frontend CI.
- Full-stack production SSR smoke against real disposable seeded MongoDB/Redis passes for 14 public routes plus article detail, literal no-results, gallery category/pagination, five 404s, three legacy redirects, same-origin asset streaming and backend outage. Synthetic image/PDF fixtures replace real source binaries.
- Backend TypeScript, build, 22 unit/source tests, manifest checks and generated OpenAPI consistency pass.
- All 23 real MongoDB replica-set/Redis/BullMQ integration scenarios pass, including seven new public/publication checks: secret exclusion, draft visibility, RBAC/CSRF/review attestation, concurrent version conflicts, reviewed asset publication/withdrawal, foreign/identity asset rollback, PDF downloads/HEAD and bounded literal blog searches.
- All eight real source import recovery/preservation scenarios pass.
- Both production dependency audits report zero vulnerabilities. The previously recorded development-only ESLint dependency advisory remains outside this runtime audit.
- Tests use disposable databases, synthetic files and injected provider adapters. No organization database, live Cloudinary storage or email transport was changed.

## Verification limits and release requirements

The cloud browser rejects the local preview URL with `ERR_BLOCKED_BY_CLIENT`.
Desktop/mobile visual and interactive lightbox review could not be completed in this
session. The server-rendered checks above do not claim browser interaction or visual coverage.

No organizational sources are automatically published. After seeding drafts, an
operator must review record text/descriptions and any public file copy, scan/upload
it, and use the publication endpoint. Restricted report originals stay separate;
the 2024 DOCX still requires a reviewed PDF conversion. Sensitive document/image
redaction, chairman-photo cleanup and source-specific alt text remain release work.
The admin interface, form wiring, operational review/approval workflows, Urdu
translations and production provider/hosting preflight remain later steps.

## Publication history

M4 implementation fa56aceb455e23a11685538650475e54dc7828b0 is published in
[PR #3](https://github.com/shafiq079/hrpf/pull/3). GitHub CI run 37385928032
passed both independent jobs, including the new frontend SSR suite, all backend
integration/source checks and production audits. Follow-up hardening restricts
review lists to public-setting keys and enforces authenticated provider delivery;
source pillars retain the existing animated focus-area card grid. The final implementation is
6b994a33468525286dbf50a6e335761f77f88d7e; GitHub CI run 37386325272 passed
both jobs with the follow-up checks. Subsequent handoff edits are documentation
only.
