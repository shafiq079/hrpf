# Project pages and administration

Implemented on development, 2026-10-06. The owner requested full project stories
and matching administrator inputs. `/admin/projects` is the project console;
`/admin` redirects there. Existing active super administrators, administrators
and editors sign in using the existing backend accounts. Other admin modules
remain future work.

## Content collected

Required essentials: English title and summary, unique page address, focus area,
location and project status. Optional Urdu title/summary and page language are
supported; write the other content in that page's language.

Optional content:

- Start year, project period, and the community supported.
- One cover image and up to 20 gallery photos, with descriptions and captions.
  Photos support JPG, PNG and WebP, up to 5 MB each. Admins can reorder photos,
  choose a new cover and remove photos.
- Overview, challenge and approach, with paragraph breaks.
- Objectives (20), activities (30), outcomes (20), and confirmed partners (20).
- Timeline milestones (20), with period, title and optional explanation.
- Impact figures (8), with value, label and an optional evidence source.
- Additional titled sections (12), such as lessons learned or next steps.
- Original structured story blocks: paragraphs, headings and lists (100).
- Up to 5 PDF documents, each up to 10 MB, with public document labels.

Empty optional sections are omitted on the public page. Existing seeded story
blocks remain visible and editable. No project facts or impact figures are
automatically invented. If no story blocks are supplied, the summary becomes
the initial story paragraph; preview uses the same fallback.

## Reader and editor behavior

The public page uses the existing navy, teal and gold theme. It includes project
essentials, a manual photo slider with thumbnails, captions, keyboard arrows and
touch swipes, narrative sections, objective/activity/outcome cards, timeline,
impact figures, partners and document links. The sidebar links to populated
sections and the existing contact page. No automatic slide rotation.

`/projects` now lists published managed projects instead of prototype records.
`/projects/[slug]` and the existing `/programmes/[slug]` links render the same
detail view. News pages and content are unaffected.

Admins can add/edit, preview, save a draft, save and publish, withdraw or delete.
Saving edits to a published project returns it to draft, following the existing
publication policy. Save and publish releases the reviewed version. A failed
publication leaves the successfully saved draft available for retry.

Uploads use the existing ClamAV scanner and authenticated Cloudinary storage.
Owned staged files are bound transactionally when saving. All project files
remain private in drafts. Publishing releases only clean bound files; removed
files, withdrawals, draft edits and deletions revoke public access. Foreign,
expired, duplicate and wrongly typed assets are rejected. Requests use HttpOnly
session cookies, fresh session-bound CSRF tokens, existing role checks and
optimistic record versions. Provider identifiers are excluded from reader/editor
responses. Project JSON requests are bounded to 256 KB.

## Updating Codespaces

Pull development after preserving any local code edits. Stop and restart both
application development processes after the pull. Dependencies and private
configuration are unchanged. No database reset, migration, administrator
recreation or homepage reseed is required. Existing project records continue to
render and can be enriched through the editor.

## Verification

- Backend check: TypeScript, 22 unit tests, source verification, homepage seed
  offline plan, build and OpenAPI consistency.
- Real disposable MongoDB/Redis integration suite: 27 tests, including rich
  content round trips, private/public file transitions, removal, stale versions,
  asset ownership/type validation and project-list versions.
- Seed suites: 15 tests, including preservation of administrator changes.
- Frontend lint, TypeScript, production build and homepage/project rendering
  checks, including new rich sections, managed listings and old programme links.
- Production Next proxy with real disposable MongoDB: cookie/CSRF login, test
  uploads, draft privacy, publication, rich page rendering and file delivery.

External uploads/scanning use injected test providers; no live NGO database or
Cloudinary content was changed. The cloud browser rejected access to this
workspace's localhost server (`ERR_BLOCKED_BY_CLIENT`), so visual interaction,
slider gestures and mobile browser appearance remain unverified here.
