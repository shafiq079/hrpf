# HRPF on Render free

The owner explicitly chose to remove ClamAV on 2026-10-07 to avoid a paid scanner.
The upload path, public/private media binding and all six seed applications no
longer open a scanner connection or require CLAMAV_HOST/CLAMAV_PORT. File extension,
declared MIME, detected signature, size/count quotas, SHA-256 integrity, ownership,
consent, private delivery and publication review still apply. These checks are not
antivirus scanning. New assets use `scanStatus: type_checked`; the historical field
name is retained. Existing `clean` assets keep working without a migration or
reseed. Historical quarantined/infected assets stay blocked, never auto-promoted.

## Email without SMTP or a paid worker

Set `EMAIL_PROVIDER=resend` to use `https://api.resend.com/emails` over HTTPS. Full
plain-text/HTML form copies and every original attachment are retained. There are
no public file URLs sent to Resend; attachments use Base64 content. Keep SMTP as
an alternative for existing Codespaces or paid deployments (`EMAIL_PROVIDER=smtp`).
Free Render web services block common SMTP ports, so changing credentials alone
does not fix SMTP delivery on that plan.

Set `EMAIL_DELIVERY_MODE=embedded` to drain MongoDB's durable outbox in the API
process. No `npm run worker` process, BullMQ email queue or paid Background Worker
is required in this mode. The processor waits for dependency readiness, checks
every five seconds, handles one email at a time, atomically leases deliveries,
honours persisted backoff/eight attempts, reclaims expired interrupted leases and
prunes unused staged uploads. Admins can retry exhausted failures as before.

Render free sleeps after 15 idle minutes and may restart. No email work runs while
the API is asleep; pending mail resumes after a visitor/request wakes it. This is
a deliberate free-tier tradeoff, not always-on delivery. MongoDB remains the source
of truth, so losing free Redis state does not lose complaint records or outbox
entries. Existing ticket mirrors recover from Mongo; Redis rate-limit state resets.
Redis being unavailable still temporarily blocks business endpoints. No keep-alive
ping scheme or immediate-delivery guarantee is part of this setup.

Resend idempotency keys derive from the stable outbox Message-ID and protect retry
requests for the provider's 24-hour window. Delivery after that window or an
ambiguous provider acceptance can still duplicate mail. `sent` means accepted by
the email provider, not confirmed inbox arrival. Provider quota errors remain
failed/retryable; after eight attempts an administrator retries when quota resets.

## Private email setup

Use a Resend account, an API key and a sender at a domain the owner controls and
has verified through DNS in Resend. A Gmail address cannot be used as an owned
Resend sender domain. Resend's onboarding sender is restricted for testing; it is
not a production sender for arbitrary complainants. The current free account
quota is 100 emails/day and 3,000/month; each user/admin copy consumes a separate
email. With one admin, at most 50 complaints/day fit if no other emails consume
that quota. This is a quota calculation, not a promised complaint capacity.
Other providers can be added behind the same sender interface later.

In backend private configuration:

```env
EMAIL_PROVIDER=resend
EMAIL_DELIVERY_MODE=embedded
RESEND_API_KEY=your-private-api-key
MAIL_FROM=your-sender-at-your-verified-domain
ADMIN_NOTIFY_EMAILS=your-approved-admin-email
```

Keep the existing private JWT, CNIC hash and encryption keys stable. Do not create
new keys for a database containing existing encrypted complaints. Configure
Turnstile using the actual frontend hostname and the matching public frontend
site key. The existing Cloudinary PDF delivery-policy issue remains an account
setting dependency; neither this change nor removal of antivirus fixes it.

Restart `npm run dev` after updating backend settings. Do not run a separate email
worker in embedded mode. The worker command deliberately refuses that combination.
SMTP/standalone worker remains the default for unchanged development configuration.

## Render setup

The root `render.yaml` defines a free Node 24 Web Service and free Key Value
instance, both in Render's default region. It creates no paid resources. Atlas,
Cloudinary and Turnstile remain external; their own free-tier limits still apply.
Free Key Value is internal-only and uses noeviction so ticket/limit keys are not
silently evicted. The durable email processor does not depend on a Redis queue.

Create a Blueprint from the repository and select development for testing, or main
after these changes have been reviewed and merged. Supply all `sync: false` values
privately. If a free Key Value instance already exists in the workspace, reuse
that instance and wire its internal connection URL instead of creating a second;
Render allows one free Key Value instance per workspace. Match the API's region
to the existing datastore's region in that case.

Manual setup equivalent:

| Setting | Value |
| --- | --- |
| Service type | Web Service |
| Runtime | Node |
| Instance | Free |
| Root directory | backend |
| Build | `npm ci && npm run build` |
| Start | `npm start` |
| Health check | `/api/health/ready` |
| Node | 24 |
| Email provider / mode | resend / embedded |
| NODE_ENV | production |
| Cloudinary namespace | hrpf/prod |
| MongoDB database | a separate production database such as hrpf_prod |

Set `FRONTEND_URL` to the exact HTTPS frontend origin. Frontend hosting uses its
own existing build and `INTERNAL_API_URL=https://your-api.onrender.com` (no `/api`
suffix). Rebuild the frontend when changing that origin or Turnstile site key.
No scanner, SMTP connection or separate worker is needed for this Render setup.

Mongo Atlas network access must allow the deployed API. Configure it using the
actual service egress addresses shown by Render; do not expose database passwords
or open the database merely to work around a failed readiness check. Bootstrap
the initial production administrator from a trusted local/Codespaces environment
using the production database; do not put admin creation or seeding in startup.
Development seeds deliberately refuse production. Existing development content
is not automatically copied into the separate production database/Cloudinary
namespace.

`TRUST_PROXY_CIDRS` remains deliberately unset until the actual frontend-to-Render
proxy chain has been verified. Do not trust arbitrary forwarded headers or set
blanket trust. Until then, requests can share a proxy rate-limit bucket. That is
a remaining deployment validation item, not a verified per-visitor production
limit. HTTPS origin, cookie, admin/login/upload and provider checks still need an
owner-environment end-to-end run.

## Acceptance before public use

Use dummy identity details with inboxes you control. Verify API liveness/readiness,
Turnstile, upload type/size failures, saved reference, both complete email copies,
exact private attachments, admin access and publication. Restart the API during a
failed send and confirm the stored outbox resumes. Observe one real free-tier cold
start and check mail after waking the service. Inspect provider acceptance and
actual inboxes; local capture tests do not prove live delivery. No owner service
has been created and no live email is sent by this repository change.

References checked 2026-10-07:
- https://render.com/docs/free
- https://render.com/docs/blueprint-spec
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/knowledge-base/account-quotas-and-limits
- https://resend.com/docs/dashboard/domains/introduction
