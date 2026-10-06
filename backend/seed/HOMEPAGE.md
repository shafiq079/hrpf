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
