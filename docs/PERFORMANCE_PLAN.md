# Public website performance requirement

Owner requirement recorded on 2026-10-07. This is planned work, not an
implemented cache. Website speed is a product requirement alongside correctness.

Caching and image delivery must be reusable features of the application. They
must apply automatically to current and future managed content, including uploads
made months or years later. No cache may depend on the current seed IDs, filenames,
200-entry manifest, sample titles or a manually maintained list of images.

MongoDB remains the authoritative content store. Publishing a new item through
the admin portal must make it available through the same cached public pipeline;
normal future uploads must not require reseeding, code edits or a rebuild.

## Next task on development

Implement reusable public content caching and image delivery, using Gallery as
the first complete verification flow, with shared components suitable for the
public projects and blogs. Keep the following responsibilities separate:

- Redis: bounded caching of projected public JSON lists, counts and pagination,
  keyed by collection, category, locale, page, page size, search and content revision.
  Start with a configurable five-minute expiry, not a hardcoded content snapshot.
- Browser: conditional image caching using validators so unchanged image bytes
  are reused after the server confirms that the asset is still publicly released.
- Image delivery: bounded thumbnail variants for cards; retain the supplied
  large version for the full-size viewer. Preserve newspaper legibility and
  AI-restoration disclosure, and keep provider credentials server-side.
- Navigation: avoid unnecessarily clearing the current grid while loading;
  prepare adjacent pages when appropriate without downloading the whole archive.

Invalidate every affected cache variant after admin create, edit, publish,
withdraw or delete, and after source imports. Use an authoritative content
revision/invalidation design that accounts for concurrent writes, cache failures
and scheduled publication boundaries. Publication/asset checks must precede a
cached-image validation response; withdrawn files must not regain public access.
Admin, authentication, submissions and restricted files retain their existing
private/no-store policies. Image binaries do not belong in the Redis JSON cache.

## Acceptance checks

Measure repeated navigation (page 1 -> 2 -> 3 -> 1), transferred image bytes,
Cloudinary reads, Mongo queries and cache hits before and after implementation.
Use provider instrumentation and browser network evidence where available;
do not claim an unmeasured percentage improvement.

Add a new unseeded image through the normal admin workflow after the cache is
already warm. Verify that it benefits automatically, appears after publication,
and updates after caption edits, image replacement, withdrawal and deletion.
Check both collections, pagination counts, search, locales, concurrent changes
and failed invalidation/cache reads. No future content-specific configuration
should be necessary.
