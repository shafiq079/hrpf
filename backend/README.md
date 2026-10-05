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
Complaint tickets allow five files and 25 MB total; membership allows one proof.
Quota reservation and file claiming are atomic. Configure a private ClamAV daemon
using `CLAMAV_HOST`/`CLAMAV_PORT` and Cloudinary credentials. Unavailable scans
block storage; infected files are rejected. All M2 uploads are staged as
`authenticated` under `hrpf/dev` or `hrpf/prod`; publishing reviewed public copies
is implemented with later content workflows. Admin staging supports content and
certificate purposes with separate role checks.

Restricted files are streamed through `/api/admin/assets/:id/content` after
current authentication and role authorization, with attachment/no-store headers.
Provider URLs are never returned or redirected. Public-release review must happen
before later public delivery. Image/PDF format checks and malware scanning do
not themselves establish that content is safe for public release.

Run the durable email worker in a separate backend terminal/process:

```bash
npm run worker:dev
# Production, after npm run build:
npm run worker
```

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `MAIL_FROM` and optional SMTP
credentials privately. Port 587 uses required STARTTLS; port 465 uses secure TLS.
`ADMIN_NOTIFY_EMAILS` is an explicit comma-separated recipient list; no address is
invented. Without it, only the applicant acknowledgement is queued. Queue jobs
contain only Mongo outbox IDs. The worker drains persisted pending records after
Redis recovers, leases deliveries, retries with backoff up to eight attempts,
and prunes expired unused assets. `/api/admin/outbox` exposes redacted statuses;
admin/super_admin can retry failed entries. Successful entries are skipped.
SMTP has an unavoidable ambiguous-send window if the provider accepts a message
before a crash/database failure; stable Message-IDs help, but exactly-once email
is not promised. Only reference numbers and sign-in instructions appear in admin
notifications, never complaint narratives, CNICs or proof URLs. Password reset
links use encrypted outbox payloads and single-use expiring tokens.

`npm run check` runs typechecks, 22 security/health/source tests, manifest validation, build and OpenAPI drift
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

## M4 public content and reviewed publication

Public reads: `/api/settings/public`, `/api/content/:key`, `/api/board`,
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

Kinds: `page`, `blog`, `board`, `gallery`, `report`, `certificate`, `setting`.
Omit `assetId` for text/settings; it is optional for board photos and required for
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
