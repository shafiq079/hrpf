import assert from 'node:assert/strict';

const publicPaths = ['/blogs', '/about/progress-reports', '/about/registration-and-certificates', '/about/board-of-directors', '/gallery/media-coverage'];

export async function checkNavigation(read, port) {
  const migrations = [
    ['/news', '/blogs'], ['/news/real-news?from=old', '/blogs/real-news?from=old'],
    ['/updates/real-news', '/blogs/real-news'], ['/updates', '/blogs'],
    ['/reports', '/about/progress-reports'], ['/team', '/about/board-of-directors'],
    ['/media', '/gallery'], ['/governance', '/about'], ['/report-a-violation', '/file-a-complaint'],
  ];
  for (const [oldPath, target] of migrations) {
    const response = await fetch(`http://127.0.0.1:${port}${oldPath}`, { redirect: 'manual' });
    assert.equal(response.status, 308, oldPath);
    assert.equal(response.headers.get('location'), target, oldPath);
  }
  let page = await read();
  const header = page.html.match(/<header[\s\S]*?<\/header>/)[0];
  for (const label of ['Our Work','Projects','Blogs','Gallery','Media Coverage','TV Interviews','Get Involved','About Us','Who We Are','Mission and Vision','Aims and Objectives','Message of CEO','Board of Directors','Our Team','Registration and Certificates','Progress Reports','Become a Member','File a Complaint']) {
    assert.ok(header.includes(label), `Menu item: ${label}`);
  }
  for (const label of ['Impact','News','Reports','Internships','Our People','Governance','Volunteer']) {
    assert.ok(!header.includes(`>${label}<`), `Removed menu item: ${label}`);
  }
  const headerPaths = [...new Set([...header.matchAll(/href="([^"?#]+)"/g)].map(match => match[1]))].filter(path => path.startsWith('/'));
  for (const path of headerPaths) assert.equal((await read(path)).status, 200, `Menu destination: ${path}`);
  assert.ok(!headerPaths.some(path => migrations.some(([old]) => path === old)), 'Menus use canonical URLs directly');
  page = await read('/blogs');
  assert.ok(page.html.includes('Managed news 2') && page.html.includes('/blogs/real-news'), 'Blogs use published records');
  assert.ok(!page.html.includes('Building Safer Digital Spaces'), 'No prototype blogs');
  assert.ok(page.html.includes('/blogs?page=2'), 'Blog pagination');
  page = await read('/blogs?page=2');
  assert.ok(page.html.includes('Second page blog'));
  assert.ok(page.html.replace(/<!--[\s\S]*?-->/g, '').includes('Page 2 of 2'));
  assert.ok((await read('/blogs?page=invalid')).html.includes('Managed news 2'));
  page = await read('/blogs/real-news');
  assert.equal(page.status, 200);
  assert.ok(page.html.includes('Managed news body'));
  assert.ok(/rel="canonical"[^>]*blogs\/real-news/.test(page.html));
  assert.equal((await read('/blogs/unknown')).status, 404);
  assert.equal((await read('/about/unknown')).status, 404);
  assert.ok((await read('/about/who-we-are')).html.includes('public-interest organization'));
  assert.ok((await read('/about/message-of-ceo')).html.includes('Chairman’s Message'), 'Keep supplied author title');
  assert.ok((await read('/about/board-of-directors')).html.includes('Active reviewed director'));
  page = await read('/about/progress-reports');
  assert.ok(page.html.includes('Published progress report') && page.html.includes('/api/reports/012345678901234567890125/download'));
  page = await read('/about/registration-and-certificates');
  assert.ok(page.html.includes('Released registration certificate') && page.html.includes('/api/public-assets/012345678901234567890126'));
  page = await read('/gallery/media-coverage');
  assert.ok(page.html.includes('Published media coverage') && page.html.includes('Reviewed media caption'));
  assert.ok((await read('/gallery/tv-interviews')).html.includes('Interview recordings are not available here yet'));
  page = await read('/become-a-member');
  assert.ok(page.html.includes('1FAIpQLSfaG3tm0xiiFQrMX9yGSxKW5rSSa4ILvIZrmaLiNSDa86IK5w'));
  assert.ok(!(await read('/get-involved')).html.includes('Volunteer Application'), 'Membership replaces volunteer form');
  page = await read('/search');
  assert.ok(page.html.includes('/blogs/real-news') && page.html.includes('Progress Reports') && !page.html.includes('Building Safer Digital Spaces'));
  console.log('Navigation checks passed: menu destinations, canonical Blogs, 308 redirects, pagination, public media/documents/board and membership.');
}

export async function checkEmptyNavigation(read) {
  const page = await read('/blogs');
  assert.ok(!page.html.includes('Managed news') && !page.html.includes('/blogs/real-news'));
  assert.equal((await read('/blogs/real-news')).status, 404, 'Withdrawn blog must not resolve');
  for (const path of publicPaths.slice(1)) {
    const page = await read(path);
    assert.equal(page.status, 200);
    for (const title of ['Published progress report', 'Released registration certificate', 'Active reviewed director', 'Published media coverage']) assert.ok(!page.html.includes(title), 'Empty public feed must not resurrect drafts');
  }
}

export async function checkOfflineNavigation(read) {
  for (const path of publicPaths) {
    const page = await read(path);
    assert.equal(page.status, 200);
    assert.ok(page.html.includes('temporarily unavailable'), `Offline guidance: ${path}`);
  }
}
