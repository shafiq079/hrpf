# Owner-approved portrait placeholders — 10 October 2026

Dr. Sidra Mubashir and Dr. Iqra Mubashar now use the supplied neutral silhouette,
replacing the earlier blurred photographs. The shared PersonPortrait component
uses the bundled public placeholder for these two slugs, including Board cards,
full profiles and admin previews, and resets their photo zoom to 1.

The backend also replaces both exact supplied source-image hashes with this
placeholder after normal publication/asset authorization. Original and bounded
thumbnail URLs return bundled WebP bytes without requesting the original provider
photo. This protects copies of those exact images used under different names.
Missing replacement files fail closed. Other source images keep normal delivery;
private source/archive access is unchanged.

Placeholder bytes have their own versioned ETag. Authorization and withdrawal
checks still precede conditional responses and HEAD/body delivery. The three
thumbnail widths use matching placeholder derivatives. Old public blurred files
were removed. No database migration or manual admin upload is required. Restart
the backend after pulling; refresh the Board and both full profile pages.

The public organizational PDF also replaces both named portraits on page 12 and
the female portrait in the closing collage on page 43. Native PDF redaction
removes underlying image pixels before inserting the placeholder; an overlay
alone would retain the original. See ORGANIZATION_PROFILE.md for reproduction.
