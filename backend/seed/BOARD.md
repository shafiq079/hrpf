# Supplied board profiles

`board-releases.json` contains seven sourced biographies and the mapping to exact
original JPEG bytes extracted from the supplied Board of Directors Word document.
The unchanged `source-manifest.json` retains original import identities and hashes.
The private Word document itself is not bundled. Portrait mappings were checked
against each drawing's position in the Word XML and visually inspected.

Run `npm run seed:board` for offline verification, add `-- --database` for a
read-only database plan, or `-- --apply` to scan, upload and publish the seven
profiles using existing private development services. Existing source drafts can
be enriched only while untouched, inactive and without a bound photograph.
Completed imports and administrator content remain unchanged on reruns.

The seed publishes the supplied office-bearers to both Board of Directors and Our
Team; these pages share profiles without creating duplicate people. Future admin
profiles can be shown on either or both pages. See `docs/BOARD_AND_TEAM.md` for
fields, permissions, publication, source treatment and review commands.
