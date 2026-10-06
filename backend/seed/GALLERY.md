# Sourced Gallery preview seed

Run on the latest `development` branch in Codespaces:

```bash
cd /workspaces/hrpf
git pull origin development
cd backend
npm run seed:gallery
npm run seed:gallery -- --database
npm run seed:gallery -- --apply
```

The plain command verifies the four bundled WebP files, original source CSVs,
checksums and metadata offline. `--database` reads a preservation plan without
writes. `--apply` uploads scanned images and publishes four sourced examples:

- Press coverage: Daily Awami Forum Karachi archive cutting (`news-016`).
- HRPF photographs: indoor portrait (`gallery-003`), TMA building (`gallery-004`)
  and Lahore Press Club backdrop (`gallery-005`).

Open `/gallery/media-coverage`, then select HRPF photographs to see the photo
collection. Edit these items at `/admin/gallery`. No example dates or participant
identities are invented. The provided sources have no individual interview video
links, so no interview is seeded; add real YouTube or Vimeo links in the TV
Interviews admin tab.

Use the existing private MongoDB, Cloudinary and ClamAV configuration and existing
active content administrator/editor in `SEED_ACTOR_EMAIL`. Applying requires
`NODE_ENV=development` and `CLOUDINARY_NAMESPACE=hrpf/dev`. ClamAV must be running.
Actual credentials remain in private configuration.

The seed uses the original GalleryItem seed keys and source-import checksums.
It can enrich pristine imported drafts or create them when they do not yet exist.
It preserves native/unmanaged rows, edited drafts, deleted imports, withdrawn
publications and later changes. A separate preview checkpoint prevents repeated
publication; failed/interrupted runs recover clean unexpired staged images. Each
image binding, release, checkpoint and audit entry commits atomically.

Progress reports `scan`, `database`, `upload` and `publication` phases. Failures
identify the phase without echoing credentials/provider responses. Completed
records are safe to rerun. Scanning and checksum failures stop the complete batch
before any new database or provider write.
