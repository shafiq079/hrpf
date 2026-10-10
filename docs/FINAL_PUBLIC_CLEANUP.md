# Final public pages and form completion — 9 October 2026

## Scope and source decisions

Previous PR #10 was merged by the owner into main (`77f7e5f`). Development was
fast-forwarded to that merge before this change. This change targets development;
main is not merged or deployed here.

- Replace Get Involved with Become a Member. Keep the exact supplied Google Form.
- Delete Campaigns, Events and Careers and their child routes, forms, cards and
  prototype datasets. They return 404. Old Get Involved and Get Help links redirect
  permanently to Become a Member and Contact; both old pages are removed.
- Contact is a primary header link. All eight work categories are discoverable;
  tablets use the existing mobile menu to keep the longer header readable.
- Our Work uses the source-based category copy/photos and institutional approach
  from `about-source.json` / `workAreas.ts`. Remove unused prototype focus metadata.
  Work category pages continue to load managed Projects in this field.
- Keep Impact as qualitative documented action, with Projects/Progress Reports
  links. No invented totals, percentages, beneficiary counts or current-condition
  guarantees. Source basis: supplied HRPF 2023–2025 progress reports and profile,
  the client About Us text, `WORK_PROJECT_RESEARCH.json` and project evidence under
  `backend/seed/home-assets/progress reports/work-project-evidence/`. In particular, prisoner
  healthcare and overseas travel-document support have recorded interventions;
  do not turn a recorded step into a promise about current conditions.
- FAQ reflects HRPF's identity, dated registrations, current work, complaint
  requirements, enquiry forms, Google membership, bank/JazzCash donations and
  newsletter confirmation. Search contains current pages and latest published
  projects/blogs/reports, with no retired entries or duplicate Contact page.
- Updated Privacy/Terms/Safeguarding describe actual forms; Accessibility remains
  available directly and hidden from public navigation.

## Forms and configuration

Contact, Partnership and Feedback About HRPF use the same existing Contact API:
Turnstile `contact` action, consent, durable Mongo transaction, sender/HRPF complete
message copies, admin Reply-To and HRPF-MSG reference. Feedback is an enquiry type,
not an independent safeguarding channel. No evidence files in these forms; use
File a Complaint for supporting documents. Rejected/expired sessions allow fresh
verification; ambiguous replies preserve the original request to avoid duplicates.

File a Complaint retains the working verified complaint flow, complete identity
and uploaded-file email copies, durable receipt and private case review. No new
contact inbox, settings, audit/log or newsletter administration screens are added.
Deleted gallery drafts are untouched. No seed import is needed or run.

Newsletter is now an actual subscription signup, not a simulated success:

1. Required opt-in and Turnstile `newsletter` action issue a purpose-bound ticket.
2. Atomically store a normalized unique email, pending state and dated/versioned
   consent, consume the ticket and queue an encrypted confirmation email.
3. Confirmation lasts 24 hours. The emailed URL uses a fragment; opening it makes
   no state change. Explicit Confirm subscription POST activates the subscription.
4. Unsubscribe explicitly cancels pending or active subscriptions. Rejoining needs
   fresh consent/confirmation; prior links cannot activate the new subscription.
5. Same-request retries do not create subscriptions or mail twice. Recent duplicate
   requests/active addresses get the same response, without revealing status.
   Provider failures keep the pending request and durable retryable outbox.

Newsletter signup, confirmation and unsubscribe are implemented. A newsletter
broadcast/editor/scheduled sender is outside this signup task; no bulk mailing is
sent by these changes. Future broadcasts must select only active subscriptions
and include each subscription's unsubscribe link. Subscriber emails and tokens
have no public listing endpoint; confirmation tokens are hashed in subscriptions,
are encrypted in the private outbox and are removed from it after delivery.

Existing private environment needs:

| File | Configuration |
| --- | --- |
| `backend/.env` | Working Mongo replica set and Redis; existing JWT/data-encryption/CNIC keys. Preserve keys already used by stored records. |
| `backend/.env` | `FRONTEND_URL` = exact reachable frontend origin, e.g. the Codespaces HTTPS port-3000 URL, without a path. Required for newsletter links. |
| `backend/.env` | `TURNSTILE_SECRET_KEY`; `TURNSTILE_HOSTNAMES` = exact frontend hostname(s), without protocol/port. Same widget supports contact, complaint and newsletter actions. |
| `backend/.env` | `MAIL_FROM`, `ADMIN_NOTIFY_EMAILS`; selected `EMAIL_PROVIDER` with either Resend key or SMTP configuration. Use a provider-authorized sender. |
| `backend/.env` | `EMAIL_DELIVERY_MODE=embedded` runs durable delivery with the API. If deliberately retaining worker mode, run the existing worker separately. |
| `frontend/.env.local` | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; existing `INTERNAL_API_URL` = reachable backend origin, typically `http://127.0.0.1:5000` locally. |

Do not place secrets in Git, public copy or NEXT_PUBLIC variables other than the
public Turnstile site key. Restart both servers after configuration changes.
The database's additive indexes are created by the existing backend startup;
there is no seed command for this task.

## Run after pulling development

From repository root (Node 24):

```bash
git switch development
git pull --ff-only origin development
npm --prefix backend ci
npm --prefix frontend ci
```

After checking the private settings above, run in separate terminals from root:

```bash
npm --prefix backend run dev
```

```bash
npm --prefix frontend run dev -- --hostname 0.0.0.0
```

If using `EMAIL_DELIVERY_MODE=worker`, a third terminal runs
`npm --prefix backend run worker:dev`. Embedded mode needs no third terminal.

## Client test checklist

- Desktop/tablet/mobile header: Become a Member and Contact, eight work fields;
  no Get Involved, Get Help, Campaigns, Events or Careers. Test old URL redirects
  and retired listing/detail 404s. Search current pages and a published project.
- Review Our Work/Impact/FAQ text and all eight Projects in this field listings.
  No prototype numbers/testimonials; project placeholders remain replaceable.
- Membership opens the same supplied Google Form; no new membership payment/API.
- Contact, Partnership and Feedback: valid consent/security, reference, full user
  email and HRPF recipient copy, admin Reply-To. Invalid inputs do not save. A lost
  response retries the original request without duplicate records.
- Complaint with synthetic identity/documents: reference, private admin receipt,
  complete sender/HRPF copies with original files. Avoid real personal data in tests.
- Newsletter: opt-in/security → pending receipt → emailed confirm link → explicit
  activation → unsubscribe. Rejoin requires a new confirmation; repeated/expired
  links fail safely. Missing email configuration must not claim subscription.
- Check Urdu translation/restoring English, keyboard navigation and mobile form
  widths. Form values/references/link tokens remain excluded from translation.
- Confirm deleted gallery drafts stay deleted. PDF delivery remains the owner's
  Cloudinary account-policy check with the client before production.

## Automated verification

Frontend lint/types/production build, 12 client tests and public SSR route checks;
backend types/build, 27 unit tests, OpenAPI regeneration/parity and the expanded
59-test isolated Mongo replica-set/Redis integration suite cover persistence and mocked
email delivery. Live Turnstile, sender authorization, inbox placement and client
Cloudinary policy must be verified in the configured client environment. No real
email, bulk mailing or production deployment is performed during these checks.

## Approved navigation and homepage identity

Primary navigation follows About Us → Our Work → Projects → Blogs → Gallery →
Become a Member → Contact on desktop and mobile. Current pages/sections are marked
with `aria-current` and a brand-blue highlight. Complaint and Donate retain their
separate action buttons. The mobile drawer shares the header's `xl` breakpoint.

The homepage's primary heading is **Human Rights Protection Foundation Pakistan**,
in the site's editorial heading font with responsive 34–64px type. Per the owner's
10 October update, English is the source language and the heading participates
in the existing language switcher. There is no fixed Urdu text, translation
exclusion, or fixed language/direction on this heading; translated RTL languages
inherit the site's existing font and reading-direction rules. The homepage-only
Nastaliq font import was removed. The name remains the largest banner text and
the supporting description does not repeat it. After pulling and restarting the
frontend, check English, a translated language, Urdu/RTL, and restoring English.
No seed import or database change is required.

The Message of CEO route shows Muhammad Yousaf Badar's published profile portrait,
with his name, supplied Chairman designation, and full-profile link beside the
message (stacked on mobile). It reuses the Board portrait component, crop/zoom
and responsive asset delivery. Future published admin photo changes appear here;
an unpublished/missing profile or unavailable API leaves the supplied message
readable without exposing an archived portrait. No duplicate photo upload or
new seed import is needed.
