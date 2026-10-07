# Import the supplied public document copies

From the repository root in Codespaces:

```bash
git switch development
git pull --ff-only origin development
cd backend
npm run seed:documents
npm run seed:documents -- --database
npm run seed:documents -- --apply
```

The plain command verifies seven bundled public copies offline. `--database`
reads a plan without writes. `--apply` publishes three report public editions and
four distinct certificates using your existing private development services.

Use `NODE_ENV=development`, `CLOUDINARY_NAMESPACE=hrpf/dev`, MongoDB, Cloudinary
and Cloudinary. `SEED_ACTOR_EMAIL` must identify an
active administrator or super administrator; editors cannot import certificates.
Keep actual values in `backend/.env` or Codespaces secrets.

This command inspects every public copy before content/provider writes. A failed
inspection stops the batch. Phase output identifies verification, configuration,
database, validation, upload or publication; errors never print private service values.
An interrupted apply is safe to rerun. Completed releases, deleted records,
withdrawals, admin revisions and native records are preserved. Clean staged
uploads from an interrupted publication are reused while unexpired. Source or
checkpoint conflicts return exit status 2 and require inspection, not force-overwrite.

The importer recognises untouched Report/Certificate drafts from the original
source import and enriches only those. It creates original draft/checkpoint records
if absent, then commits each public file binding, release and publication checkpoint
atomically. Original source hashes and derived public-copy hashes are both retained.

Open `/about/progress-reports`, `/about/registration-and-certificates`, and
`/admin/documents` after applying. The public reports are labelled editions with
documented omissions; the 2024 copy is reflowed text, not a layout-identical Word
conversion. Do not describe them as complete originals. Sensitive source ZIPs
are not uploaded. See [the document workflow](../../docs/DOCUMENTS.md).

Future reports and certificates are uploaded normally in the admin portal; this
seed is only for the supplied archive. Production seeding and live production deployment remains a separate task.
