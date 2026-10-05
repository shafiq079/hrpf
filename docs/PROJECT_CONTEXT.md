# HRPF Project Context

Updated: 2026-10-05

## Authority and workflow
- Read HRPF_Project_Brief.md from Project Files first in every new chat.
- Source priority: brief and owner messages; individual sources; PROFILE HRPF.docx as fallback only.
- Implementation plan approved on 2026-10-05.
- Owner runs code in GitHub Codespaces and reports verification results.
- Work on development; main is stable. Deliver one verified milestone per message.
- Never request, print or commit credentials.

## Repository and audit baseline
- Repository: https://github.com/shafiq079/hrpf
- Prototype baseline: d3848c940d8bf260c7b2657a66473df991777296.
- Next.js 16.2.11 App Router, React/React DOM 19.2.4, Tailwind 4, TypeScript, npm/package-lock.json.
- Current application is at the repository root: app/, components/, data/, lib/, public/.
- 31 page files, including five dynamic page files; 13 local data modules.
- No Express backend, app API routes, admin panel, CI workflows or test files in the baseline tree.
- Source audit completed. Build, lint, typecheck and visual baseline are awaiting Codespaces results.
- See docs/FRONTEND_AUDIT.md for evidence and migration decisions.

## Preserve the prototype
- Keep blue/navy/gold palette, Inter/Lora fonts, square corners, spacing, cards and animation style.
- Reuse Header, MobileNavigation, Footer, PageHero, Container, PrimaryButton, AppImage, Accordion and existing cards/forms.
- In M1 move existing application folders into frontend/ without introducing src/ or redesigning components.
- Keep the existing alias convention @/* relative to the frontend root.
- Root AGENTS.md requires reading the installed Next.js guides before authoring Next.js changes.

## Target architecture
- frontend/: existing Next.js application and later public/admin routes.
- backend/: Express API, MongoDB models, upload services, email worker and seed scripts.
- MongoDB Atlas is authoritative; separate hrpf_dev and hrpf_prod databases.
- Cloudinary stores public assets and authenticated sensitive assets under separate environment namespaces.
- Redis supports public cache, rate limiting, form tickets and BullMQ jobs.
- Browser calls /api/* on the Next.js origin; rewrites proxy to Express on port 5000.
- Frontend port 3000; backend port 5000; Redis is not publicly forwarded.
- JWT access/rotating refresh cookies are httpOnly; backend roles and CSRF checks enforce authorization.
- MongoDB email outbox makes submissions durable independently of email delivery.

## Planned public routes and endpoints
- Navigation: Home, About, What We Do, Gallery, Blogs, Get Involved, Contact.
- Progress Reports is under About. Gallery categories: media-coverage and in-action.
- English default; Urdu public routes under /ur/ after translation review.
- Main reads: /api/settings/public, /api/content/:key, /api/board, /api/blogs, /api/gallery, /api/reports, /api/certificates.
- Report download: GET /api/reports/:id/download.
- Main submissions: POST /api/complaints, /api/membership-applications and /api/contact-messages.
- Form tickets/uploads: /api/forms/session and /api/form-uploads.
- Auth: /api/auth/*; private operational endpoints: /api/admin/*.
- None of these planned backend endpoints is implemented yet.

## Planned collections
- User, Member, MembershipApplication, BoardMember, Complaint.
- BlogPost, BlogCategory, GalleryItem, Report, Certificate.
- ContactMessage, Setting, AuditLog.
- Supporting: ContentPage, Asset, AuthSession, Counter, EmailOutbox.
- Sensitive attachments require backend authorization on each delivery request.
- Status changes and membership approval require concurrency controls.

## Source and import decisions
- Board: seven people from Board of Directors.docx, ordered by the brief.
- Dr. Sidra Mubashir: designation Joint Chairperson; slotLabel Vice Chairman; rank 3.
- Gallery: 200 manifest records; 24 hidden duplicates; 176 unique candidates before privacy review.
- Preserve AI_RESTORATION metadata on 17 in-action records.
- Three progress reports; convert 2024 DOCX to PDF and review public copies.
- Five certificate scans represent four distinct documents; show historical validity dates.
- Seed scripts: dry-run, stable keys, checksums, resume and preservation of admin edits.
- No invented members, statistics, partnerships, fees, certificate validity or legal outcomes.
- Native paid membership submission remains disabled until policy is configured.

## Continuity
- PROJECT_CONTEXT.md: architecture and authoritative current state.
- DECISIONS.md: dated decisions and reasons.
- PROGRESS.md: completed work, current work, next action and blockers.
- Every working session ends with a HANDOFF and complete changed docs text.
