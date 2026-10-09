import assert from 'node:assert/strict';

const publicPaths = ['/blogs', '/about/progress-reports', '/about/registration-and-certificates', '/about/board-of-directors', '/about/our-team', '/gallery/media-coverage', '/gallery/tv-interviews'];

export async function checkNavigation(read, port) {
  const migrations = [
    ['/get-involved', '/become-a-member'], ['/get-help', '/contact'],
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
  for (const label of ['Our Work','Projects','Blogs','Gallery','Media Coverage','TV Interviews','Contact','About Us','Who We Are','Mission and Vision','Aims and Objectives','Message of CEO','Board of Directors','Our Team','Registration and Certificates','Progress Reports','Become a Member','File a Complaint']) {
    assert.ok(header.includes(label), `Menu item: ${label}`);
  }
  for (const label of ['Impact','News','Reports','Internships','Our People','Governance','Volunteer','Get Involved','Get Help','Campaigns','Events','Careers']) {
    assert.ok(!header.includes(`>${label}<`), `Removed menu item: ${label}`);
  }
  const headerPaths = [...new Set([...header.matchAll(/href="([^"?#]+)"/g)].map(match => match[1]))].filter(path => path.startsWith('/'));
  for (const path of headerPaths) assert.equal((await read(path)).status, 200, `Menu destination: ${path}`);
  assert.ok(!headerPaths.some(path => migrations.some(([old]) => path === old)), 'Menus use canonical URLs directly');
  page = await read('/file-a-complaint');
  for(const text of ['Your details','CNIC number','Father','Province / region','District','Your form details and uploaded files will be emailed']) assert.ok(page.html.includes(text),'Live complaint form: '+text);
  assert.ok(!page.html.includes('report anonymously') && !page.html.includes('demonstration only'));
  assert.ok((await read('/admin/complaints')).html.includes('Loading complaint management'));
  assert.ok((await read('/privacy-policy')).html.includes('id="complaint-information"'), 'Privacy guidance for the connected complaint route');
  page = await read('/blogs');
  assert.ok(page.html.includes('Managed news 2') && page.html.includes('/blogs/real-news'), 'Blogs use published records');
  assert.ok(!page.html.includes('Building Safer Digital Spaces'), 'No prototype blogs');
  assert.ok(page.html.includes('/blogs?page=2'), 'Blog pagination');
  page = await read('/blogs?page=2');
  assert.ok(page.html.includes('Second page blog'));
  assert.ok(page.html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').includes('Page 2 of 2'));
  assert.ok((await read('/blogs?page=invalid')).html.includes('Managed news 2'));
  page = await read('/blogs/real-news');
  assert.equal(page.status, 200);
  assert.ok(page.html.includes('Managed news body'));
  assert.ok(/rel="canonical"[^>]*blogs\/real-news/.test(page.html));
  assert.equal((await read('/blogs/unknown')).status, 404);
  assert.equal((await read('/about/unknown')).status, 404);
  page = await read('/about/who-we-are');
  const who = page.html.replace(/<script\b[\s\S]*?<\/script>/g, '');
  assert.equal((who.match(/<h1[ >]/g)||[]).length,1,'Who We Are has one main heading');
  for(const text of ['non-profit, non-governmental and humanitarian organization','Transparency and Institutional Accountability','Standing With the Vulnerable','Our Values','Legal Status and Registration','Dignity, Security and Hope','PB-9927416107711230','NPO evaluation standards notified by FBR','/about/mission-and-vision','/about/aims-and-objectives','/about/registration-and-certificates','/contact']) assert.ok(who.includes(text),'Latest client About Us content/link: '+text);
  for(const id of ['our-purpose','areas-of-work','transparency','standing-with-the-vulnerable','our-values','legal-status','our-commitment']) assert.ok(who.includes(`href="#${id}"`)&&who.includes(`id="${id}"`),'Working About contents link: '+id);
  for(const value of ['Human Dignity','Justice','Equality','Transparency','Accountability','Compassion','Integrity','Rule of Law','Freedom','Public Service']) assert.ok(who.includes(value),'Client value: '+value);
  for(const route of ['/about','/about/who-we-are','/about/mission-and-vision','/about/aims-and-objectives']) {
    const about=(await read(route)).html.replace(/<script\b[\s\S]*?<\/script>/g, '');
    for(const old of ['Elena Vasquez','Legal registration placeholder','Foundation concept and community consultation','Expansion of volunteer and legal referral network','/images/about/who-we-are.jpg','�']) assert.ok(!about.includes(old),'Removed About prototype/artefact on '+route+': '+old);
  }
  const mission=(await read('/about/mission-and-vision')).html;
  assert.ok(mission.includes('support individuals and communities facing injustice, discrimination, deprivation and vulnerability')&&mission.includes('where no vulnerable person is left without a voice'),'Mission and vision use current client copy');
  const aims=(await read('/about/aims-and-objectives')).html;
  for(const text of ['human smuggling','maternal and child healthcare','threats and risks','innocent and vulnerable prisoners'])assert.ok(aims.includes(text),'Full client area retained in objectives: '+text);
  assert.ok((await read('/about/message-of-ceo')).html.includes('Chairman’s Message'), 'Keep supplied author title');
  assert.ok((await read('/about/board-of-directors')).html.includes('Active reviewed director'));
  page = await read('/about/our-team');
  assert.ok(page.html.includes('Active reviewed director') && page.html.includes('Our office-bearers and team'));
  assert.ok(page.html.includes('/about/people/active-director') && page.html.includes('Read full profile'));
  page = await read('/about/people/active-director');
  for(const text of ['Journalism and public service','Complete reviewed profile text.','Additional profile paragraph.','Profile contents','Reviewed director portrait']) assert.ok(page.html.includes(text), 'Full person profile: '+text);
  assert.ok(/rel="canonical"[^>]*about\/people\/active-director/.test(page.html));
  assert.equal((await read('/about/people/missing-person')).status,404);
  assert.ok((await read('/admin/board')).html.includes('Loading profile management'));

  page = await read('/about/progress-reports');
  assert.ok(page.html.includes('Published progress report') && page.html.includes('/api/reports/012345678901234567890125/download'));
  for (const text of ['View document','Public edition','Reviewed public edition; case annexes omitted.','26 pages']) assert.ok(page.html.includes(text), `Report public card: ${text}`);
  assert.ok(!page.html.includes('<iframe'), 'PDF viewer loads only after opening a document');
  assert.ok((await read('/admin/documents')).html.includes('Loading document management'), 'Document administration route');
  page = await read('/about/registration-and-certificates');
  assert.ok(page.html.includes('NPO evaluation standards notified by FBR')&&page.html.includes('22 January 2026'),'Registration distinguishes PCP certification and dated Charity Commission history');
  assert.ok(page.html.includes('Released registration certificate') && page.html.includes('/api/public-assets/012345678901234567890126'));
  for (const text of ['Validity date passed','15 May 2023','16 May 2022','View document','Historical document; no renewal asserted.']) assert.ok(page.html.includes(text), `Certificate public card: ${text}`);
  page = await read('/gallery/media-coverage');
  assert.ok(page.html.includes('Published media coverage') && page.html.includes('Reviewed media caption'));
  assert.ok(/srcSet="[^"]*\?w=480[^"]*\?w=960/.test(page.html), 'Managed gallery cards use responsive bounded thumbnails');
  assert.ok(page.html.includes('View full image: Published media coverage') && page.html.includes('<dialog'), 'Gallery viewer entry point and accessible dialog');
  assert.ok(page.html.includes('AI-restored archive image') && page.html.includes('Published newspaper') && page.html.includes('2020-02-29'));
  assert.ok(page.html.includes('category=media-coverage') && page.html.includes('page=2'), 'Gallery pagination retains collection');
  assert.ok((await read('/gallery/media-coverage?category=in-action&q=HRPF')).html.includes('Published HRPF photograph'));
  page = await read('/gallery/tv-interviews');
  assert.ok(page.html.includes('Published TV interview') && page.html.includes('Reviewed interview introduction') && page.html.includes('Watch interview: Published TV interview'));
  assert.ok(!page.html.includes('<iframe'), 'Provider does not load until playback is requested');
  assert.ok((await read('/admin/gallery')).html.includes('Gallery Administration'), 'Gallery admin route metadata');
  page = await read('/become-a-member');
  assert.ok(page.html.includes('1FAIpQLSfaG3tm0xiiFQrMX9yGSxKW5rSSa4ILvIZrmaLiNSDa86IK5w'));
  assert.ok(!(await read('/get-involved')).html.includes('Volunteer Application'), 'Membership replaces volunteer form');
  for (const path of ['/campaigns', '/campaigns/old-campaign', '/events', '/events/old-event', '/careers']) assert.equal((await read(path)).status, 404, 'Permanently retired: '+path);
  const work = (await read('/our-work')).html;
  for (const field of ['womens-rights','childrens-rights','access-to-justice','minority-rights','education-and-awareness','research-and-advocacy','refugees-and-migrants','community-development']) assert.ok(work.includes('/our-work/'+field));
  const impact = (await read('/impact')).html;
  assert.ok(impact.includes('Documented Action') && impact.includes('Right to Information'));
  for (const old of ['5,000+', 'Illustrative indicators', 'Focus Area Progress']) assert.ok(!impact.includes(old));
  assert.ok((await read('/faq')).html.includes('Confirm subscription'));
  for (const path of ['/partner-with-us', '/complaints']) {
    const enquiry = (await read(path)).html;
    for (const field of ['contact-name','contact-email','contact-message','contact-consent']) assert.ok(enquiry.includes(field), path+' has connected enquiry fields');
    assert.ok(!enquiry.includes('simulateSubmission') && !enquiry.includes('demonstration only'));
  }
  assert.ok((await read('/newsletter')).html.includes('Newsletter Subscription'));
  page = await read('/search');
  assert.ok(page.html.includes('/blogs/real-news') && page.html.includes('Progress Reports') && !page.html.includes('Building Safer Digital Spaces'));
  for (const path of ['/campaigns','/events','/careers','/get-help','/get-involved']) assert.ok(!page.html.includes('href=\"'+path), 'Search removes '+path);
  console.log('Navigation checks passed: menu destinations, canonical Blogs, 308 redirects, pagination, public media/documents/board and membership.');
}

export async function checkEmptyNavigation(read) {
  const page = await read('/blogs');
  assert.ok(!page.html.includes('Managed news') && !page.html.includes('/blogs/real-news'));
  assert.equal((await read('/blogs/real-news')).status, 404, 'Withdrawn blog must not resolve');
  assert.equal((await read('/about/people/active-director')).status,404);
  for (const path of publicPaths.slice(1)) {
    const page = await read(path);
    assert.equal(page.status, 200);
    for (const title of ['Published progress report', 'Released registration certificate', 'Active reviewed director', 'Published media coverage', 'Published TV interview']) assert.ok(!page.html.includes(title), 'Empty public feed must not resurrect drafts');
  }
}

export async function checkOfflineNavigation(read) {
  assert.ok((await read('/about/people/active-director')).html.includes('Profile temporarily unavailable'));
  for (const path of publicPaths) {
    const page = await read(path);
    assert.equal(page.status, 200);
    assert.ok(page.html.includes('temporarily unavailable'), `Offline guidance: ${path}`);
  }
}
