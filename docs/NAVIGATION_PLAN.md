# Header and route migration

Source: owner-uploaded `09-Changes-Required-and-new-updates-that-we-need-to-implement.txt`, specifically “Heading Section required changes”, the About Us list and the membership instructions. This work implements navigation and its destinations. The complaint-field/notification changes and multilingual translation in the same file remain separate work.

## Implementation plan

1. Extract the requested labels, removals and dropdown hierarchy. Resolve the two naming conflicts without inventing organisation facts.
2. Update the shared navigation used by desktop/mobile menus and footer. Keep the existing brand, colours and layout components.
3. Move the public news listing/detail URLs to Blogs. Use existing published BlogPost records, add canonical admin Blogs APIs, and retain compatible News API paths.
4. Add real destinations for every new submenu, using supplied fixed About text and existing released public content APIs. Replace the volunteer application entry with the supplied Google membership form.
5. Redirect retired URLs permanently, preserving article slugs and query strings. Update links, search entries, breadcrumbs and canonical metadata to new destinations.
6. Verify production rendering, every header destination, redirects, pagination, publication/role/version controls and empty/unavailable states. Push to development and update PR #3; do not merge main.

All six steps are implemented. Validation commands and boundaries are below.

## Final header

| Item | Route | Children |
|---|---|---|
| Our Work | `/our-work` | Existing six focus areas, unchanged |
| Projects | `/projects` | None |
| Blogs | `/blogs` | Article pages at `/blogs/[slug]` |
| Gallery | `/gallery` | Media Coverage, TV Interviews |
| Get Involved | `/get-involved` | Become a Member, Campaigns, Careers |
| About Us | `/about` | Eight destinations below |
| File a Complaint | `/file-a-complaint` | Existing concern form, renamed route/action |
| Donate | `/donate` | Existing action |

| About Us child | Route |
|---|---|
| Who We Are | `/about/who-we-are` |
| Mission and Vision | `/about/mission-and-vision` |
| Aims and Objectives | `/about/aims-and-objectives` |
| Message of CEO | `/about/message-of-ceo` |
| Board of Directors | `/about/board-of-directors` |
| Our Team | `/about/our-team` |
| Registration and Certificates | `/about/registration-and-certificates` |
| Progress Reports | `/about/progress-reports` |

Gallery children are `/gallery/media-coverage` and `/gallery/tv-interviews`. Membership is `/become-a-member`; its application link is the exact Google Form supplied in the changes file. Campaigns and Careers retain their existing routes/content. Internship is removed from navigation; career-page content is outside this pass.

Impact, top-level Reports, Our People, Governance, Volunteer and Internships are removed from navigation. Impact's existing page remains reachable by its URL because the source asks to remove the header item, not delete that page. The existing About overview and its `#our-people` anchor are retained for compatibility; it is not a menu label. Its leadership/team/report links now use the requested canonical destinations.

## Interpretations and destination content

- The heading instructions rename the old team item to Board of Directors, but the later About list separately requests Our Team. Both are included: old `/team` redirects to Board of Directors; Our Team is a new separate destination. No unverified staff roster is manufactured.
- The requested menu label is Message of CEO, but the supplied leadership message is explicitly signed by Muhammad Yousaf Badar, Chairman. The page retains “Chairman’s Message” and the original attribution. No person is relabelled CEO.
- Fixed About text is a whitelisted extraction from the audited supplied-page inventory in `backend/seed/source-manifest.json`, bundled in `frontend/data/about-source.json`. It needs no database seed or fixed-page approval workflow.
- Board uses `/api/board` and shows only active public profiles. Progress Reports, Certificates and Media Coverage use their existing reviewed/released public APIs. Draft inventories and protected original files are not used as fallbacks. Empty and unavailable states are explicit.
- TV Interviews has its own route and links to the source-supplied official YouTube channel. The current backend has no interview-video model/admin workflow, so the page does not invent recordings or relabel images as videos. Video management is subsequent work.
- The existing About and Get Involved overview content/layouts are not otherwise redesigned in this navigation pass. The existing concern form is moved to File a Complaint without claiming that this pass adds CNIC fields, notifications or live form wiring. Internal HRPF feedback at `/complaints` remains a distinct existing page.
- The Get Involved overview keeps its existing section layout. Its application section links to Become a Member instead of rendering a volunteer application. The supplied Google Form opens only when the visitor chooses it; no application is submitted by this work.
- The homepage retains the owner's previously required “Featured Projects” and “Latest News & Updates” headings. Its articles now fetch `/api/blogs` and link directly to canonical Blogs detail pages.

## Compatibility and API names

| Old public URL | Permanent 308 destination |
|---|---|
| `/news` and `/news/[slug]` | `/blogs` and `/blogs/[slug]` |
| `/updates` and `/updates/[slug]` | `/blogs` and `/blogs/[slug]` |
| `/reports` | `/about/progress-reports` |
| `/team` | `/about/board-of-directors` |
| `/media` | `/gallery` |
| `/governance` | `/about` |
| `/report-a-violation` | `/file-a-complaint` |

Redirects run before filesystem routes and preserve query strings. Internal links use canonical destinations directly. Unknown/unpublished article slugs remain 404. Old prototype article pages are removed; they are not treated as published organisation records.

The canonical APIs are GET `/api/blogs`, GET `/api/blogs/:slug`, GET/POST `/api/admin/blogs`, and PATCH/DELETE `/api/admin/blogs/:id`. Legacy `/api/news` and `/api/admin/news` paths remain compatible and use the same BlogPost records and versions. Publication remains `/api/admin/publication/blog/:id`. Canonical admin mutations are audited as `blogs.post`, `blogs.patch` and `blogs.delete`; legacy action names stay compatible. No collection migration or reseed is required for the rename.

Search now indexes canonical navigation plus the latest 48 published projects, blogs and reports, replacing the old sample project/news/report index. Existing campaign/event entries are retained. Blogs, reports, certificates and gallery collections have bounded server pagination; the blog search/filter controls apply to the current page.

## Validation

- Frontend `npm run check`: ESLint, Next route type generation/TypeScript and production build.
- Frontend `npm run test:home`: retained homepage/rich-project checks plus all header destinations, canonical Blog articles, 308 redirects with query preservation, page two/invalid-page handling, public document/media/board rendering, membership link and empty/offline states. Public reads do not forward cookies.
- Backend `npm run check`: both typechecks, unit/source checks, offline seed plans, build and generated OpenAPI consistency.
- Backend `npm run test:integration`: real disposable MongoDB/Redis integration, including canonical blog CRUD and legacy alias visibility, authentication, role, CSRF, optimistic version, publication and audit checks.
- React/accessibility review: menus share one configuration; desktop dropdown placement stays within the header; mobile keyboard focus is contained/restored and submenu controls reference their lists. Existing brand components and API image delivery are retained.

Visual browser interaction remains unverified: the cloud browser previously rejected localhost access with `ERR_BLOCKED_BY_CLIENT`. Production HTTP/SSR checks run against a built Next server with synthetic public API fixtures. No live NGO database, external storage, email or Google Form submission is changed here. Pull development and restart Next in Codespaces because redirect configuration is loaded when the server starts.
