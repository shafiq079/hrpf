import assert from 'node:assert/strict';
import sharp from 'sharp';

function tags(html) {
  return (html.match(/<meta\b[^>]*>/g) ?? []).map(tag =>
    Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value.replaceAll('&amp;', '&')])));
}

// Check raw response HTML: resolving React's streamed slots would hide a
// regression for sharing crawlers that neither execute JS nor inspect the body.
export async function checkSocialPreviews(base) {
  const fallback = 'https://hrpf.org/images/social/v1/hrpf-share.jpg';
  for (const userAgent of ['facebookexternalhit/1.1', 'Twitterbot/1.0', 'WhatsApp/2.0', 'LinkedInBot/1.0']) {
    for (const [path, title] of [['/', 'Human Rights Protection Foundation'], ['/contact', 'Contact'], ['/blogs/real-news', 'Managed news 1'], ['/projects/real-project', 'Managed project 1']]) {
      const response = await fetch(base + path, {headers: {'User-Agent': userAgent}, signal: AbortSignal.timeout(15000)});
      assert.equal(response.status, 200, `${userAgent} ${path}`);
      const html = await response.text();
      assert.ok(html.includes('</head>'), 'Complete HTML head');
      const head = tags(html.split('</head>')[0]);
      const values = name => head.filter(tag => tag.property === name || tag.name === name).map(tag => tag.content);
      for (const name of ['og:title', 'og:description', 'og:url', 'og:type', 'og:image', 'og:image:alt', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
        assert.ok(values(name)[0]?.trim(), `${userAgent} ${path}: ${name} is in the initial head`);
      }
      assert.ok(values('og:title')[0].includes(title), `${path} has its own title`);
      assert.equal(values('og:url')[0], 'https://hrpf.org' + (path === '/' ? '' : path));
      assert.equal(values('og:site_name')[0], 'Human Rights Protection Foundation');
      assert.equal(values('twitter:card')[0], 'summary_large_image');
      assert.ok(values('og:image').includes(fallback), `${path} includes the static JPEG backup`);
      assert.deepEqual(values('og:image:secure_url'), values('og:image'), 'HTTPS image URLs match their image descriptors');
      if (path === '/blogs/real-news') {
        assert.equal(values('og:image')[0], 'https://hrpf.org/images/hrpf/home-report-2023.webp', 'Published page cover remains preferred');
        assert.equal(values('og:type')[0], 'article');
      } else {
        assert.deepEqual(values('og:image'), [fallback], 'No duplicate fallback image');
        assert.equal(values('og:image:type')[0], 'image/jpeg');
        assert.equal(values('og:image:width')[0], '1280');
        assert.equal(values('og:image:height')[0], '720');
      }
    }
    const image = await fetch(base + new URL(fallback).pathname, {headers: {'User-Agent': userAgent}, redirect: 'manual'});
    assert.equal(image.status, 200, 'Preview image requires no redirect or authentication');
    assert.match(image.headers.get('content-type') ?? '', /^image\/jpeg/);
    assert.match(image.headers.get('cache-control') ?? '', /public.*immutable/);
    const bytes = Buffer.from(await image.arrayBuffer());
    assert.ok(bytes.length < 1024 * 1024, 'Small preview image');
    const decoded = await sharp(bytes).metadata();
    assert.equal(decoded.format, 'jpeg');
    assert.equal(decoded.width, 1280);
    assert.equal(decoded.height, 720);
  }
  console.log('Social preview checks passed: raw crawler head metadata, page-specific covers, JPEG backup and public image decoding.');
}
