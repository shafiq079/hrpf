# Progress Reports and Registration / Certificates

Public pages remain `/about/progress-reports` and
`/about/registration-and-certificates`. `/admin/documents` manages both collections.
These interfaces and APIs work for future documents, independently of the source seed.

## Public experience

Report and certificate cards show the title, issuer where supplied, and summary.
Validity, reference and issue metadata, reporting periods, edition/page counts,
file type/size and the public-copy notes dropdown are hidden on these cards.
The archive introduction explains that historical documents do not establish renewal.

View opens the inline PDF or raster image directly in a new browser tab. Download
uses the attachment endpoint. There is no embedded document dialog or iframe, and
files load only when selected. Pagination continues to use public approved records.
The separate Profile document section retains its existing metadata and actions.

## PCP A4 replacement

`backend/seed/document-assets/replacements/pcp-npo-evaluation-a4-v2.pdf` is a
one-page A4 (210 × 297 mm) presentation of the supplied PCP evaluation certificate.
The black top and bottom bands are excluded from the visible page. The original
JPEG is embedded unchanged, preserving all certificate text, the seal and the
signature. No text or signature was recreated, and no dates were inferred.

This prepared replacement is committed with the project, but it is **not a
frontend public-folder asset** and pushing it does not replace the live certificate.
The published certificate is an administrator-managed database record linked to
an uploaded Cloudinary asset.

To use it: open **Admin → Registration and Certificates**, edit **NPO evaluation
certificate**, upload this PDF as the **reviewed public copy**, review the attached
file, then **Save and publish**. Keep the existing title, issuer and summary.

No new seed script is required. The existing `seed:documents` command preserves
already-published and administrator-edited records; rerunning it will not replace
the live file. The original seed JPEG and release manifest remain unchanged.

## Admin workflow

1. Sign in and choose Progress Reports or Registration and Certificates.
2. Add a title, summary, display order and document details. Reports also use a
   unique identifier, year, optional reporting dates and page count, and an edition.
   Certificates collect issuer, optional reference, issue date and validity dates.
3. Upload a **reviewed public copy**: reports require PDF up to 10 MB;
   certificates accept PDF up to 10 MB or JPG/PNG/WebP up to 5 MB. Convert Word
   documents to PDF first. Files undergo the existing MIME/signature and size checks.
4. Inspect the attached file and public-card preview, save a private draft, then
   attest review and publish. A public edition requires notes explaining omissions.

Administrators and editors manage reports; only administrators manage certificates.
Optional Urdu title, summary and copy notes can be entered now. Site-wide translation
remains a later task. Saving an edit withdraws the previous release. Versions, CSRF,
current DB permissions, transactions and audits protect all mutations.

Restricted originals are separate from the public-copy fields. The editor never
projects them. Binding rejects an original as a release copy, including uppercase
ObjectId input. Public listing and streaming also exclude a file that matches the
original. Replacements, withdrawal and deletion immediately revoke public access.

## API

- `GET/POST /api/admin/reports` and `/api/admin/certificates`.
- `GET/PATCH/DELETE /api/admin/{collection}/{id}`; updates/deletes require `version`.
- Publication uses the existing `/api/admin/publication/{report|certificate}/{id}`.
- `GET /api/documents/{reports|certificates}/{id}/view` streams inline.
- `GET /api/documents/{reports|certificates}/{id}/download` streams an attachment.
- Existing `/api/reports/{id}/download` remains supported. Only successful report
  download GETs increment the download counter; viewing and HEAD do not.
- Authenticated asset content supports `?preview=1` for inline admin viewing.

All file routes recheck a clean public asset bound to the currently approved
entity. Provider URLs, restricted originals and source provenance remain private.
OpenAPI contains the implemented contracts. Performance/caching work is deferred.

## Supplied documents

The importer bundles **reviewed public copies**, not the sensitive full originals.
Original filenames and checksums remain in the source manifest and import provenance.
The source ZIPs remain the authoritative private originals; they are not uploaded
or committed by this importer.

| Source | Public copy |
| --- | --- |
| 2022–2023 report, 14 source pages | 15 pages including a release notice; programme text and selected ceremonial photos retained; correspondence and press attachments removed |
| 2024 Word report | 19-page reflowed text edition; programme narrative, aggregate statistics and reported expenditure retained; images, correspondence, individual case sections and victims’ lists omitted |
| 2025 report, 79 source pages | 26 pages including a release notice; selected programme pages retained; individual case material, victims’ lists/photos, graphic incidents, case attachments and personal contact details omitted |
| PCP evaluation certificate | Supplied scan; unreadable number and dates left blank |
| Punjab Charity Commission 2022–2023 | Historical scan; stated validity ends 15 May 2023 |
| Office bearers filing, 2026 | Supplied acknowledgement dated 16 April 2026; no renewal claim |
| Punjab Charity Commission 2024–2026 | Historical scan; stated validity ends 22 January 2026; identical repeated scan included once |

Report findings and amounts are attributed to HRPF; the public editions do not
claim independent verification or audited expenditure. Page counts describe the
actual public files. Exact reporting start/end dates are left blank where unstated.
Detailed retained-page/paragraph decisions are in `backend/seed/document-review.json`; release notes and file hashes are in `backend/seed/document-releases.json`.

## Verification

`npm run check`, API integration and seed integration tests verify permissions,
file types, draft/public access, downloads, version conflicts, withdrawal, original
protection, rerun preservation, interrupted storage and role revocation. Frontend
checks cover build/type/lint plus production SSR cards, new-tab links, empty/offline
states and the admin route. All public PDF pages were rendered and visually reviewed.
