# Operational team — 10 October 2026

`/about/our-team` now lists only published operational staff from a separate
`TeamMember` collection. Existing directors remain in `BoardMember`; historical
`showOnTeam` flags are ignored. No staff are imported, inferred from the board,
or created by this change. An empty collection displays **Nothing to show here**.
The legacy `/team` URL redirects to `/about/our-team`.

## Administration

Administrators and super administrators use `/admin/team` (Operational Team).
All five fields are required: picture, name, designation, responsibilities and
reporting to. The reporting line is free text so it can name a supervisor or role
without requiring another published member. Display order defaults to 1.

The editor provides a current photo preview, a clear JPG/PNG/WebP chooser (5 MB
maximum), replacement/delete-photo controls, a private card preview, Save draft
and Save and publish. Native labels and validation, distinct label/input weight,
responsive fields and hand cursors support form filling. No manual language
fields are required; public text uses the existing translation feature.

Public cards show the portrait, designation, name, full responsibilities (including
line breaks) and reporting line. Cards stack on mobile, use two columns on tablets
and three on larger screens, with pagination. API failures show an unavailable
state rather than claiming the collection is empty.

## Record and photo lifecycle

`/api/admin/team` supports bounded list/create; `/api/admin/team/:id` supports
read/edit/delete. `/api/admin/publication/team/:id` publishes or withdraws a member.
`/api/team` projects only published card fields and a protected photo URL.

Mutations require current administrator permissions, CSRF and optimistic versions.
Changes save as private drafts. Only an administrator's own staged, unexpired,
type-checked raster photo or this member's already bound photo may be used.
Board photos cannot be claimed by team members, or vice versa. Publish binds the
photo publicly; editing, withdrawal and deletion immediately revoke its public
delivery. Public cache revisions update atomically with every mutation.

No live database cleanup or seed import is required. Restart both servers after
pulling development; the existing backend startup creates additive model indexes.

## Check in the client environment

1. Confirm the team page displays Nothing to show here before adding members,
   while Board of Directors still displays its existing profiles.
2. Sign in at `/admin/team`; check all five required fields and photo preview.
3. Save a draft and confirm it does not appear publicly. Publish it and verify
   the five details and photo on mobile/desktop and with translation enabled.
4. Edit/replace the photo and publish again; check display order, withdrawal and
   deletion. Board of Directors must remain unaffected throughout.

Automated coverage includes required fields, administrator roles, CSRF, stale
versions, board/team separation, photo ownership/binding/revocation, seed
preservation, public cards, the exact empty message and the dedicated admin route.
No sample operational members are added to the application database.
