# Board of Directors and Our Team

**Superseded team placement, 10 October 2026:** supplied directors now appear
only on Board of Directors. Our Team uses an independent operational staff
collection and `/admin/team`; historical `showOnTeam` flags have no public effect.
The source/import history below remains for board profiles. See
`OPERATIONAL_TEAM.md` for the current staff workflow; do not run a board seed to
populate the operational team.

Seven supplied office-bearer profiles are managed records rather than prototype
staff. `/about/board-of-directors` and `/about/our-team` list approved profiles in
rank order with pagination. Both link to `/about/people/[slug]`, which displays the
introduction, portrait, role and full structured biography. The chairman has twelve
biography sections. Missing profiles return 404; dependency failures show an
unavailable state. Published URLs and photographs stop resolving after withdrawal,
deleting a profile, or saving an edit as a draft.

The source is `information/Board of Directors.docx`. Names, designations, biographies
and seven embedded photographs come from that document. Existing rank order from
the original source manifest remains. Dr. Sidra Mubashir is displayed as **Joint
Chairperson**, as stated in her biography; the older internal slot label is not a
public designation. The office-bearers are shown on Our Team for their supplied
operational roles. No additional employees or volunteers are invented.

The embedded chairman photograph is a phone screenshot. Its bytes stay intact;
admin-adjustable display zoom frames the portrait within the card and profile.
There is no AI enhancement. Source copy is attributed to HRPF and is not an
independent verification of biographical claims. The repeated Official Profile
contact footer is omitted from the biography; organisational contact remains on
the Contact page. Optional Urdu biography and section fields are supported; wider
translation remains a later milestone.

## Administration

`/admin/board` supports active administrators and super administrators. Editors
and case managers cannot manage or publish people. The editor collects name,
identifier, designation, order, introduction, up to sixteen full sections,
Board/Team placement, portrait description and display zoom. Sections can be
reordered. Portraits are optional; publish requires a biography, at least one
placement and a description if a portrait is attached. Preview uses the same
profile component with authenticated private image content.

New/edited profiles are inactive drafts. Save-and-publish requires review
attestation. The backend rechecks the current actor inside audited transactions,
uses optimistic versions, and binds only the administrator's clean unexpired
staged raster image or the profile's existing bound photograph. Old/replaced
photographs become restricted. PDFs, foreign, expired and cross-profile files are
rejected. Provider URLs, original import references and internal source labels are
excluded from public DTOs. A published team-only person is available on their
profile URL but does not appear in the Board list.

Public APIs: `GET /api/board`, `GET /api/team`, `GET /api/board/:slug`.
Admin APIs: `GET/POST /api/admin/board`, `GET/PATCH/DELETE /api/admin/board/:id`.
Publication: `POST /api/admin/publication/board/:id` with current version, action
and releaseReviewed. OpenAPI describes implemented contracts.

## Populate the supplied profiles

In Codespaces, with existing private MongoDB/Cloudinary configuration:

```bash
cd /workspaces/hrpf
git switch development
git pull --ff-only origin development
cd backend
npm run seed:board -- --database
npm run seed:board -- --apply
```

Offline `npm run seed:board` validates the seven bundled original photographs and
profile manifest. `--database` is read-only. `--apply` requires development,
`CLOUDINARY_NAMESPACE=hrpf/dev`, and SEED_ACTOR_EMAIL identifying an active
administrator/super administrator. It inspects every photograph before provider or
content writes. Upload/publish is resumable per person, retains completed releases,
reuses staged uploads after interruption and preserves later edits, withdrawals,
deletions and native collisions. It can enrich untouched original source drafts.
Runtime APIs and admin controls work for future profiles without changing the
seven-person source manifest. Rerunning imports is not the mechanism for admin
updates to already-reviewed profiles.

The importer does not require PDF delivery and does not fix the separate Cloudinary
PDF policy block reported during document viewing. Global caching remains deferred. Validation uses disposable replica-set MongoDB,
Redis and synthetic providers; owner services are exercised by the Codespaces run.
