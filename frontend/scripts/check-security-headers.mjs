import assert from 'node:assert/strict';

export async function checkSecurityHeaders(base) {
  const routes = ['/', '/contact', '/file-a-complaint', '/become-a-member', '/gallery/tv-interviews', '/admin/login', '/robots.txt', '/sitemap.xml', '/images/hrpf/home-hero.webp', '/missing-security-fixture'];
  let policy;
  for (const route of routes) {
    const response = await fetch(base + route);
    assert.equal(response.headers.get('x-powered-by'), null, route + ' hides framework header');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff', route);
    assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin', route);
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN', route);
    assert.equal(response.headers.get('permissions-policy'), 'camera=(), microphone=(), geolocation=()', route);
    const csp = response.headers.get('content-security-policy');
    assert.ok(csp, route + ' has enforced CSP');
    policy ??= csp;
    assert.equal(csp, policy, route + ' uses the same policy');
    await response.arrayBuffer();
  }
  const directives = new Map(policy.split(';').map(part => {const [key, ...values] = part.trim().split(/\s+/); return [key, values];}));
  assert.deepEqual(directives.get('default-src'), ["'self'"]);
  assert.deepEqual(directives.get('object-src'), ["'none'"]);
  for (const directive of ['base-uri', 'form-action', 'frame-ancestors']) assert.deepEqual(directives.get(directive), ["'self'"]);
  // Real integration endpoints identified from current frontend/provider code.
  const resources = {
    'script-src': ['https://challenges.cloudflare.com/turnstile/v0/api.js', 'https://cdn.gtranslate.net/widgets/latest/dropdown.js', 'https://cdn.gtranslate.net/widgets/latest/lib.min.js'],
    'connect-src': [base + '/api/forms/session', base + '/api/form-uploads', 'https://translate-pa.googleapis.com/v1/translateHtml'],
    'frame-src': ['https://www.google.com/maps/embed', 'https://www.youtube-nocookie.com/embed/Abcdef123_-', 'https://player.vimeo.com/video/123456', 'https://challenges.cloudflare.com/turnstile/', base + '/api/membership-registration/documents/fixture'],
    'img-src': ['https://i.ytimg.com/vi/Abcdef123_-/hqdefault.jpg', 'https://res.cloudinary.com/fixture/image/upload/fixture.webp', base + '/api/public-assets/fixture'],
    'media-src': [base + '/videos/home-banner/v2/banner.mp4'],
    'font-src': [base + '/_next/static/media/fixture.woff2'],
  };
  for (const [directive, urls] of Object.entries(resources)) {
    const sources = directives.get(directive);
    for (const url of urls) assert.ok(sources.includes(new URL(url).origin === new URL(base).origin ? "'self'" : new URL(url).origin), directive + ' allows ' + url);
    assert.ok(!sources.includes('*') && !sources.includes('https:'), directive + ' does not allow arbitrary HTTPS origins');
  }
  assert.ok(directives.get('script-src').includes("'unsafe-inline'"), 'Static Next flight scripts remain compatible');
  assert.ok(directives.get('style-src').includes("'unsafe-inline'"), 'Existing component/provider styles remain compatible');
  assert.ok(!directives.get('script-src').includes("'unsafe-eval'"), 'Production excludes eval');
  const api = await fetch(base + '/api/projects');
  assert.equal(api.headers.get('content-security-policy'), "default-src 'none'", 'Frontend preserves upstream API CSP');
  assert.equal(api.headers.get('x-frame-options'), 'DENY', 'Frontend preserves upstream API frame policy');
  await api.arrayBuffer();
  console.log('Security header checks passed: pages, metadata routes, images, 404, integration origins and upstream API policy.');
}
