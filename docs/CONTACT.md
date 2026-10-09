# Contact page and real enquiry intake — 8 October 2026

## Page and source details

The owner requested a complete Contact update and a working general enquiry form.
`frontend/data/contactDetails.ts` stores source-supported emails, phone, postal
address and social URLs. The page uses the existing theme with the form beside
contact/office/social cards. Remove placeholder phone/address/map links, invented
opening hours, a response-time promise and generic social icons with dead links.

- Office: Pandowal Road, Mianwal Ranjha, Tehsil and District Mandi Bahauddin,
  Punjab, Pakistan; postal code 50490. Supplied `given pages text.txt`.
- Email: hrpf786@gmail.com and info@hrpf.org; supplied Board/Profile documents.
- Phone: +92 322 2670590; supplied organisation profile.
- Map: https://maps.app.goo.gl/RwYYpU2y6po6vNzc6, explicitly supplied by the owner.
  Its redirect identifies Human Rights Protection Foundation Pakistan, at
  32.391695, 73.4398304. The page embeds the exact office listing using the
  official Google Maps Share → Embed a map HTML, obtained and visually verified
  on 8 October 2026. A responsive full-width map section follows the contact/form
  grid, with a named lazy iframe, fullscreen support and origin-only referrers.
  The original supplied short link remains beside it for directions or fallback.
  This standard shared map embed needs no API key. Maps handles its own controls
  and labels; the iframe container is excluded from website text translation.
- Social destinations match `social handles.txt`. Do not invent WhatsApp availability,
  a dedicated departmental inbox, office hours or a response deadline.

## Submission and email

The browser obtains a purpose-bound `contact` ticket after Turnstile verification,
then POSTs `/api/contact-messages`. Existing validation, Redis rate limits, Mongo
transactions, durable outbox and delivery worker are reused. Inputs: name, email,
optional phone/organization, enquiry type, subject, message and required consent.
Organization/enquiry type are now validated, stored and included in mail. Defaults
keep existing API clients and saved records compatible.

The response includes an `HRPF-MSG-` reference derived from the saved document ID.
It confirms storage and queueing, not an inbox delivery, review or response. Configured
administrator recipients are required before saving a new Contact submission.
Email-provider failures retain the saved enquiry and retry through the outbox.

Complete plain text and escaped HTML copies go to the sender and designated admins.
Admin mail has the submitted email as Reply-To. The SMTP and Resend adapters carry
that field. Legacy pending ContactMessage entries also use this renderer. Message
contents remain in restricted database records, not Redis jobs/outbox metadata.

`contact-submission.ts` freezes the exact first POST and UUID. After an ambiguous
response it retries the original ticket/key/body, even if the normal new-session
lifetime has passed. The form locks editing during this confirmation process and
retains inputs after errors. It never reports success before a valid server receipt.
Missing or failed security verification offers the published direct-contact route.
User input and reference are excluded from automatic translation.

## Configuration and scope

Use the same existing private configuration as complaints:
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_HOSTNAMES`,
`ADMIN_NOTIFY_EMAILS`, selected email provider/MAIL_FROM, working Mongo replica set,
Redis and embedded/worker outbox delivery. Frontend uses the existing same-origin API
rewrite with INTERNAL_API_URL. Secrets remain outside git. No new provider or live
credentials are added. No real test enquiry or email is sent to HRPF during checks.

General enquiries are not the private-document complaint route or an independent
safeguarding channel. As of 9 October 2026, Partnership and Feedback reuse this enquiry service;
Newsletter uses the confirmed-subscription flow in `FINAL_PUBLIC_CLEANUP.md`. Update Privacy, Terms, Accessibility and Safeguarding to reflect that
Contact is connected, without changing the hidden Accessibility navigation decision.
Contact records have no automatic deletion period; no retention policy is invented.

## Validation

- Frontend lint, types, build; public SSR for exact source contacts/map/social links,
  intake controls, exact embed listing/iframe attributes and removal of prototype claims.
- Client retry tests cover lost/malformed responses, exact original body/key/ticket,
  optional fields, normalized email and failed security verification.
- Backend types/OpenAPI/unit tests and isolated Mongo/Redis integration cover real
  storage/outbox, complete user/admin mail, Reply-To, HTML escaping, duplicate/conflict
  retries, failed delivery recovery and missing-recipient/invalid-field rejection.
- A synthetic frontend-helper → HTTP API → Mongo → outbox → mail integration sends
  no external email and checks the lost-response retry stays unique.

A full browser review depends on an available local preview/browser connection.
Do not equate isolated mail-adapter acceptance with production inbox delivery.
