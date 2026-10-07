# HRPF backend

Run every command here, independently of `frontend/`. Node 24 is required.

```bash
npm ci
npm run setup
npm run setup:security
npm run check
npm run dev
```

`setup` preserves an existing `.env`. `setup:security` appends only missing
security keys, preserves configured keys, and prints no key values. It never
changes inherited Codespaces secrets. Restart the API after configuration changes.
Back up `DATA_ENCRYPTION_KEY` and `CNIC_HASH_KEY` securely before storing real
complaints; changing them loses decryption or lookup continuity. Keep JWT access
and refresh secrets distinct. No keys belong in the frontend or Git.

MongoDB must support replica-set transactions (Atlas does). Use only `hrpf_dev`
for development and a separate production database. The API ensures additive
indexes after connecting; it never drops indexes. Readiness and business routes
remain unavailable until indexes are prepared and Redis is connected. Existing
unique-key conflicts must be fixed deliberately; startup errors omit private values.
An operator can also ensure indexes explicitly:

```bash
npm run db:indexes
```

For an empty User collection, set `SEED_ADMIN_EMAIL` and a 12–200 character
`SEED_ADMIN_PASSWORD` privately, then run:

```bash
npm run admin:create
```

This creates one initial super administrator and refuses to overwrite an
existing account. Remove the seed password afterward. Sign-in UI is a later
milestone. The API already supports login, refresh, logout, password reset and
safe current-user reads. User administration requires `super_admin`; role and
active-state changes invalidate existing access tokens immediately. Concurrent
updates cannot deactivate/demote the last active super administrator.

Browser clients use the frontend's same-origin `/api` proxy with cookies. Fetch
`/api/auth/csrf`, then send its token as `X-CSRF-Token` on every mutating auth/admin
request. Keep the token returned by login/refresh; rotation changes its session
binding. Send the exact configured frontend Origin. Cookies are HttpOnly,
SameSite=Lax, host-only; production adds Secure and `__Host-` names. Tokens must
not be put in localStorage. Refresh requests must be serialized by the later UI.

`TRUST_PROXY_CIDRS` defaults empty and ignores spoofed forwarded IP headers.
Configure only verified proxy addresses/CIDRs for the actual Vercel → Render
chain. Do not use blanket trust or an arbitrary hop count. Without a verified
chain, proxied clients share the proxy's rate-limit bucket. Redis limits fail
closed; health endpoints remain available. No production proxy trust is claimed.

Forms use a single-use Turnstile verification to obtain a 15-minute bearer ticket
from `POST /api/forms/session`. Configure `TURNSTILE_SECRET_KEY` and exact
`TURNSTILE_HOSTNAMES`; the widget action must match `complaint`, `membership` or
`contact`. There is no development bypass. The ticket is purpose-bound in MongoDB
and mirrored in Redis; the mirror recovers after Redis restarts. Multipart uploads
send `X-Form-Ticket` and one `file` field. JSON submission sends the ticket, consent
version and UUID `submissionKey`. Retry identical data with the original ticket
and key within the ticket lifetime. Different data with that key returns 409.
A successful acknowledgement means stored, not emailed or approved.

Complaint CNICs use AES-256-GCM with entity-bound authenticated context and a
separate keyed lookup hash. CNIC images, payment proofs and complaint attachments
stay authenticated. The API claims clean files, consumes the ticket, increments
the reference counter, stores the submission and creates outbox entries in one
MongoDB transaction. Invalid or foreign files roll back all those operations.
No public complaint lookup is available. Membership remains disabled without an
enabled validated `membershipPolicy` Setting; fee, currency, policy version and
validity are snapshotted from that policy. Submission never verifies payment or
creates a member. Approval and additional-information workflows follow later.

Uploads accept JPG, PNG or WebP up to 5 MB, or PDF up to 10 MB. Extension,
declared MIME and detected signature must match. SVG and other types are rejected.
Complaint tickets allow five files and 15 MB total; membership allows one proof.
Quota reservation and file claiming are atomic. Configure Cloudinary privately.
New uploads are type-checked and staged as authenticated files; antivirus scanning
was removed at the owner's request. Public copies require explicit review and
publication. Existing clean files keep working; quarantined/infected files remain
blocked. No CLAMAV variables or daemon are consumed.

Restricted files are streamed through `/api/admin/assets/:id/content` after
current authentication and role authorization, with attachment/no-store headers.
Provider URLs are never returned or redirected. Public-release review must happen
before later public delivery. Image/PDF format checks do
not themselves establish that content is safe for public release.

Email delivery supports two providers and two execution modes. SMTP remains the
default for existing private development settings. Configure SMTP_HOST, SMTP_PORT,
SMTP_SECURE and MAIL_FROM; 587 requires STARTTLS and 465 uses secure TLS. In this
mode run `npm run worker:dev`, or `npm run worker` after building, as a separate
process with EMAIL_DELIVERY_MODE=worker.

For Render free, set EMAIL_PROVIDER=resend, EMAIL_DELIVERY_MODE=embedded,
RESEND_API_KEY and MAIL_FROM at a verified owned domain. Start only the API; it
drains the Mongo outbox while awake without a separate worker or SMTP ports.
Full form and all attachments are emailed to user/admin. ADMIN_NOTIFY_EMAILS is
required for complaints. The durable outbox uses leases, backoff/eight attempts,
manual admin retry and private attachment integrity checks. The processor also
prunes unused staged files. Delivery resumes on startup; free hosting can sleep,
so retry timing is not guaranteed. No exactly-once or inbox-arrival claim is made.
Password reset payloads stay encrypted and single-use. See [Render free setup](../docs/RENDER_FREE.md)
and [complaint workflow](../docs/COMPLAINTS.md) for current configuration/limits.

`npm run check` runs typechecks, 26 security/health/source/email tests, manifest validation, build and OpenAPI drift
validation. `npm run test:integration` runs isolated MongoDB 8.0.5 replica-set tests
and real Redis. It downloads a test-only Mongo binary; install `redis-server` or
set `TEST_REDIS_URL` to a **disposable test Redis** (the tests flush its database).
CI supplies an isolated Redis container. No Atlas, Cloudinary, Turnstile or SMTP
organization credentials are used by tests. Live provider checks remain required
before production. `openapi.json` describes implemented M2 endpoints; regenerate
it with `npm run api:generate` when changing contracts.

M3 adds repeatable unpublished source imports and local asset preparation. Start
with `npm run seed:check`, then follow [seed/README.md](seed/README.md) for source
layout, offline plan and explicit database apply. Reruns preserve admin edits and
deletions. Nothing uploads or publishes automatically. `npm run test:seed` uses
disposable MongoDB and no organizational credentials.

## M4 managed public content

Fixed NGO copy is bundled in `frontend/data/ngo-pages.json` and public contact,
social and donation defaults in `frontend/data/ngo-details.json`. Those pages
need no database seed, admin review or publication step. Legacy ContentPage seed
records remain source inventory only; there is no fixed-page publishing endpoint.
Admin work remains users, members, applications, complaints, board, blogs, gallery,
reports, certificates, settings, inboxes and audit logs.

Public reads: `/api/settings/public`, `/api/board`,
`/api/blog-categories`, `/api/blogs`, `/api/blogs/:slug`, `/api/gallery`,
`/api/reports`, `/api/certificates`. Lists use bounded `page`/`limit`; all content
supports exact `locale=en|ur`. Blog `q` is a bounded literal title search; gallery
`category` is `in-action|media-coverage`. Unknown query fields are rejected.
Drafts, future publication dates and non-approved records are excluded. Gallery,
report and certificate listings require a clean claimed public file bound to the
same entity. Paginated responses include `meta.page/limit/total/pages`.

Public asset delivery uses `/api/public-assets/:id`; report download links use
`/api/reports/:id/download`. The backend rechecks current release and streams the
authenticated provider file with no-store. It never returns provider URLs, original
source files or identity evidence. GET report downloads count after successful
streaming; HEAD does not. Reads deliberately bypass Redis content caching, so
publication and withdrawal take effect without waiting for a cache TTL. Shared
security limits and service readiness still use Redis.

Authorized operators can inspect `/api/admin/publication/:kind?page=1` (20 records)
and POST `/api/admin/publication/:kind/:id` with:

```json
{"version":0,"action":"publish","releaseReviewed":true,"assetId":"clean-staged-asset-id"}
```

Kinds: `blog`, `project`, `board`, `gallery`, `report`, `certificate`, `setting`.
Omit `assetId` for settings; it is optional for blog/project covers and board photos and required for
initial gallery/report/certificate release. Upload public copies first through
`/api/admin/assets?purpose=content|certificate`. Files must be clean, unexpired
staged uploads owned by the operator, or already bound to that same record.
Report releases require PDF; board/gallery require raster images. Never upload
an unreviewed sensitive original as a public copy. The API attestation records
operator approval; it does not perform content redaction or certify legal validity.
Inline rich-text image release is not supported yet and publication rejects it.

`{"version":1,"action":"withdraw","releaseReviewed":true}` withdraws the record
and restricts its bound assets in one audited transaction. Stale versions return
409. Every mutation needs the existing session cookies, exact configured Origin
and X-CSRF-Token. Content editors can release text/blog/gallery/reports; board,
certificates and settings require admin/super_admin. Admin UI and full content
editing are later milestones. See OpenAPI and docs/M4_VERIFICATION.md.

## Homepage projects and news

Public: GET `/api/projects` and `/api/projects/:slug`; canonical GET `/api/blogs` and
`/api/blogs/:slug`. `/api/news` and `/api/news/:slug` remain compatibility aliases;
News and Blogs share BlogPost records. List reads support
bounded page/limit/locale; only current approved published records are public.
Admin content roles: GET/POST `/api/admin/projects` and `/api/admin/blogs`
(with `/api/admin/news` retained as a compatibility alias),
PATCH/DELETE their `/:id` routes. PATCH accepts the complete text contract plus
current `version`; DELETE accepts `version`. Mutations need the exact Origin and
X-CSRF-Token. Create/edit produce drafts; edit/delete revoke files. Publish with
`/api/admin/publication/project/:id` or `.../blog/:id`, using a current version,
releaseReviewed and optional clean owned cover assetId. Covers use content uploads
and authenticated no-store streaming; no provider URLs are exposed.

The project editor is available at `/admin/projects`; a Blogs admin screen remains
subsequent work. No live records are created automatically. Fixed homepage copy
is bundled; project and article cards use published public feeds and do not fall
back to sample records when the feeds are empty or unavailable.

### Source-backed homepage setup

`npm run seed:home` verifies the bundled three projects, three news summaries and
six covers offline. `npm run seed:home -- --apply` imports and publishes them to
configured development MongoDB/Cloudinary with an existing
`SEED_ACTOR_EMAIL`. See [seed/HOMEPAGE.md](seed/HOMEPAGE.md) for exact configuration,
source provenance and preservation rules. This separate command does not publish
legacy M3 content or alter fixed page copy.


Rich blog administration is available at `/admin/blogs`. See [blog details](../docs/BLOG_DETAILS.md) and [sourced preview seed](seed/BLOGS.md) for fields, release controls and `npm run seed:blogs -- --apply`.


## Gallery and TV interviews

`/admin/gallery` manages archive images and hosted interviews. See
[Gallery implementation](../docs/GALLERY.md) and
[full archive import](seed/GALLERY.md). Gallery now supports literal title
search and public source/date metadata. `GET /api/interviews` lists released
YouTube/Vimeo interviews with optional clean bound thumbnails. Authenticated
content CRUD is available under `/api/admin/gallery` and `/api/admin/interviews`;
publication also supports kind `interview`. Images remain private until release,
and current versions/CSRF/audits apply to all mutations.

`npm run seed:gallery -- --apply` uses the existing development-only private
services to import all 200 supplied archive entries: 44 press cuttings and 132
photographs/graphics publish once; 24 indexed duplicates remain hidden. Existing
preview publications and later admin work are preserved. The plain command
verifies source files offline; `--database` gives a read-only plan. Scans complete
before any new content import or upload, progress/summary counts are printed, and
completed releases survive an interrupted run. No real interview links were
supplied, so interviews are not fabricated.

## Progress Reports and Certificates

Manage future documents at `/admin/documents`; public pages remain under About.
Use `npm run seed:documents -- --apply` to import the seven reviewed public copies
with an active administrator and existing development services. The plain command
verifies files offline, and `--database` plans without writes. See
[import instructions](seed/DOCUMENTS.md) and [workflow](../docs/DOCUMENTS.md).
The three report editions explain their omissions; four distinct certificate
scans retain stated dates without implying renewal. Admin changes survive reruns.

### Board and Team

Administrators manage profiles at `/admin/board`. See `docs/BOARD_AND_TEAM.md`.
`npm run seed:board` verifies the supplied profiles and original photos offline;
`npm run seed:board -- --database` plans read-only; `npm run seed:board -- --apply`
scans and publishes seven supplied profiles with existing private dev services.
Reruns preserve completed releases and admin changes. Future profiles use the
same generic editor and public endpoints.


### Complaint intake and complete email copies

`/file-a-complaint` now uses real complaint intake; `/admin/complaints` provides
private review and email delivery state. Configure private Turnstile, SMTP and
ADMIN_NOTIFY_EMAILS values, plus the matching public frontend widget site key,
then run `npm run worker:dev` separately from the API/frontend. See
[complaint workflow](../docs/COMPLAINTS.md) for all fields, limits, configuration
and verification. Each complaint email contains the full form and all submitted
private files. Receipt confirms storage/queued mail rather than inbox delivery.
