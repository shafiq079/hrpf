# Complaint intake and review

The owner's changes file requires identity/contact/address details, a CNIC
picture, the written complaint, previous institutional proceedings and decision
attachments. The owner clarified on 2026-10-07 that **email copies must contain
the complete submitted form for both the user and admin**. `/file-a-complaint`
now uses the real intake API. The separate `/complaints` page is still the
prototype feedback-about-HRPF flow; this milestone does not claim to wire it.

## Public form

Three steps collect name, father's name, CNIC number, email, phone, province or
region, district, address, category and full complaint description. Previous
proceedings have a yes/no control; Yes requires institution/reference/status/
decision details. The user attaches a required CNIC image and written complaint,
plus optional previous-decision documents and supporting evidence. A complete
review lists all text and file names before explicit consent to send the full
identity/form/file copies by email.

Use JPG/PNG/WebP images up to 5 MB each and PDFs up to 10 MB each. Up to five files
are allowed overall, with at most three in either optional group and **15 MB
combined**. The smaller combined budget leaves room for MIME/base64 expansion;
SMTP providers may impose additional limits. CNIC proof must be an image.
Every upload still passes signature/type checks before storage. New
complaint evidence is stored as authenticated raw files, including images, so
provider image transformations cannot alter the original submitted bytes.

Turnstile's complaint action produces a 15-minute purpose-bound upload session.
Stable UUID upload keys recover lost responses without re-uploading completed
files or consuming another quota slot. Stable submission keys prevent duplicate
complaints, references and outbox entries. After starting a submission the browser
locks the reviewed payload for retries; it stores data/tokens only in memory.
Unfinished uploads expire and are pruned by the worker. The original consumed
ticket can confirm a saved submission until its retention cleanup (roughly one
day after expiry), including after the 15-minute upload window. Opening a new form
is not recovery for a lost response.

The success screen confirms saved receipt and queued email, never inbox delivery,
review completion or a legal outcome. There is no public case lookup endpoint.
No real complaint fixture is seeded into the owner's database.

## Complete email copies

A complaint transaction claims its exact validated restricted assets, encrypts the
CNIC with entity-bound AES-256-GCM, allocates the reference and queues one user
copy plus one separate copy per distinct configured ADMIN_NOTIFY_EMAILS address.
An empty admin recipient configuration blocks intake rather than silently
omitting the required admin copy. Contact/membership/reset email behavior remains
separate. Legacy complaint acknowledgements are not silently upgraded.

The worker renders plain text and escaped HTML with all submitted fields, consent
version/time, reference, submission time and file names. It attaches **every
submitted file** using exact original bytes. The worker verifies each asset's
purpose, claim, entity binding, restricted authenticated delivery, accepted validation status,
size and SHA-256 before sending. Reads are bounded with timeouts. There are no
public attachment links, signed provider URLs, CNIC values, full form snapshots
or attachment bytes in BullMQ job data; the job contains only an outbox ID.
CNIC is decrypted only for an authorised detail read or complete email rendering.

Missing email configuration, inaccessible files or a provider failure leave the complaint saved
and the outbox failed/retryable. Eight automatic attempts are followed by manual
admin retry. The lease allows bounded attachment reads plus SMTP transport time.
The original complete form is immutable through review; internal notes, statuses
and assignee changes are excluded from these submission copies. Provider acceptance
followed by a process crash can duplicate delivery; exactly-once email and inbox
arrival are not promised. A stable Message-ID helps identify retries.

## Private administration

`/admin/complaints` supports active administrators, super administrators and case
managers. Editors cannot access casework. Lists contain bounded summaries with
reference-prefix search, status filtering and pagination. Detail reads are audited
and show the complete form, decrypted CNIC, private downloads, consent, notes,
status history and per-copy delivery state. Provider metadata, encryption values,
lookup hashes, ticket/submission keys and recipients are excluded from DTOs.
Private responses are no-store; file requests use existing restricted-asset
permissions and fresh authentication.

Reviews require CSRF, the current optimistic version, an internal note and a
currently active complaint role checked inside a governance-serialized transaction.
Assignees must be active administrators or case managers. `assigned` requires an
assignee. Allowed transitions:

- new → triaged or closed
- triaged → assigned, in_progress, needs_info or closed
- assigned → in_progress, needs_info or closed
- in_progress → needs_info, resolved or closed
- needs_info → triaged, assigned, in_progress or closed
- resolved → closed or in_progress
- closed → triaged (reopen)

A case can receive a note/assignment without changing status. Notes/history have
bounded capacity. Reviews cannot replace the submitted identity, complaint or
files. Admins/super admins can retry failed email copies; case managers can inspect
delivery state but cannot operate the outbox. `needs_info` records workflow state;
a public supplementary-information portal or automated status emails are not
part of this milestone.

## Render free option and scanner removal

ClamAV was removed at the owner's explicit request on 2026-10-07. Uploads still
check signatures, MIME/extensions, quotas, ownership and SHA-256 integrity, but
are not antivirus-scanned. New records are `type_checked`; historical `clean`
files are accepted, while quarantined/infected files stay blocked. No reseed or
migration is needed. Configure EMAIL_PROVIDER=resend and EMAIL_DELIVERY_MODE=embedded
for full HTTPS email copies processed by the API without a separate worker.
See [RENDER_FREE.md](RENDER_FREE.md) and root render.yaml for setup and free-tier
sleep/quota limits. The following SMTP instructions remain an alternative for
existing development configurations, not the Render free path.

## Private setup and Codespaces review

Keep MongoDB, Redis, Cloudinary and existing security keys configured as
before. Do not replace encryption keys for already-stored complaints.

In `backend/.env` or Codespaces secrets, configure existing variables privately:

- TURNSTILE_SECRET_KEY and TURNSTILE_HOSTNAMES (exact frontend hostname, no scheme/port)
- SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS and MAIL_FROM
- ADMIN_NOTIFY_EMAILS (comma-separated approved recipient email addresses)

Use the same Turnstile widget's public site key in `frontend/.env.local`:
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Rebuild/restart the frontend after changing it.
The backend still validates the complaint action and hostname; there is no
verification bypass in development. Missing widget configuration explains that
online submission is unavailable rather than displaying a simulated success.

After pulling development, start the existing backend and frontend in their
separate terminals. In a **third terminal**, start email:

```bash
cd /workspaces/hrpf/backend
npm run worker:dev
```

Open `/file-a-complaint`, submit a clearly labelled synthetic test using an email
address you control and non-personal image/document fixtures, then inspect both
mailboxes and `/admin/complaints`. Check all fields/files, retry recovery, review
and authorised private downloads. Restart or leave the worker running for queued
mail delivery. No additional seed is needed.

The owner's existing Cloudinary PDF delivery-policy rejection remains a separate
account configuration issue. If private PDF delivery is also blocked, complete
email copies with those files remain retryable until the provider is corrected;
files are never omitted to claim success. See `RENDER_FREE.md` for Render free delivery; deployment still requires private
provider configuration.

## Verification

Local disposable MongoDB/Redis integration tests cover all field/file email
copies, escaped multilingual text, unchanged private attachment bytes, response
loss, transaction rollback, upload recovery, provider failure/retry, altered or
wrongly bound files, roles, CSRF, versions, assignments and status histories.
Browser-side submission tests cover lost upload/submission responses and size/type
validation. Production SSR verifies the live complaint route, private admin route
and updated privacy disclosure alongside existing navigation/content flows.
Live owner email/Cloudinary/Turnstile acceptance still depends on private setup.
