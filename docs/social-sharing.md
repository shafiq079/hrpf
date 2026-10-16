# Social link previews

Public pages send Open Graph and Twitter Card metadata in server-rendered HTML.
Next.js handles HTML-only sharing crawlers using its default bot detection; do
not disable streaming for every visitor to address a crawler-specific problem.

The default image is `/images/social/v1/hrpf-share.jpg`: a 1280 × 720 JPEG of
the existing published homepage photograph. It is static, public, under 120 KB,
and does not require Render, Cloudinary, authentication, or the image optimizer.
It is re-encoded from `public/images/hrpf/home-hero.webp` using Sharp with
`jpeg({quality:85, mozjpeg:true})`, preserving the full photograph. Use a new
versioned path when replacing it because it has immutable caching.

Blogs, projects and people retain their published cover as the first Open Graph
image. A static JPEG is listed second as an alternative for consumers that
cannot fetch or decode that cover. Platforms decide which image they use;
listing a backup does not guarantee that every platform will retry it.

## Refresh an existing Facebook preview

After production deployment, enter the exact shared URL in
[Meta's Sharing Debugger](https://developers.facebook.com/tools/debug/), then
use **Scrape Again**. Check its HTTP response, title, description and image.
Repeat for individual blog/project links if their old previews remain cached.
Then paste the URL into a new post draft. Do not add fake Facebook app IDs or
change canonical URLs just to bypass the cache.

If the debugger reports a blocked crawler, inspect the Vercel firewall/bot
logs for that request. A successful request with a spoofed User-Agent confirms
the site's response format, but does not prove Meta's real IPs are allowed.
Do not turn off security protections globally to make a preview work.

## Platform limits

The website supplies metadata; each platform controls whether a particular
post, comment, caption, bio, or message displays a card. Metadata cannot force
WhatsApp-style cards into every Instagram, TikTok, Facebook or X placement.
Do not promise a preview in every comment section or an update to every old post.

## Verification

Run `npm run check` and `npm run test:home` from `frontend`. The production-server
tests inspect the raw HTML head as Facebook, X, WhatsApp and LinkedIn crawlers,
including dynamic blog/project metadata, and decode the public JPEG to verify
that its actual format and dimensions match its tags.

References: [Meta sharing guide](https://developers.facebook.com/documentation/sharing/webmasters),
[Meta image recommendations](https://developers.facebook.com/documentation/sharing/webmasters/images),
[Open Graph protocol](https://ogp.me/),
[Next.js streaming metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#streaming-metadata).
