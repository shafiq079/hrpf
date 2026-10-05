// Independent SSR verification against a disposable API fixture. Never uses organization credentials.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
let revision = 1, hidden = false;
const content = { title: 'Synthetic reviewed mission', key: 'mission', locale: 'en', blocks: [{ type: 'paragraph', text: 'Synthetic public content' }] };
const settings = { contact: { address: 'Synthetic office', postalCode: '50490', phone: '+923001234567', landline: '+92546123456', emails: ['test@example.org'] }, donations: { accountTitle: 'Synthetic account', bank: 'Synthetic bank', branch: 'Synthetic branch', accountNumber: '1234', iban: 'TEST-IBAN', jazzCash: '03000000000' } };
const requests = [];
const api = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost'); requests.push({ path: url.pathname, cookie: req.headers.cookie });
  res.setHeader('Content-Type', 'application/json');
  let data, meta;
  if (url.pathname === '/api/settings/public') data = settings;
  else if (url.pathname.startsWith('/api/content/')) { if (hidden) { res.statusCode = 404; res.end(JSON.stringify({ error: { code: 'NOT_FOUND' } })); return; } data = { ...content, title: `Synthetic reviewed mission ${revision}`, key: url.pathname.split('/').at(-1) }; }
  else if (url.pathname === '/api/board') data = [{ name: 'Synthetic board member', slug: 'test-board', designation: 'Test chair', rank: 1, bio: 'Synthetic biography', photo: null }];
  else if (url.pathname === '/api/blogs') { data = url.searchParams.get('q') ? [] : [{ title: 'Synthetic article', slug: 'synthetic-article', excerpt: 'Synthetic excerpt', publishedAt: '2026-01-01T00:00:00.000Z' }]; meta = { page: 1, limit: 12, total: data.length, pages: data.length }; }
  else if (url.pathname === '/api/blogs/synthetic-article') data = { title: `Synthetic article ${revision}`, blocks: content.blocks, excerpt: 'Synthetic excerpt', slug: 'synthetic-article', publishedAt: '2026-01-01T00:00:00.000Z' };
  else if (url.pathname === '/api/gallery') { data = [{ id: 'test-image', title: url.searchParams.get('category') === 'media-coverage' ? 'Synthetic media image' : 'Synthetic action image', alt: 'Synthetic image', caption: '', category: url.searchParams.get('category'), treatment: 'AI_RESTORATION', file: '/api/public-assets/000000000000000000000001', width: 10, height: 10 }]; meta = { page: Number(url.searchParams.get('page') ?? 1), limit: 12, total: 24, pages: 2 }; }
  else if (url.pathname === '/api/reports') { data = [{ id: 'test-report', title: 'Synthetic report', summary: 'Synthetic public summary', year: 2025, download: '/api/reports/000000000000000000000002/download', file: '/api/public-assets/000000000000000000000003' }]; meta = { page: 1, limit: 12, total: 1, pages: 1 }; }
  else if (url.pathname === '/api/certificates') { data = [{ id: 'test-certificate', title: 'Synthetic historical certificate', issuer: 'Synthetic issuer', expiresAt: '2023-05-15T00:00:00.000Z', file: '/api/public-assets/000000000000000000000004' }]; meta = { page: 1, limit: 12, total: 1, pages: 1 }; }
  else { res.statusCode = 404; res.end(JSON.stringify({ error: { code: 'NOT_FOUND' } })); return; }
  res.end(JSON.stringify({ data, ...(meta ? { meta } : {}) }));
});
api.listen(0, '127.0.0.1'); await once(api, 'listening');
const reserve = createServer(); reserve.listen(0, '127.0.0.1'); await once(reserve, 'listening');
const port = reserve.address().port; await new Promise(resolve => reserve.close(resolve));
const frontend = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { cwd: new URL('..', import.meta.url), env: { ...process.env, INTERNAL_API_URL: `http://127.0.0.1:${api.address().port}`, NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = ''; frontend.stdout.on('data', data => { logs += data; }); frontend.stderr.on('data', data => { logs += data; });
const base = `http://127.0.0.1:${port}`;
async function read(path) { const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(10000) }); return { status: response.status, html: await response.text() }; }
try {
  const until = Date.now() + 15000;
  while (true) {
    try { await read('/'); break; } catch { if (Date.now() > until || frontend.exitCode !== null) throw new Error(`Frontend failed to start: ${logs}`); await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  const checks = [
    ['/', 'Human Rights Protection Foundation Pakistan'], ['/about/mission', 'Our Mission'], ['/about/board', 'Synthetic board member'], ['/about/progress-reports', 'Download public PDF'], ['/about/registration-certificates', 'Recorded expiry'], ['/what-we-do', 'What We Do'], ['/blogs', 'Synthetic article'], ['/blogs/synthetic-article', 'Synthetic article'], ['/blogs?q=nonmatching', 'No matching blogs'], ['/gallery', 'Synthetic action image'], ['/gallery?category=media-coverage', 'Synthetic media image'], ['/gallery?page=2', 'Page <!-- -->2<!-- --> of <!-- -->2'], ['/contact', 'info@hrpf.org'], ['/donate', 'PK42ABHI9009181133945000'], ['/get-involved', 'Open membership form'], ['/complaint', 'not available yet'], ['/news', 'Synthetic article'], ['/reports', 'Progress Reports'], ['/team', 'Synthetic board member'],
  ];
  for (const [path, expected] of checks) { const { status, html } = await read(path); assert.equal(status, 200, path); assert.ok(html.includes(expected), `${path}: missing ${expected}`); assert.ok(!html.includes('since 2015'), path); }
  for (const path of ['/blogs/unknown-article', '/about/unknown-section', '/projects', '/news/fictional-story', '/our-work/fictional-work']) assert.equal((await read(path)).status, 404, path);
  revision = 2; assert.ok((await read('/blogs/synthetic-article')).html.includes('Synthetic article 2'), 'Managed blog updates must not remain in a stale Next cache');
  assert.ok(requests.every(req => req.cookie === undefined), 'Server public reads must not forward session cookies');
  assert.ok(requests.every(req => !req.path.startsWith('/api/content/') && req.path !== '/api/settings/public'), 'Fixed copy must not depend on publication or settings API');
  await new Promise(resolve => api.close(resolve));
  const pages = JSON.parse(await (await import('node:fs/promises')).readFile(new URL('../data/ngo-pages.json', import.meta.url), 'utf8'));
  for (const [key, page] of Object.entries(pages)) {
    const {status, html} = await read(`/about/${key}`);
    assert.equal(status, 200, key);
    assert.ok(html.includes(page.title.replaceAll('&', '&amp;')), `${key}: source title missing without backend`);
    assert.ok(!html.includes('Content awaiting publication') && !html.includes('Content temporarily unavailable'), `${key}: fixed copy must stay available`);
  }
  for (const [path, expected] of [['/contact', 'info@hrpf.org'], ['/donate', 'PK42ABHI9009181133945000'], ['/what-we-do', 'Our Commitment'], ['/', 'A society where every person lives with dignity']]) {
    const {status, html} = await read(path); assert.equal(status, 200, path); assert.ok(html.includes(expected), `${path}: fixed copy missing without backend`);
  }
  assert.ok((await read('/blogs')).html.includes('Content temporarily unavailable'), 'Managed blogs must honestly report a backend outage');
  console.log(`Public frontend SSR checks passed: ${checks.length} routes, five real 404s, blog freshness, cookie isolation, and 14 fixed-content routes with backend stopped.`);
} finally {
  if (api.listening) await new Promise(resolve => api.close(resolve));
  if (frontend.exitCode === null) { frontend.kill('SIGTERM'); await once(frontend, 'exit'); }
}
