# Blog details implementation

## Plan and resulting workflow

Retain the HRPF theme and canonical `/blogs` routes. Use an article layout with
readable text, a large cover, an optional contents panel and a narrower sidebar.
Keep the existing BlogPost records and legacy News API compatibility.

| Content collected in `/admin/blogs` | Reader display |
| --- | --- |
| Title, excerpt, language and URL slug | Headline, introduction card text and canonical article URL |
| Category, topics and optional public author name/role | Category label, author line and topic chips |
| Introduction and up to eight takeaways | Opening narrative and a highlighted key-takeaways panel |
| Up to twenty titled sections, text, bullet lists and attributed quotations | Long-form story and linked contents panel |
| Closing thoughts | Final article section |
| Cover with description/caption and up to twelve additional photos | Cover and manual gallery with arrows, thumbnails, keyboard and swipe controls |
| Up to twelve source references, optional HTTPS links and source notes | Sources and references |
| Up to three labelled PDFs | Supporting document downloads |
| Optional search title/description | Article metadata; otherwise use title and excerpt |

The public article also shows publication date and estimated reading time, offers
copy-link/Facebook/WhatsApp/X sharing, and recommends up to three other released
articles from the latest public feed, preferring the same category. Publication
date is the website release date, not an incident date. Reading time is a rough
220-words-per-minute estimate. Private account email/IDs never become a byline.
Comments, automatic scheduling and rich HTML are outside this change.

## Administration and release

Existing active super administrators, administrators and editors can add/edit,
preview, save a draft, publish, withdraw and delete at `/admin/blogs`. Projects
and Blogs have shared navigation links within administration. No extra login or
new credentials are introduced. English/Urdu records use the existing locale
contract; this does not generate translations.

The editor previews the same reader component using authenticated file URLs.
Existing paragraph/heading/list blocks remain visible and editable. New articles
can use just the introduction and structured sections. Blank articles cannot be
published. Images are JPG/PNG/WebP up to 5 MB; PDFs up to 10 MB. Uploads retain
existing type inspection and ClamAV scanning.

Saving an existing article makes it a private draft. Publication requires an
explicit release attestation. Owned unexpired staged files or files already bound
to that exact article can be attached. Binding, publication and audit records are
transactional; stale versions fail. Removed, withdrawn and deleted files lose
public access immediately. Public URLs recheck the approved entity and file on
every request. Legacy `/api/news` and `/api/admin/news` read/write the same records.

## Preview seed

See `backend/seed/BLOGS.md`. The explicit development-only `seed:blogs` enrichment
adds sourced detail to the three original homepage articles, with two illustrative
archive photos and one prepared source brief PDF each. It preserves article IDs,
slugs, original text, cover and publication date. It will not recreate deleted
articles, republish withdrawals or replace administrator revisions.

## Verification

Frontend lint, route type generation, TypeScript, production build and production
HTTP checks cover the rich article, existing minimal text, contents, gallery,
sources, downloads, share controls, related articles, article metadata and admin
route. Existing homepage/navigation/redirect/pagination/empty/offline checks remain.

Real MongoDB/Redis integration covers rich drafts, media validation, publication,
withdrawal, deletion, stale versions, legacy API compatibility, section-only
articles, unsafe sources, quotation attribution and media limits. Real MongoDB
seed scenarios cover initial enrichment, idempotency, administrator preservation,
withdrawal/deletion, interruption recovery, source drift and actor revocation.
External storage/scanning use injected providers in those tests; no live NGO data
or email is changed. Interactive browser verification remains blocked by the
cloud browser's localhost restriction.
