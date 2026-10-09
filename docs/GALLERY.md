# Gallery implementation

Previous project, blog, homepage and navigation work was merged into `main`
through PR #3 (merge commit `9795ada`). The Gallery implementation is on
`development`; the owner explicitly wants it reviewed there before any later
merge into `main`. Only these two branches are used.

## Public pages

- `/gallery` retains the existing two-category landing page and NGO theme.
- `/gallery/media-coverage` shows published newspaper cuttings and a separate
  HRPF photographs collection (`category=in-action`). Literal title search,
  bounded pagination and collection/search-preserving links use real API data.
- An image button opens a native modal viewer with 100–400% zoom, scrollable
  image, previous/next controls, arrow-key navigation, Escape/close, full-size
  link, complete caption, optional source/date and original coverage link.
- AI-restored images show an explicit label on the card and in the viewer.
- `/gallery/tv-interviews` lists released interviews, introductions, channel and
  known dates. Players load only after a visitor chooses to watch; closing the
  player removes the iframe. An external watch link remains available.
- Empty and unavailable collections show appropriate guidance without demo data.

## Administration

`/admin/gallery` uses the existing administrator/editor login and cookie/CSRF
workflow, alongside links to Projects and Blogs. It has Images and Cuttings and
TV Interviews tabs, 20-record pages, add/edit, preview, private draft, publish,
withdraw and delete. Source-import provenance and duplicate markers remain intact.

| Record | Collected fields |
| --- | --- |
| Image/cutting | Title, press/photos collection, image type, alt text, caption, optional publication name/date/HTTPS source link, display order, original/AI treatment, one image |
| Interview | Title, individual video URL, introduction/topics, optional channel/date, display order, optional thumbnail with alt text |
| Optional translated text | Urdu title, image alt/caption or interview introduction |

JPG, PNG and WebP images are limited to 5 MB and inspected before staging. Videos
use individual public YouTube or Vimeo links. Channel links, arbitrary hosts,
embed HTML, credential-bearing URLs and private/unlisted Vimeo hash URLs are not
supported. No raw video upload/storage pipeline is introduced.

Saving an edit atomically withdraws the old release and keeps attached images
restricted. Publication uses a separate reviewed action and current version.
Clean staged files must belong to the actor and be unexpired; claimed files must
already belong to this exact record. Removed, withdrawn or deleted media URLs
stop resolving publicly. A stale version cannot replace another editor’s work.
Current actor permissions are rechecked inside mutation/publication transactions.
If draft saving succeeds but publication fails, the editor retains the saved ID
and version so a retry does not create a second record.

## API

- `GET /api/gallery`: existing contract plus media type, publication name,
  optional event date and safe HTTPS source URL; literal `q` title search.
- `GET /api/interviews`: released interviews with generated allowlisted
  watch/embed URLs and an optional correctly bound released thumbnail.
- `GET/POST /api/admin/gallery`, `GET/PATCH/DELETE /api/admin/gallery/:id`.
- `GET/POST /api/admin/interviews`, `GET/PATCH/DELETE /api/admin/interviews/:id`.
- Publication kinds: `gallery` and `interview` at the existing publication API.

Gallery counts exclude unreviewed/duplicate/future entries and files that are
missing, restricted or bound to another entity before pagination. Interview
counts exclude noncanonical stored video URLs before pagination. Public/editor
DTOs omit private provider metadata and source file names. OpenAPI is generated
from the implemented schemas. Existing GalleryItem/source-import identities and
legacy publication APIs remain compatible.

## Full sourced collection

See [seed instructions](../backend/seed/GALLERY.md). `seed:gallery -- --apply`
imports all 200 supplied source entries. It publishes 44 newspaper cuttings under
Press coverage and 132 photographs/graphics under HRPF photographs; 24 indexed
duplicate entries remain hidden. The supplied 200 WebP versions and original
CSV indexes are bundled and checksummed. Alternative JPEG exports and comparison
images are not counted as additional gallery entries. AI-restored images retain
their visible disclosure. No individual interview recordings were provided, so
the import does not fabricate interview videos. The admin editor is ready for
real video links.

Existing pristine source-import drafts are enriched without creating duplicates.
Edits, withdrawals, deletions and unmanaged rows are preserved. Interrupted
uploads can reuse their staged assets; each image release and checkpoint commit
atomically. All 200 files are checked before any new content import or
provider upload. Canonical entries import before duplicates, preserving every
duplicate relationship even after an interruption. Scan progress and final result
counts appear in the terminal.

The original four preview releases, their exact descriptions and original source
checksums remain compatible. On an otherwise unchanged preview database, the full
command publishes 172 more images and retains the four existing releases. Native
admin edits and intentional withdrawals/deletions can reduce that total and are
preserved. Captions describe visible scenes without inventing dates or roles;
newspaper claims remain attributed to their historical source images.

## Verification and limits

Local backend checks, 40 real MongoDB source/seed tests and 34 MongoDB/Redis API
tests pass. The source/seed integration tests cover the complete
archive, unchanged preview checksums/documents, 176 public releases across all
pagination pages, 24 hidden duplicates, retained AI treatment, final-image scan
failure before writes, recovery after a provider interruption and inconsistent
checkpoint preservation. Existing API and frontend verification continues to
cover the public and admin gallery contracts.
Production SSR checks cover both collections, Gallery labels, viewer entry
point, interview preview entry point, pagination, admin route, delayed iframe
loading, empty/unavailable feeds and cookie isolation.

No owner database or Cloudinary writes were performed from this environment.
Interactive zoom, focus restoration, mobile layout and external-provider playback
still need visual acceptance in Codespaces; browser testing was unavailable here.

## Repeat navigation and image delivery — 2026-10-08

Gallery lists use the shared revision-keyed Redis cache. Cards request bounded responsive WebP thumbnails; the full-size viewer retains original bytes. Public raster requests revalidate release eligibility before returning a zero-byte 304 for unchanged images. Normal future uploads and every editor/import publication transaction use the same pipeline. See `PERFORMANCE_PLAN.md` for measured integration results and deployment checks.
