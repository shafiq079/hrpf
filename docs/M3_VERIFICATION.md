# M3 source/seed preparation verification

2026-10-05. Implemented on development. Frontend files, design and independent
package operation are unchanged. Public release and provider upload follow later.

## Result

Audited manifest: 231 unpublished records — seven board members, 200 gallery
items, three reports, four certificate documents, ten content pages, three
attributed draft report overviews and four private settings. Authoritative board
spellings/order and Sidra's designation/slot distinction are preserved. No
profile-only people, fees, memberships, statistics or outcomes are imported.

The gallery retains 24 hidden duplicates, 17 AI-restoration flags and CSV
treatment/type/dimensions. Four certificates reference five scans. Charity dates
remain historical; unreadable details remain unset. Offline check/plan, local
preparation, database dry run and explicit apply commands use allowlisted files.

Atomic drafts/checkpoints/audit entries support interrupted and concurrent runs.
Reruns preserve edits, unmanaged entries and deletions; source drift/collisions
are reported instead of overwriting. See backend/seed/README.md for usage.

## Evidence

- `npm run check` passed: both typechecks, 22 health/security/source tests,
  manifest validation, build and OpenAPI drift check.
- `npm run test:seed`: eight actual isolated MongoDB 8.0.5 replica-set tests passed
  for read-only dry run, full import, edits/deletions/source drift, interruption
  resume, concurrent import, rollback, native conflicts and deleted-target safety.
- All 16 existing real MongoDB/Redis/BullMQ scenarios passed after model changes.
  Backend production dependency audit: zero findings.
- Built CLI smoke against a disposable replica set: first apply created 231;
  second apply preserved 231; database dry run preserved 231.
- Compared every allowlisted physical input with CRC-checked original ZIP
  entries. Restored one incomplete local extraction from the interrupted earlier
  session before pinning checksums. All 200 gallery images decoded and actual
  dimensions matched the CSV. No source credential entry was read.
- Source plan verified 227 references; local preparation produced 216 candidates
  and reused them safely. Offline import dry run passed.
- CI includes manifest validation and real seed integration. Implementation
  61eb156fd7cc300d078a7659c9d096fa881f9e00 passed: GitHub run
  37380616908 succeeded in both independent jobs, both backend integration suites
  and production dependency audits. Published in the updated M2/M3 PR #2.

## Limits

Full import tests use real audited metadata in a disposable database; they do not
seed organizational Atlas. Source binaries/preparation output remain ignored.
CI needs no source pack or organizational credentials; byte verification ran locally.

No external assets were uploaded or mail sent. Public copies await privacy/release
review and signature/malware checks. The 2024 DOCX has not been converted into an
approved public PDF. Full constitutional OCR, chairman crop and Urdu translations
remain pending with explicit review tasks. Membership remains disabled without
approved policy. Frontend content/forms still use prototype data and simulation;
public APIs, publication, source-driven UI and operational admin modules follow.
