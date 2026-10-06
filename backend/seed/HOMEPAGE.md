# Homepage projects and news seed

This separate seed creates three Project records and three BlogPost records from
supplied HRPF reports. The six cover photos and exact source excerpts are bundled
under `home-assets/`, so it runs entirely from `backend/` without the frontend or
original ZIPs. Fixed homepage copy remains static. Existing homepage design and
headings **Featured Projects** and **Latest News & Updates** are retained.

## Records

| Type | Content | Source |
| --- | --- | --- |
| Project | Dar-ul-Aman shelter dignity and facility improvements | 2025 report, pp. 14–15 |
| Project | Mianwal Ranjha sanitation repairs | 2024 report, sewerage scheme section |
| Project | Childhood vaccination access | 2022–2023 report, health section |
| News | School facility petition | 2025 report, p. 13 |
| News | Canal water pollution advocacy | 2024 report, canal contamination section |
| News | Human trafficking awareness | 2025 report, pp. 8–11 |

Project `Completed` refers to the documented intervention, not resolution of every
continuing social problem. No precise project start date, beneficiary count,
funding, institutional partnership or historical article date is invented. News
publication dates are the dates these report summaries are published on the
website. Reader text explicitly identifies the historical source. Covers are
illustrative HRPF archive photos, not asserted to depict the particular case.
No victim identifiers or accusations against named individuals are imported.

## Run in Codespaces

First pull development and run `npm ci` inside `backend/`.

```bash
npm run seed:home
```

That default command verifies all bundled checksums, file formats and the manifest
**offline**. It writes nothing to MongoDB or Cloudinary.

Configure these privately in `backend/.env` (never paste their values into chat):

- Existing MongoDB replica-set URI and database name.
- Existing Cloudinary cloud name, API key and secret.
- `NODE_ENV=development` and `CLOUDINARY_NAMESPACE=hrpf/dev`.
- Working `CLAMAV_HOST` and optional `CLAMAV_PORT` (default 3310).
- `SEED_ACTOR_EMAIL`: email of an existing active admin, super admin or editor.

The account must already exist; use the documented `npm run admin:create` setup if
needed. No seed password is required. Uploads use the same ClamAV scanner and
Cloudinary provider as admin uploads. Missing scans fail closed. A ClamAV daemon
must be reachable; Redis and the API process are not needed for this seed command.

```bash
npm run seed:home -- --database   # read-only database plan
npm run seed:home -- --apply      # import, scan, upload and publish the six records
npm run dev
```

Then start the frontend separately and refresh the homepage. Public `/api/projects`
and `/api/news` feeds supply the cards and `/api/public-assets/:id` supplies the
covers; Cloudinary credentials and private provider URLs never reach the browser.

## Preservation and recovery

Create-only source checkpoints and deterministic IDs prevent duplicate records.
An already published, edited, withdrawn or deleted entry is preserved on rerun.
A matching unmodified draft may recover after interruption. A clean owned staged
cover is reused when available; expired staged covers are handled by normal asset
pruning. Slug conflicts and changed source checksums are reported rather than
replacing admin work. Publication rechecks the active actor under the shared
user-governance lock, requires a clean owned cover and commits visibility, version
and audit records together. This command is limited to development configuration
and the `hrpf/dev` Cloudinary namespace; it refuses production operation.

When no published feed records exist, the two original headings remain and their
card grids are empty. There is no renamed programme/report fallback and withdrawn
content does not reappear from a frontend hardcoded fallback.

## Fill the existing project detail pages

At the owner's request, a separate one-time enrichment updates the three existing
published homepage projects in place. Use this after the original `seed:home`
import, with the same private services and active `SEED_ACTOR_EMAIL`:

```bash
npm run seed:projects                 # offline file/manifest verification
npm run seed:projects -- --database    # read-only plan
npm run seed:projects -- --apply       # enrich and publish the three projects
```

This adds report-grounded overview, challenge, approach, objectives, activities,
outcomes, community, report period, three timeline milestones, qualitative
result cards, sources and evidence scope. Each project retains its cover and
gets two additional archive photos and one downloadable source-summary PDF.
The exact case dates, numerical impact, budgets and formal partnerships are
not supplied by these passages, so none are invented. Photo captions identify
archive illustrations; milestone labels describe the report's sequence rather
than assert exact dates. PDFs are prepared project source briefs, not copies of
the complete original reports.

The bundled manifest is `project-details-manifest.json`; its PDFs and source
checksums are verified before uploads. Assets use ClamAV and authenticated
Cloudinary, with the same project media binding and release rules as admin edits.
Each project's details, released files, version increment, checkpoint and actor
audit commit together. Existing titles, summaries, stories, URLs, covers and
publication dates are retained. News records are unaffected.

Output `enriched` means the project was updated. Reruns report `already-enriched`
without further uploads or overwriting later admin edits. Deleted, withdrawn,
unmanaged and already-rich admin projects are preserved. A version conflict
preserves a concurrent edit; a later rerun can reuse staged uploads. This command
does not recreate missing projects and is restricted to development and hrpf/dev.
