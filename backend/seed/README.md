# Audited source imports — M3

Run from `backend/` with Node 24. The tracked manifest contains metadata, source
paths and checksums. Original binaries and generated files remain ignored. No
seed command uploads, publishes, sends email, creates members or sets fees.

## Source layout

Place approved files directly under `backend/seed-assets/`, without an extra
`hrpf/` directory. Extract gallery ZIPs into the named directories below. Commands
read only manifest paths; they never scan arbitrary files or credential documents.

| Directory | Required files |
| --- | --- |
| information | Board of Directors.docx; given pages text.txt; social handles.txt; PROFILE HRPF.docx; logo.jpeg |
| newspaper_cuttings_final | image_index.csv and 57 website_webp/news-###.webp files |
| other_images_final | image_index.csv and 143 website_webp/gallery-###.webp files |
| progress reports | PROGRESS REPORT HRPF 2023.pdf; PROGRESS REPORT 2024 Revised.docx; 2025 Progress Report.pdf |
| certificates and registration | Five supplied WhatsApp JPEG scans |
| aims and objectives | Five supplied constitutional-object JPEG scans |

`source-manifest.json` is the exact filename/checksum inventory. Internal AI
comparisons and original-review images are excluded from preparation; preserve
them privately for release review. Seven board photos are extracted to memory
from fixed DOCX entries using `unzip -p`; install `unzip` if missing. No separate
board-photo ZIP is required. The chairman photograph still needs a reviewed crop.

## Commands

```bash
npm run seed:check
npm run seed:plan
npm run seed:prepare
npm run seed:import
npm run seed:import -- --database
npm run seed:import -- --apply
```

| Command | Behavior |
| --- | --- |
| seed:check | Validates manifest and strict draft models offline; included in CI |
| seed:plan | Verifies all 227 source references by exact bytes and SHA-256 |
| seed:prepare | Creates 216 local candidates and asset-plan.json under tmp/seed-prepared/hrpf-source-2026-10-05-v1/ |
| seed:import | Offline dry run with verified sources and record counts |
| seed:import -- --database | Reads configured MongoDB to classify entries; no index/record writes |
| seed:import -- --apply | Ensures additive indexes and inserts missing drafts using private MongoDB configuration |

Use `hrpf_dev` first. MongoDB must support replica-set transactions; Redis and
provider credentials are unnecessary. Source verification finishes before any
database writes. Connection errors omit private values.

Preparation creates complete files atomically without overwriting existing files.
Rerun after interruption to reuse completed files. Changed outputs or plans are
preserved and cause an error. Archive entries never extract arbitrary paths.

Imports commit each draft, SourceImport checkpoint and audit entry together.
Canonical gallery records precede duplicates. Stable keys and deterministic IDs
prevent duplicates across retries or parallel runs. Existing admin entries,
edits and deletions are always preserved. Changed source checksums/payloads report
`source-changed`; native identity collisions report `conflict`. There is no force
reset. Exit 2 means source drift/conflict; exit 1 means validation/file/connection
failure. Earlier committed drafts remain; rerunning resumes safely.

## Imported drafts

| Collection | Count | Initial state |
| --- | --- | --- |
| BoardMember | 7 | Inactive; authoritative names/order and sourced biography excerpts |
| GalleryItem | 200 | 176 pending; 24 hidden duplicates; no provider assets |
| Report | 3 | Pending release review; no provider files |
| Certificate | 4 | Pending; all five original scans referenced |
| ContentPage | 10 | Sourced English drafts |
| BlogPost | 3 | Attributed draft report overviews |
| Setting | 4 | Private identity/contact/social/donation settings |

Gallery metadata retains filenames, image type/treatment and export dimensions.
All 17 AI restoration flags and CSV duplicate links are retained. SourceImport
stores source checksums/reference metadata and review tasks. No notification
recipients or membership policy are seeded.

## Remaining release work

Candidates are not uploaded or approved. Apply signature and size checks
before provider storage, plus privacy/release review. Public workflows must require
reviewed clean assets. Gallery document validation rejects publication without a
reviewed asset or while a duplicate link remains; do not publish by direct updates.

- Convert the 2024 DOCX to PDF and verify layout/pages/size. Keep originals
  separate; public reports need review/redaction of private details and allegations.
- Review graphics, consent/personal details and AI restoration against originals.
  Neutral titles/alt text await accurate descriptive admin copy.
- Charity certificates remain historical and expired (2022–2023 and 2024–2026).
  FBR/PCP number/date remain unset; no renewal is inferred.
- Only 11 curated aims are seeded. Proofread all 42 constitutional objects from
  scans before adding full text; no OCR Markdown was supplied in this pack.
- Current individual sources take priority. The profile supplies only fallback
  values, curated aims and thematic pillars; its people table is ignored. Urdu
  translation, exact Threads URL and office spelling remain pending.

`npm run test:seed` exercises real isolated MongoDB preservation, interruptions,
concurrency, rollback and conflicts without organization credentials or Redis.
