# Sourced blog preview seed

`seed:blogs` enriches the three original `seed:home` BlogPost records. It adds an
introduction, three takeaways, four titled narrative sections, closing thoughts,
category/topics, source references, two labelled archive photos and one prepared
source brief PDF per article. It uses the supplied historical reports:

- Government Primary School Mianwal Ranjha: 2025 report, page 13.
- Canal water pollution advocacy: the relevant section of the revised 2024 report.
- Human trafficking awareness: 2025 report, pages 8–11; the introductory passage.

Claims are attributed to the historical source. School reconstruction, pollution
elimination, present case status, rescue totals and criminal convictions are not
inferred. Photographs are illustrative archive material, not verified case photos.
Prepared source briefs are editorial summaries, not original reports or official
decisions. Victim identifiers and unverified individual allegations are omitted.
The original summary text and publication date remain intact.

## Commands in Codespaces

Pull the latest development branch, then run in `backend/`:

```bash
npm run seed:blogs
npm run seed:blogs -- --database
npm run seed:blogs -- --apply
```

The first command validates the bundled checksummed source text, images and PDFs
offline. `--database` is a read-only plan. `--apply` requires privately configured
MongoDB, authenticated Cloudinary delivery, ClamAV, an existing active content
administrator/editor identified by `SEED_ACTOR_EMAIL`, `NODE_ENV=development` and
`CLOUDINARY_NAMESPACE=hrpf/dev`. Use the already working local configuration;
never paste secret values into chat. ClamAV must still be running when uploading.

If the original homepage records have not been seeded, run the existing
`npm run seed:home -- --apply` first. That command is create-only and preserves
existing rows. The blog command deliberately does not create replacements.

Restart backend/frontend after pulling. Open `/blogs`, then any of:

- `/blogs/school-accountability-mianwal-ranjha`
- `/blogs/canal-water-pollution-advocacy`
- `/blogs/human-trafficking-awareness`

All fields can then be managed in `/admin/blogs` using the existing account.

## Preservation and recovery

The seed only enriches an original published/approved homepage seed at version 1,
with no existing rich details, topics, image description, gallery or documents.
Before enrichment, any administrator revision, withdrawal or deletion is preserved.
The transaction rechecks eligibility, the actor and the record version. Once the
source checkpoint exists, reruns never overwrite later admin changes.

Expected statuses: `would-enrich`, `enriched`, `already-enriched`,
`admin-preserved`, `deleted-preserved`, `unmanaged-preserved`, `source-changed`
or `version-conflict`. Preservation is intentional; use the admin editor for
records already revised. There is no force/reset option.

All source bytes are verified and scanned before storage writes. An interrupted
run can reuse its own unexpired staged files. Each article commits details, media
binding, checkpoint and audit atomically, preserving its original cover/date/text.
Changes to the manifest after an earlier enrichment report source drift instead
of overwriting content. Local/CI tests use disposable databases and injected
providers; the live Codespaces import must run with private service access.
