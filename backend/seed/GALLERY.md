# Full sourced Gallery import

Run on the latest `development` branch in Codespaces:

```bash
cd /workspaces/hrpf
git switch development
git pull --ff-only origin development
cd backend
npm run seed:gallery
npm run seed:gallery -- --database
npm run seed:gallery -- --apply
```

The plain command verifies all 200 bundled WebP files, both original source CSVs,
checksums and descriptions offline. `--database` reads a preservation plan without
writes. `--apply` inspects the complete collection before any new import or upload,
then uploads and publishes canonical source images:

| Collection | Source entries | Published once | Hidden duplicate entries |
| --- | ---: | ---: | ---: |
| Press coverage | 57 | 44 | 13 |
| HRPF photographs, including supplied graphics | 143 | 132 | 11 |
| Total | 200 | 176 | 24 |

The collection contains 129 photos and 14 graphics before duplicate removal.
The existing four-image preview is recognised using its unchanged source IDs,
descriptions and publication checkpoints. On a database with those four releases
and no later edits, expect 172 `published`, four `seeded-preserved` and 24
`duplicate-hidden` results. A fresh database publishes all 176 canonical images.
Admin changes or deletions can reduce the public total and are reported instead
of being overwritten.

Duplicate relationships come from the supplied CSV indexes, not just exported
file hashes: an AI-restored copy can have different bytes from its original
duplicate. All 200 source records and WebP files are retained for provenance;
duplicate records stay hidden and do not require repeated Cloudinary uploads.
JPEG exports and AI comparison images are alternative versions, not additional
gallery entries. Existing AI treatment metadata remains intact (17 source entries,
16 canonical releases). The public gallery already shows the restoration label.

Open `/gallery/media-coverage`, then select HRPF photographs to see the photo
collection. Both collections retain search, pagination and the zoom viewer.
Edit any imported image at `/admin/gallery`. Descriptions record visible scenes
and identify cuttings as historical source reports. Dates, participant roles and
project results are not inferred from filenames or photographs. Newspaper text
is displayed in the original supplied image rather than rewritten as HRPF facts.
The provided sources have no individual interview video
links, so no interview is seeded; add real YouTube or Vimeo links in the TV
Interviews admin tab.

Use the existing private MongoDB and Cloudinary configuration and existing
active content administrator/editor in `SEED_ACTOR_EMAIL`. Applying requires
`NODE_ENV=development` and `CLOUDINARY_NAMESPACE=hrpf/dev`. No antivirus process is required.
Actual credentials remain in private configuration.

The import uses `gallery-archive-manifest.json` and `gallery-presentations.json`.
The original `gallery-manifest.json` four-image fixture remains for compatibility
tests. Every full-archive source record and file reference keeps the checksum
from `source-manifest.json`; no original source manifest is rewritten.

The seed uses the original GalleryItem seed keys and source-import checksums.
It can enrich pristine imported drafts or create them when they do not yet exist.
It preserves native/unmanaged rows, edited drafts, deleted imports, withdrawn
publications and later changes. A separate preview checkpoint prevents repeated
publication; failed/interrupted runs recover clean unexpired staged images. Each
image binding, release, checkpoint and audit entry commits atomically.

Progress reports `validate`, `database`, `upload` and `publication` phases, including
validation progress every ten images and a final count by result status. Failures
identify the phase without echoing credentials/provider responses. Completed
records are safe to rerun. Inspection and checksum failures stop the complete batch
before any new content import or provider upload. If a service stops, restart it
and run the same `--apply` command again. Completed publications are preserved;
unfinished records recover clean unexpired staged assets. The import is sequential
to keep provider load bounded.

No antivirus process is required. No private credentials belong in these files.
