import assert from 'node:assert/strict';

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value.replaceAll('&amp;', '&')]));
}
function meta(html, name) {
  const tag = (html.match(/<meta\b[^>]*>/g) ?? []).map(attributes).find(tag => tag.name === name || tag.property === name);
  return tag?.content;
}

export async function checkAuditAccessibility(read, base) {
  for (const [path, image] of [
    ['/', '/images/hrpf/home-hero.webp'],
    ['/contact', '/images/hrpf/home-hero.webp'],
    ['/projects/real-project', '/images/hrpf/home-hero.webp'],
    ['/blogs/real-news', '/images/hrpf/home-report-2023.webp'],
    ['/about/people/active-director', '/images/hrpf/home-chairman.webp'],
  ]) {
    const {html, status} = await read(path);
    assert.equal(status, 200, path);
    const canonical = (html.match(/<link\b[^>]*>/g) ?? []).map(attributes).find(tag => tag.rel === 'canonical')?.href;
    assert.equal(canonical, 'https://hrpf.org' + (path === '/' ? '' : path), path + ' canonical');
    assert.equal(meta(html, 'og:url'), canonical, path + ' social URL');
    for (const name of ['og:title', 'og:description', 'twitter:title', 'twitter:description', 'og:image:alt', 'twitter:image:alt']) assert.ok(meta(html, name)?.trim(), path + ': ' + name);
    for (const name of ['og:image', 'twitter:image']) assert.equal(meta(html, name), 'https://hrpf.org' + image, path + ': ' + name);
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image', path);
    assert.ok(!(html.match(/<link\b[^>]*>/g) ?? []).some(tag => /hrefLang=/i.test(tag)), 'No invented native language alternates');
  }
  const image = await fetch(base + '/images/hrpf/home-hero.webp');
  assert.equal(image.status, 200);assert.match(image.headers.get('content-type'), /image\/webp/);await image.arrayBuffer();
  const robots = await (await fetch(base + '/robots.txt')).text();
  for (const value of ['Disallow: /admin', 'Disallow: /newsletter', 'Host: https://hrpf.org', 'Sitemap: https://hrpf.org/sitemap.xml']) assert.ok(robots.includes(value), value);
  const sitemap = await (await fetch(base + '/sitemap.xml')).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  assert.equal(new Set(urls).size, urls.length, 'No duplicate sitemap entries');
  assert.ok(urls.includes('https://hrpf.org/blogs/second-page-blog'), 'Sitemap reads later collection pages');
  assert.ok(urls.every(url => new URL(url).origin === 'https://hrpf.org' && !new URL(url).search), 'Canonical sitemap origin and no query variants');
  assert.ok(urls.every(url => !/\/(admin|newsletter|search|programmes)(?:\/|$)/.test(new URL(url).pathname)), 'Only intended public sitemap routes');
  for (const path of ['/contact-us', '/contact-us/']) {
    let response = await fetch(base + path, {redirect: 'manual'});
    assert.equal(response.status, 308, path);
    // Next normalizes a trailing slash before applying the legacy redirect.
    const location = new URL(response.headers.get('location'), base);
    if (location.pathname === '/contact-us') {
      await response.arrayBuffer();
      response = await fetch(location, {redirect: 'manual'});
      assert.equal(response.status, 308, path + ' normalized redirect');
    }
    assert.equal(new URL(response.headers.get('location'), base).pathname, '/contact');
    await response.arrayBuffer();
  }
  const expectedAlts = new Map([
    ['/', ['HRPF representatives in a meeting at an office table.']],
    ['/projects', ['Verified project cover fixture']],
    ['/projects/real-project', ['Community session']],
    ['/blogs/real-news', ['Reviewed blog cover']],
    ['/gallery/media-coverage', ['Reviewed coverage image']],
    ['/gallery/tv-interviews', ['Published TV interview']],
    ['/about/people/active-director', ['Reviewed director portrait']],
    ['/about/our-team', ['Synthetic operational member']],
  ]);
  for (const [path, expected] of expectedAlts) {
    const {html} = await read(path);
    const root = attributes(html.match(/<html\b[^>]*>/)[0]);
    assert.equal(root.lang, 'en', path + ' source language');assert.equal(root.dir, 'ltr', path + ' source direction');
    const images = (html.match(/<img\b[^>]*>/g) ?? []).map(attributes);
    assert.ok(images.length && images.every(img => Object.hasOwn(img, 'alt')), path + ' has no missing alt attributes');
    for (const alt of expected) assert.ok(images.some(img => img.alt === alt), path + ' retains meaningful alt: ' + alt);
    // Existing decorative hero/flag images deliberately stay silent.
    assert.ok(images.some(img => img.alt === ''), path + ' retains decorative empty alt');
    assert.ok(/<div\b[^>]*lang="en"[^>]*translate="no"[^>]*><section\b[^>]*data-react-aria-top-layer="true"/.test(html), 'Untranslated toast announcement region has an English language override');
  }
  console.log('M0–M2/M4 checks passed: canonical/social tags, share asset, robots, paginated sitemap, legacy redirects, image alternatives and source language.');
}
