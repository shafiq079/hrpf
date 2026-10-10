# Native membership registration — 10 October 2026

The owner replaced the Google Form redirect with an on-site volunteer application.
Source: the three screenshot pages in `member form.pdf`. Questions, order,
required/optional fields, radio/checkbox types and file counts are retained.
Google's logo/contact/account boilerplate is removed. Required Email replaces
Google's recorded-account checkbox; the separate required Gmail Id remains.
Both optional responses under Important Note and Confirmation Message remain.
The owner explicitly approved the payment methods already on Donate: **Bank
transfer and JazzCash**, with the same shared bank/account/IBAN/wallet details.
No new payment gateway or membership expiry is introduced.

## Public flow

`/become-a-member` contains personal, volunteer and payment/document sections,
explicit labels/hints, choice fieldsets, file names/delete controls, linked error
summary, and a check-answers step before submission. The original Yes/No
certification is preserved. Optional Other availability requires its explanation.
Fee choices preserve PKR 2,000 registration, PKR 3,000 card/notification and the
PKR 5,000 total. The total includes both services and is never added a second time.
The server saves a versioned authoritative fee snapshot.

Required attachments:

| Question | Count | Supported types | Per-file maximum |
| --- | --- | --- | --- |
| CNIC front/back | 1–5 | JPG/PNG/WebP/GIF/BMP/TIFF images | 10 MB |
| Recent photograph | 1 | Same image types | 10 MB |
| Payment screenshot | 1 | Same image types | 10 MB |
| Police character certificate | 1–5 | Images, PDF, DOC/DOCX, ODT | 10 MB |

Twelve files maximum, 120 MB maximum for a ticket. Uploads are sequential,
type/extension checked, authenticated, restricted and preserved as original bytes.
The website does not claim malware scanning. Word/ODT documents download as
attachments rather than executable/inline content. Abandoned uploads expire
with their 15-minute ticket and are cleaned by the existing processor.

Turnstile uses action `membership_registration`. Each attempt keeps its original
ticket, UUID, upload keys and submitted payload. An interrupted upload reuses its
key; a lost submission receipt retries the exact original data. After a POST begins,
the UI locks edits to avoid duplicate applications. No identity or file data is put
in localStorage or sessionStorage. The reference starts `HRPF-VR-YYYY-`.

Receipt means **saved, confirmation queued, payment and approval pending**.
Applicant emails contain the reference and supplied confirmation message; admin
notifications link to `/admin/membership`. Private documents stay in the portal,
not email attachments. Delivery failures remain in the durable outbox for retry.

## Admin flow

`/admin/membership` is available to active admin/super_admin users. It provides
paginated status/reference filters, every submitted answer, named private files
with image/PDF preview and download, payment status, application status, private
notes, history and email delivery state. Editor/case-manager access to native
membership applications and their files is denied by the API.

Statuses: pending, under review, needs information, approved, rejected, withdrawn.
Payment: unverified, verified, rejected. Approval requires **verified payment and
Yes certification**. Each review requires an internal note and current record
version. A status change also requires a separate message to the applicant. That
message and status are snapshotted in the outbox; internal notes are not emailed.
Current active role is rechecked transactionally and stale updates return 409.
There is no invented member ID/validity policy or automatic expiry.

New `MembershipRegistration` records and purpose-bound tickets/uploads are separate
from the older `MembershipApplication` API. Legacy complaint limits (5 files,
15 MB total, images 5 MB/PDF 10 MB) and legacy policy-gated membership API remain
compatible. Native registration needs no legacy `membershipPolicy` setting.
No existing applications or organization records are imported or deleted.

## Run and check

From the repository root:

```bash
git switch development
git pull origin development
npm --prefix backend run db:indexes
npm --prefix backend run dev
```

In a second terminal:

```bash
npm --prefix frontend run dev
```

No new environment variable is required. Existing configuration must include the
frontend `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, backend Turnstile secret/allowed
hostname, MongoDB, Redis, private Cloudinary credentials, configured mail sender
and `ADMIN_NOTIFY_EMAILS`. Keep embedded delivery enabled on the existing small
Render deployment, or run its configured worker. `db:indexes` only creates
additive indexes. Turnstile uses the same widget key with the new form action.

1. On mobile and desktop, submit a synthetic application with every required
   field, CNIC sides, photo, payment image and police certificate. Check error
   focus, Other availability, fees, review/back, upload progress and receipt.
2. Check both applicant/admin inboxes. Open Membership in admin and compare
   every field/file with the original application; preview the payment image.
3. Try approval before payment verification (blocked), then verify and approve
   with an applicant message. Check the status email and history. Verify a No
   declaration remains visible and cannot be approved.
4. Simulate a disconnected response and retry; confirm one application/reference.
5. Check English/Urdu labels while entered values and admin details stay excluded
   from translation; check 320/390 px bounds and keyboard navigation.

## Automated verification

Passed: backend typechecks, 27 unit/security tests, build and generated OpenAPI contract;
67 real isolated MongoDB replica-set/Redis integration tests for private records/files,
fee snapshots, file groups/quotas/Word uploads, tickets, exact retries, mail,
roles/CSRF, version conflicts and approval guards. Frontend lint/typecheck/build,
15 client tests (including submission recovery), public HTML and navigation checks.
No production database, Cloudinary upload, real payment or real email is touched
by these tests. Live provider delivery and browser interaction remain client checks.

UI references: GOV.UK Check answers pattern and W3C form notifications guidance.
