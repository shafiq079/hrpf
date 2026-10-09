# Project photographs and work-page placement

Reviewed 8 October 2026. Covers were audited across all 31 seeded projects,
the 200 supplied archive images and the original progress reports. Accessible
social posts were also checked; no unverified social image is imported.

Eight projects have a supportable activity-specific photograph. The remaining
23 have no stored cover. Their cards use one clearly labelled neutral placeholder
graphic with the same 4:3 image area as verified covers. Uploading a real cover in
Admin replaces it automatically; the placeholder is not saved as project media.
There is no automatic archive-photo fallback. The three older
projects also lose their unrelated illustrative seed galleries. Internal source
notes stay in this document and the review manifest, outside the public UI.

| Project | Reviewed photograph | Evidence |
| --- | --- | --- |
| Student Support at The Smart School | Chairman visiting student displays | Exact image28 in the original 2024 report's Smart School section |
| Community Drinking-Water Cooler | Installed cooler | Exact embedded image on page 32 of the original 2025 report |
| Roadside Electrical Hazard Removal | Before and after pole replacement | Exact image39 beside that intervention in the 2024 report |
| Community Peace Walk in Sukkur | Peace-walk participants | Archive 185 matches original 2024 report image57 |
| Clean-Water Feasibility in Mianwal Ranjha | Appreciation to public-health engineering officials | Archive 138 matches page 7 of the 2022–2023 report, continuing the intervention on page 6 |
| Electricity Distribution in Mianwal Ranjha | Appreciation to GEPCO officials | Archive 154 matches page 8 beside LT/HT proposals and feeder maintenance |
| Childhood Vaccination Access | Appreciation to the Director General of Health | Archive 152 matches page 12 beside the vaccination-access intervention |
| Mianwal Ranjha Sanitation | Drainage inspection | Archive 173 matches the location, people, shop frontage and inspection in original 2024 report image20 |

The appreciation images show recognition of officials. Their alt text says so;
they do not depict vaccinations or construction of a filtration plant. Images
are copied byte-for-byte from the supplied archive/report. Cards contain each
photograph rather than cropping away the before/after context or subject.

## Shared placeholder asset

`frontend/public/images/hrpf/project-placeholder.webp` is one neutral graphic
generated with the built-in image-generation tool, then encoded as WebP for the
website (9,816 bytes, 1448 × 1086). Its live label is **Project photo to be added**,
which remains translatable. It is used only by cards with no stored cover;
project galleries and evidence records contain only real uploaded photographs.

Generation prompt:

> Use case: ui-mockup. Asset type: single shared project-cover placeholder image for the Human Rights Protection Foundation Pakistan website. Create a polished neutral landscape 4:3 graphic, 1200 by 900 if possible. Background flat very pale cool grey #F3F7F8 with an extremely subtle light teal geometric motif in two opposite corners. In the upper central area, one restrained thin-line image-frame pictogram: a small circle and two mountain shapes inside a simple rectangular frame. Use muted teal #159C96 and deep navy #0B2A3A, with plenty of breathing room. The pictogram must be centered horizontally, positioned slightly above the center, about one quarter of canvas width. Keep the lower quarter clear for a live webpage text label. Clean professional institutional nonprofit visual style, flat graphic, no photographic scene. No words, no letters, no logo, no watermark, no people, no documentary event, no extra objects. This is obviously a generic placeholder rather than a real project photograph. Opaque background.

## Admin workflow

In Admin → Projects, use **Display on Our Work pages** to select one or more
pages. Every published project also appears in All Projects. Clearing all boxes
keeps it in All Projects only. The **Project topic** label does not control page
placement. A minority-only selection appears on Minority Rights and All Projects.
Drafts, pending reviews, future publication dates and withdrawn projects remain
excluded from public feeds. Saving an edit returns the record to a private draft
until the administrator publishes it through the existing workflow.

## Apply to an existing development installation

Pull development and rebuild/restart both packages. With the existing private
development database, Cloudinary and SEED_ACTOR_EMAIL configuration, run:

```sh
npm --prefix backend run seed:work-projects
npm --prefix backend run seed:work-projects -- --apply
```

The first command verifies evidence and all eight image files offline. Apply
imports missing catalog records and repairs existing seeded presentations. It
accepts only the known v1 checkpoint checksum when upgrading to v2. It uses
transactions, active-actor checks, optimistic versions, audit logs and public
cache revision updates. It does not reset the database or create users.

An old image is corrected only when its checksum, project binding, seed audit,
owner and creation time prove it was seeded. Later admin uploads are preserved,
even with the same bytes. Removed images become restricted and their old public
URLs stop delivering them. Project narratives, documents, publication decisions,
explicit admin page selections, deletion tombstones and unmanaged slug collisions
are preserved. Interrupted repairs recover staged uploads; successful reruns make
no additional uploads or audit entries.

For a fresh installation, run the existing homepage/project-detail setup first,
then this command. Immutable v1 manifests remain available for provenance and
upgrade comparisons; the work-project loader applies the current review to build
the effective v2 catalog. No live NGO database is used by automated verification.
