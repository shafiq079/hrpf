# Approved portrait face blur — 9 October 2026

The owner requested blurred faces for Dr. Sidra Mubashir and Dr. Iqra Mubashar.
The supplied Board of Directors portraits match the two attached images. The
built-in image-editing tool made two public derivatives using this prompt:
strong Gaussian blur over the complete face, hairline to chin and cheek to cheek;
keep clothing, scarf, hair outside the face, jewelry, blue background and framing;
no recognizable eyes/nose/mouth, no new person, text or watermark. Both outputs
were visually reviewed. Standard quality-82 WebP export and 480/960/1440-width
derivatives keep delivery small. All use the already-blurred image tool output;
no original pixels are used for a public derivative.

Bundled public copies are `backend/assets/portraits/dr-sidra-mubashir-blurred.webp`
and `backend/assets/portraits/dr-iqra-mubashar-blurred.webp`.

The existing public image stream maps the two known original SHA-256 hashes to
these copies, after normal asset/current publication authorization. This covers
Board, Team, full profile pages and directly opened original/thumbnail URLs,
including copies bound elsewhere to the exact same source bytes. The original
provider image is never requested on this public path. Private administration and
source archive access remain unchanged. Missing redacted files fail closed.

Redacted bytes have their own ETag; old original-image validators force a fresh
blurred response. Withdrawal/deletion/replacement restrictions still run before
304/HEAD/body delivery. Thumbnail URLs serve width-specific redacted WebP copies; no
unblurred provider thumbnail is generated. Other photos keep normal delivery.
No database migration, seed import or manual admin upload is needed for the two
existing source portraits. If an administrator changes a portrait later, upload
an appropriately blurred replacement: source-hash rules deliberately do not
silently replace a different future photo with an outdated portrait.

After pulling development, restart the backend and refresh Board, Our Team and
both full profiles. The images, names, biographies and image framing remain in
the existing layouts. Check a directly opened image and a thumbnail URL as well.

Verification: visual face-coverage review, optimized WebP/thumbnail export, backend
unit/types/build/OpenAPI checks and Mongo/Redis integration covering both public
replacement bodies, stale ETags, conditional reuse, HEAD, all three thumbnail
widths, withdrawn access and ordinary future-photo delivery.
