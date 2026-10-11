# Client project evidence update — 11 October 2026

The client supplied seven Facebook links and four distinct RTI scans. Public Facebook share links initially redirected to login. Resolving the post IDs allowed retrieval of public page summaries and image previews without signing in. Complete post bodies, every album image and the video file were **not** retrieved. Local image copies are checked into the repository; seed execution does not depend on Facebook or expiring CDN URLs.

## Verified mapping

| Supplied link | Verified subject | Existing project receiving evidence |
| --- | --- | --- |
| [19tZSJZXd5](https://www.facebook.com/share/p/19tZSJZXd5/) | Union Council building maintenance; attached HRPF representation dated 9 April 2026 | Union Council Building Advocacy |
| [1DFokyXfAK](https://www.facebook.com/share/p/1DFokyXfAK/) | Police crime/investigation concerns; attached inquiry follow-up letter dated 5 February 2025 | Public Safety Research and Institutional Accountability |
| [1c5WyjxZ1k](https://www.facebook.com/share/p/1c5WyjxZ1k/) | Sharing HRPF district crime analysis | Public Safety Research and Institutional Accountability; summary corroborates existing narrative, preview is a generic website image and is excluded |
| [19hWwuMDxs](https://www.facebook.com/share/p/19hWwuMDxs/) | Crime-information requests; accompanying newspaper coverage | Public Safety Research and Institutional Accountability |
| [1KJWphQ2X8](https://www.facebook.com/share/p/1KJWphQ2X8/) | Road levels and drainage in Mianwal Ranjha; letter dated 8 April 2026 | **Road Drainage and Waterlogging Advocacy**, rather than Road Visibility |
| [14reGzBWGjo](https://www.facebook.com/share/v/14reGzBWGjo/) | Canal pollution, sewage disposal and environmental-authority attention | **Canal Water and Environmental Accountability**, rather than Road Visibility; uses the genuine video preview frame |
| [1e4ssmDcd2](https://www.facebook.com/share/p/1e4ssmDcd2/) | Sialkot health-data research; attached District Health Authority RTI reply dated 23 May 2024 | **Sialkot Public Health Data Research**, rather than Road Visibility |

Road Visibility and Public Safety Advocacy retains its existing narrative and placeholder: none of the supplied links demonstrates its trailer/reflector advocacy. The other three road-labelled links belong to separate projects already present on the website. No duplicate or new project is created.

### Supplied scans

| Supplied file | Verified record | Assignment |
| --- | --- | --- |
| WhatsApp Image 2026-10-11 at 6.16.20 PM.jpeg | Central Police Office forwarding letter, 17 March 2023 | Public Safety |
| WhatsApp Image 2026-10-11 at 6.16.21 PM.jpeg | Punjab Information Commission order, 3 March 2023 | Public Safety |
| WhatsApp Image 2026-10-11 at 6.16.21 PM (1).jpeg | Punjab Information Commission follow-up order, 20 March 2023 | Public Safety |
| WhatsApp Image 2026-10-11 at 6.16.22 PM.jpeg | District Police Officer response letter, 30 December 2021 | Public Safety |
| image(20261011-132355).png | Screenshot of the same 30 December 2021 letter | Excluded duplicate |

The police/traffic recipients establish an RTI accountability connection, not a reflector-specific road-safety connection. These documents are not described as event photographs. The 2021 and 2023 correspondence, 2024 crime research and 2025 inquiry follow-up remain distinct dated activities. The 2025 HRPF letter refers to an inquiry report; the report itself and subsequent enforcement have not been independently supplied. No eventual compliance, repairs, water-quality improvement or health-service delivery is invented.

## What the update changes

- Union Council: the dated maintenance representation, requested maintenance measures and matching letter image. April 2026 is the letter date; May 2026 was the supplied profile date.
- Public Safety: six matching images (newspaper coverage, four supplied scans, and the inquiry follow-up letter), a dated chronology and updated narrative.
- Road Drainage: matching letter image, dated representation and drainage details.
- Canal Water: genuine public-video preview and an additional public-awareness activity. Existing documented departmental/Ombudsman outcomes remain unchanged.
- Sialkot Health: matching health-authority response image and dated RTI/analysis milestones.

Ten distinct images are available across five projects. All preserve their existing titles, slugs, work-page selections, project status and publication date. If a project has no cover, its first new image becomes the cover and remaining images enter its gallery. Existing covers and galleries are preserved; new evidence is appended without repeating an already-bound image hash. The gallery already uses `object-contain` on desktop and mobile. Full-resolution supplied JPEG scans are retained without AI editing.

## Run from the repository root

Existing backend configuration must include the development database, Cloudinary credentials, `NODE_ENV=development`, `CLOUDINARY_NAMESPACE=hrpf/dev`, and `SEED_ACTOR_EMAIL` for an existing active content administrator/editor. Do not paste credentials into the terminal or commit them.

```bash
git checkout development
git pull --ff-only origin development
npm --prefix backend run seed:project-evidence
npm --prefix backend run seed:project-evidence -- --database
npm --prefix backend run seed:project-evidence -- --apply
```

When already inside `backend/`, use `npm run seed:project-evidence` and the same flags, without `--prefix backend`.

- No flags: verify the manifest and all ten image files offline; no database or Cloudinary writes.
- `--database`: read-only per-project plan.
- `--apply`: upload/bind verified media and update existing managed rows transactionally. This is the new updater; rerunning the original create-only seed alone cannot perform these changes.

The original work-project importer must already have created these projects. On a fresh development database, run the documented original seeds first, including `seed:work-projects -- --apply`. This updater never creates missing projects.

### Results and preservation

Expect five `updated` results (or `already-updated` on a repeat run) and one `evidence-unavailable` for Road Visibility. Only text still matching the original seed is replaced. An edited summary or details section is preserved and reported as `updated-admin-content-preserved`; verified media is still added safely. Exit code 2 indicates a preservation/conflict requiring review, not that completed updates were rolled back.

Deleted, withdrawn, scheduled/unapproved or unmanaged projects are not recreated or published. A changed manifest after its checkpoint is reported as `source-changed`, not silently reapplied. Upload interruption, concurrent edits and revoked editor permission are handled safely; staged files can be reused on a later valid run. Filled galleries are preserved and reported rather than trimmed. The original seed manifests/checkpoints are unchanged; a separate revision checkpoint commits with each update and invalidates the public cache.

Check all five project pages, their cards on `/programmes` and their already-selected work pages. In the admin project editor, confirm matching cover/gallery images and dates. Road Visibility should retain its placeholder. Repeat `--apply` to confirm that no additional uploads or duplicate gallery entries appear. Removing/replacing an image later in the admin panel remains authoritative.

No live database or client Cloudinary credentials were accessed during implementation. Tests use disposable MongoDB replica sets and a fake upload provider.
