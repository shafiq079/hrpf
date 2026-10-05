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
- M0 is source audit plus documentation only. Build and visual checks must be reported from Codespaces before M1 application changes.
- A documentation-only PR targets main from development; leave it unmerged until M0 verification is recorded.
