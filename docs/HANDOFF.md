# HRPF handoff

2026-10-05: M1 and M2/M3 are merged into main (PR #1 and PR #2).
M4 public content APIs, audited publication controls and source-driven frontend
pages are implemented on development. Packages remain independent and the
prototype's visual components/theme are retained. See M4_VERIFICATION.md for
checks and the browser verification limitation.

Start with the Project Files brief, PROJECT_CONTEXT.md, PROGRESS.md,
DECISIONS.md, M2_VERIFICATION.md, M3_VERIFICATION.md and M4_VERIFICATION.md. Backend README/OpenAPI describe exact setup
and implemented routes. Do not read source credential documents or request secrets.

M2 implementation commit is 160c81561080d1cac235701cc0229dcf16aa7e14;
GitHub CI run 37343608697 passed both jobs, including real integration checks.
PR: https://github.com/shafiq079/hrpf/pull/2. M3 adds 231 draft metadata records,
checksummed source verification and repeatable imports/local asset preparation.
See backend/seed/README.md for commands. M3 implementation is published at
61eb156fd7cc300d078a7659c9d096fa881f9e00. GitHub CI run 37380616908 passed
both jobs, including all backend/source tests, both integration suites and
production dependency audits. Subsequent handoff edits are documentation only.
Fixed NGO copy uses the owner-supplied page text, profile and current public details bundled in the frontend. Home, ten About sections, What We Do, contact, social links and donation details require no database seed, admin approval or publishing step. The fixed-page API and admin publishing kind were removed; legacy ContentPage seed rows remain source inventory without destructive database cleanup.

Admin scope remains users, members, membership applications, complaints, board, blogs, gallery, reports, certificates, settings, contact inbox and audit logs. Fixed-page CMS/review is excluded. Blog/gallery/document/board data remain managed records. File protection and membership/complaint operational approvals remain separate from fixed text.

Next: admin interfaces for the listed managed entities and real form wiring. Membership currently uses the supplied Google Form; no live provider writes were made.

M4 PR: https://github.com/shafiq079/hrpf/pull/3. Initial implementation
fa56aceb455e23a11685538650475e54dc7828b0 passed GitHub CI run 37385928032
(both jobs). Final implementation 6b994a33468525286dbf50a6e335761f77f88d7e includes release
hardening and card reuse; GitHub CI run 37386325272 passed both jobs. The fixed-copy correction supersedes the earlier fixed-page publication design. Main is unchanged by M4.
