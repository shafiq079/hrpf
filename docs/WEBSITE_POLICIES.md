# Website policies — 8 October 2026

Keep the existing four policy routes: Privacy Policy, Terms of Use,
Accessibility and Safeguarding. Replace prototype content with a clear description
of the current website. These changes are on development; the completed Our Work
redesign was merged to main through PR #8 at `877e0e3` first.

Owner follow-up: temporarily hide Accessibility from both public navigation link
lists. The `/accessibility` page and its content remain available by direct URL.

## Pages and presentation

`frontend/data/websitePolicies.ts` contains the four page configurations.
`PolicyView.tsx` supplies a shared hero, dated introduction, stable section anchors,
keyboard-accessible contents navigation and readable text column. The four route
files retain their canonical URLs and supply metadata. No unavailable PDF download
or publication placeholder remains. The safeguarding label describes a commitment,
not a formally adopted operational policy.

| Page | Content tied to current behaviour |
| --- | --- |
| Privacy Policy | Complaint identity/contact fields, consent, private evidence, authorised access, complete email copies, service providers, translation exclusions, membership, cookies/storage, actual retention and requests |
| Terms of Use | Responsible use, informational scope, receipt versus review/delivery, external forms, translation accuracy, material reuse and availability |
| Accessibility Statement | WCAG 2.2 AA improvement target, implemented navigation, translation, scanned document/video limitations and email assistance; no full conformance or certification claim |
| Safeguarding | Respectful conduct, children and vulnerable people, reporting choices, confidentiality limits and immediate danger; no invented officer, deadline, investigation procedure or independent channel |

## Evidence and limits

- Complaint implementation and `COMPLAINTS.md`: real connected intake, encrypted
  database CNIC, private files, complete copies emailed to sender/designated admins,
  saved receipt and separate outbox delivery states.
- `ContactForm.tsx`, `ComplaintForm.tsx` and `NewsletterForm.tsx`: general
  Contact now stores enquiries and queues complete sender/admin copies through
  verified tickets and the outbox (see CONTACT.md). Feedback-about-HRPF and newsletter
  confirmations remain simulated; the policies disclose those remaining limits.
- Translation implementation and `TEXT_TRANSLATION.md`: lazy GTranslate public-text
  translation, saved language, English restoration, RTL and private exclusions.
- Membership route: the supplied Google Forms destination is an external service.
- Complaint records have no automatic retention expiry. Temporary staged uploads
  expire for cleanup. Auth session cookies differ from complaint retention.
- Supplied organisation profile and Board of Directors document support both
  `hrpf786@gmail.com` and `info@hrpf.org`. Their publication does not establish a
  separately staffed or independent safeguarding reporting service.
- No supplied document establishes a dedicated independent safeguarding contact,
  adopted incident process, response deadline or complaint retention schedule.
  Do not invent these through website copy. HRPF must decide them operationally.

Primary guidance used for structure, not as a claim about HRPF accreditation or
jurisdiction-specific legal obligations:

- W3C accessibility statement guidance:
  https://www.w3.org/WAI/planning/statements/
- CHS Alliance safeguarding policy reference:
  https://www.chsalliance.org/get-support/resource/safeguarding-policy-chs-alliance/

## Verification

Frontend lint, TypeScript and production build pass. Public SSR checks cover all
four pages, dated content, real email links, complaint/email/retention disclosures,
accessibility/safeguarding limits and absence of prototype notes/dead PDF controls.
Navigation checks retain redirects and verify complaint privacy guidance by its
stable section anchor rather than old prototype wording.

Browser checks cover each route's single heading, canonical metadata, update date,
email links, keyboard section navigation and header clearance, desktop and mobile
(390px/320px) bounds. Isolated provider responses verify privacy-page Urdu RTL and
English restoration without claiming translation accuracy. These checks do not
constitute a full accessibility audit.

The local Next generated route cache initially served the old policy HTML after a
successful build. Moving that generated cache aside allowed current build verification;
no application cache configuration changed.

## Follow-up organisation decisions

- Connect or replace the simulated feedback/newsletter forms before users can
  rely on their confirmations. Contact was connected in the subsequent Contact task.
- Establish retention/review rules and an independent safeguarding escalation route,
  then update the notice to reflect the adopted arrangements.
- Arrange a fuller accessibility assessment and prioritise accessible alternatives
  to scanned documents and video captions/transcripts.
