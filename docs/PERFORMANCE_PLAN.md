# Public content caching and image delivery

Implemented on development on 2026-10-08 following the owner's repeat-gallery-navigation report. The shared pipeline applies to all current and future managed content; it contains no seed IDs or archive-specific filenames.

## Public JSON

Projected settings, board/team, categories, blogs, projects, gallery, interviews and document lists/details use bounded Redis read-through caching. Keys include a schema version, authoritative Mongo content revision, endpoint and normalized validated query (locale, page, limit, category, search and focus area). Default lifetime is five minutes; configure PUBLIC_CACHE_TTL_SECONDS between 1 and 3600. Cache storage is limited to 256 entries of at most 256 KiB each. Same-process simultaneous fills are coalesced; Redis failures fall back to Mongo.

Every current admin content transaction, publication/withdrawal and source import increments public:content-revision in Counter within the same Mongo transaction. Failed writes roll back their revision. Old keys expire or are evicted, and cannot be reused after a committed update. A revision check after loading protects against a concurrent write during cache fill. Scheduled publication clips cache validity at the earliest future publishedAt boundary, so it becomes visible without an editor write.

Mongo remains authoritative. Browser JSON keeps no-store so navigation checks the current revision. X-HRPF-Public-Cache reports HIT, MISS or BYPASS. No auth, submission, complaint identity, restricted attachment or image bytes enter this public JSON cache. External database maintenance must increment the same revision within its write transaction; direct manual Mongo updates outside this contract may leave list metadata stale until expiry. All normal existing editors and importers follow the contract automatically.

## Image delivery

AppImage requests signed server-to-server Cloudinary WebP card variants at 480, 960 or 1440 pixels, quality 82 and c_limit (no upscaling). Variant URLs depend on the asset ID and width, so they remain stable on repeat visits. The provider version is retained. Only these three widths are accepted; PDFs and raw files cannot request image variants. Provider credentials and signed URLs stay on the backend.

The Gallery zoom viewer explicitly requests original bytes. Public raster images use private, no-cache, must-revalidate with a variant-specific weak ETag. A repeat browser request can receive 304 with no image body or provider read, after the backend rechecks the current released file and its owning published entity. A withdrawn, replaced, restricted or deleted asset returns 404 even when the browser sends a previously valid ETag. Documents, admin previews and private evidence keep no-store. Existing copies already downloaded cannot be erased from a visitor's device.

Pagination retains Next client transitions, shows an accessible inline pending message and preserves scroll. It does not prefetch the archive or reuse long-lived public page snapshots. Automatic translated-document navigation continues to use its existing safe full-document path; image validation still works independently. Public metadata can be requested again on each visit, but its costly list query and unchanged image body are reused where valid.

## Verification

Frontend lint, typecheck and production build passed. Seven existing client tests and public SSR/navigation checks passed, including responsive managed thumbnail srcsets. Backend typecheck/build, OpenAPI consistency and 27 unit tests passed. The real isolated Mongo/Redis suite passed all 52 integration tests. All 53 source-import tests passed in an isolated candidate copy, preserving the owner’s unrelated local archive-image edit.

Instrumented gallery evidence: page 1 -> 2 -> 3 -> 4 -> 1 executes four gallery list aggregations. A repeated thumbnail returns 304 with zero image bytes and zero additional synthetic-provider reads. These are server integration measurements, not a claimed live browser speed percentage. Tests add new unseeded images through normal authenticated upload/create/publish after warming the cache, and verify both collections, locale/search/counts, caption edits, replacement, withdrawal, deletion, failed Redis reads/writes, bounded entries, coalescing, concurrent fills, rollback and scheduled release.

Live Cloudinary derivative size/quality and browser disk-cache/timing measurements remain deployment checks. Restart/redeploy the backend and rebuild/restart the frontend to use the new variants. A Render free cold start remains independent of this cache. No reseeding or new service is required.
