# HRPF Decisions

## 2026-10-05
- Approved the implementation plan; implementation proceeds one verified milestone at a time.
- Preserve the prototype design because it is the owner's required baseline.
- Keep npm and the existing lockfile; retain the installed framework versions during initial scaffolding.
- Use frontend/app/, frontend/components/, frontend/data/, frontend/lib/ and frontend/public/ after M1; avoid an unnecessary src/ migration.
- Reuse existing cards, form fields and navigation components; extend their data contracts rather than replacing their styling.
- Progress Reports belongs under About, following the client instructions.
- Gallery uses Media Coverage and HRPF in Action, following the higher-priority brief.
- Use only the seven authoritative board members. Our Team can reuse documented office-bearers until a separate roster is provided.
- Include the client's CNIC and previous-proceedings complaint fields; protect identity documents as sensitive assets.
- Reuse the external-concern form as the complaint starting point. The existing ComplaintForm is feedback about HRPF and has a different purpose.
- Remove unsupported statistics, testimonial claims and partner identities from public content; reuse useful layouts for verified content where appropriate.
- Do not introduce a newsletter backend. Replace the fake newsletter area with sourced contact/action content while retaining the footer grid.
- Consolidate unsourced campaigns, events and projects into approved work, gallery or blog content. Do not publish fictional individual records.
- Existing policy/accessibility layouts may be reused, but their prototype policies are not organizational facts.
- Authenticated uploads plus Express authorization on every sensitive file request are the default; ordinary Cloudinary signatures are not treated as expiring access controls.
- Use a transactional MongoDB email outbox with Redis/BullMQ retries to avoid losing saved submissions when email is unavailable.
- Native paid membership submissions remain disabled until fee and validity policies are configured.
- M0 was source audit plus documentation only. The owner explicitly requested M1 continuation before returning Codespaces results; proceed with scaffolding and keep integration/visual acceptance pending.
- Reuse draft PR #1 from development to main for M0/M1 while it remains open; do not merge until CI and Codespaces acceptance pass.
- M1 keeps all 182 app/component/data/lib/public files byte-identical; only frontend configuration and command scripts change.
- Use Node 24 for Codespaces/CI and separate npm lockfiles to preserve the prototype dependency graph.
- Use Next beforeFiles rewrites and an exact Codespace allowedDevOrigins entry, following the installed Next 16.2.11 guides.
- Liveness checks the process; readiness pings MongoDB and Redis. Missing dependencies return 503 rather than implying connectivity.
- Keep configuration error messages limited to variable names; redact driver errors and unexpected startup failures.
- Forward only port 3000 automatically; keep Express and Redis internal. Atlas credentials stay in backend/.env or Codespaces secrets.
- Defer business models/auth/uploads/queue and Redis-backed client limits to M2; M1 is infrastructure, not a production release.
