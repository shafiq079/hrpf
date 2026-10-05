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
Next: admin interface/content editing and real frontend form wiring, followed by
operational review/approval workflows. Public pages use approved published API
content; source imports still produce unpublished/private drafts. Missing content
shows pending publication; backend failures show unavailable. Legacy fake forms
are no longer exposed. Membership uses the supplied Google Form until policy is
confirmed. Public source documents/photos are not automatically released; review,
redaction, upload and publication remain explicit operator steps. No organization
credentials/data/provider configuration were changed.

M4 PR: https://github.com/shafiq079/hrpf/pull/3. Initial implementation
fa56aceb455e23a11685538650475e54dc7828b0 passed GitHub CI run 37385928032
(both jobs). Follow-up release hardening/card reuse is tested and published in
the same PR; check its current head before continuing. Main is unchanged by M4.
