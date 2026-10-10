import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const suppliedObjectives = JSON.parse(readFileSync(new URL('../data/aims-and-objectives.json', import.meta.url), 'utf8')).objectives;
const suppliedPurpose = JSON.parse(readFileSync(new URL('../data/about-source.json', import.meta.url), 'utf8')).pages;

const publicPaths = ['/blogs', '/about/progress-reports', '/about/registration-and-certificates', '/about/board-of-directors', '/about/our-team', '/gallery/media-coverage', '/gallery/tv-interviews'];

export async function checkNavigation(read, port) {
  const migrations = [
    ['/get-involved', '/become-a-member'], ['/get-help', '/contact'],
    ['/news', '/blogs'], ['/news/real-news?from=old', '/blogs/real-news?from=old'],
    ['/updates/real-news', '/blogs/real-news'], ['/updates', '/blogs'],
    ['/reports', '/about/progress-reports'], ['/team', '/about/our-team'],
    ['/media', '/gallery'], ['/governance', '/about'], ['/report-a-violation', '/file-a-complaint'],
  ];
  for (const [oldPath, target] of migrations) {
    const response = await fetch(`http://127.0.0.1:${port}${oldPath}`, { redirect: 'manual' });
    assert.equal(response.status, 308, oldPath);
    assert.equal(response.headers.get('location'), target, oldPath);
  }
  let page = await read();
  const header = page.html.match(/<header[\s\S]*?<\/header>/)[0];
  for (const label of ['Our Work','Projects','Blogs','Gallery','Media Coverage','TV Interviews','Contact','About Us','Who We Are','Profile','Mission and Vision','Aims and Objectives','Message of CEO','Board of Directors','Our Team','Registration and Certificates','Progress Reports','Become a Member','File a Complaint']) {
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
  page = await read('/about/profile');
  const profile = page.html.match(/<main\b[\s\S]*?<\/main>/)[0];
  assert.equal(page.status,200);
  assert.equal((profile.match(/<h1[ >]/g)||[]).length,1);
  assert.ok(profile.includes('Community welfare') && profile.includes('43 pages'));
  assert.ok(profile.includes('View profile (PDF)') && profile.includes('download="HRPF-Organizational-Profile.pdf"'));
  assert.ok(!profile.includes('<iframe'), 'Profile PDF only loads when chosen');
  const pdf = await fetch(`http://127.0.0.1:${port}/documents/profile/v1/hrpf-organizational-profile.pdf`);
  assert.equal(pdf.status,200); assert.match(pdf.headers.get('content-type'),/application\/pdf/);
  assert.match(pdf.headers.get('cache-control'),/max-age=31536000.*immutable/);
  const bytes = Buffer.from(await pdf.arrayBuffer()); assert.equal(bytes.subarray(0,5).toString(),'%PDF-'); assert.ok(bytes.length>1000000);
  for (const slug of ['dr-sidra-mubashir','dr-iqra-mubashar']) {
    const portrait=(await read('/about/people/'+slug)).html.match(/<main\b[\s\S]*?<\/main>/)[0].replace(/%2F/gi,'/');
    assert.ok(portrait.includes('/images/people/v1/portrait-placeholder.webp'));
    assert.ok(!portrait.includes('/api/public-assets/01234567890123456789013'), 'Original portrait never rendered');
    assert.ok(portrait.includes('scale(1)'), 'Placeholder ignores old portrait zoom');
  }
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
  const mission=(await read('/about/mission-and-vision')).html.replace(/<script\b[\s\S]*?<\/script>/g,'');
  const missionText=mission.replace(/<[^>]+>/g,'').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  assert.equal((mission.match(/<h1[ >]/g)||[]).length,1,'Mission and Vision has one main heading');
  assert.equal(suppliedPurpose.vision.blocks.length,3,'Complete client vision has three paragraphs');
  assert.equal(suppliedPurpose.mission.blocks.length,8,'Complete client mission has eight paragraphs');
  for(const block of [...suppliedPurpose.vision.blocks,...suppliedPurpose.mission.blocks])assert.ok(missionText.includes(block.text),'Complete client paragraph: '+block.text.slice(0,55));
  assert.deepEqual([...mission.matchAll(/<li\b[^>]*id="priority-(\d+)"/g)].map(match=>Number(match[1])),[1,2,3,4,5,6],'All six mission priorities are visible in order');
  for(const priority of suppliedPurpose.mission.priorities)for(const text of [priority.title,priority.text])assert.ok(missionText.includes(text),'Complete priority text: '+text);
  for(const text of [suppliedPurpose.mission.tagline,...suppliedPurpose.mission.commitment,suppliedPurpose.mission.closing])assert.ok(missionText.includes(text),'Client commitment and slogans: '+text);
  for(const id of ['our-vision','our-mission','mission-priorities','our-commitment'])assert.ok(mission.includes(`href="#${id}"`)&&mission.includes(`id="${id}"`),'Mission and vision jump link: '+id);
  for(const route of ['/about','/about/who-we-are']) {
    const summary=(await read(route)).html.replace(/<script\b[\s\S]*?<\/script>/g,'');
    assert.ok(summary.includes(suppliedPurpose.mission.blocks[0].text)&&summary.includes(suppliedPurpose.vision.blocks[0].text),'Shared summaries use the latest client wording on '+route);
  }
  const homePurpose=(await read()).html.match(/<dl\b[^>]*>[\s\S]*?<\/dl>/)?.[0];
  assert.ok(homePurpose,'Homepage has a concise mission and vision summary');
  for(const text of [suppliedPurpose.mission.title,suppliedPurpose.mission.tagline,suppliedPurpose.vision.title,suppliedPurpose.vision.blocks[0].text])assert.ok(homePurpose.includes(text),'Homepage purpose uses current client wording: '+text);
  assert.ok((await read()).html.includes('href="/about/mission-and-vision"'),'Homepage links to the full Mission and Vision page');
  const aims=(await read('/about/aims-and-objectives')).html.replace(/<script\b[\s\S]*?<\/script>/g,'');
  assert.equal(suppliedObjectives.length,42,'All five screenshots contain 42 objectives');
  assert.deepEqual([...aims.matchAll(/<li\b[^>]*id="objective-(\d+)"/g)].map(match=>Number(match[1])),Array.from({length:42},(_,i)=>i+1),'Every objective is visible in the original order');
  const aimsText=aims.replace(/<[^>]+>/g,'').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  for(const [index,objective] of suppliedObjectives.entries())for(const paragraph of objective.split('\n\n'))assert.ok(aimsText.includes(paragraph),'Complete text retained for objective '+(index+1));
  for(const start of [1,11,21,31])assert.ok(aims.includes(`href="#objective-${start}"`),'Objective jump link: '+start);
  assert.ok(aims.includes('Objectives 31–42') && aims.includes('<ol'),'Final range and semantic ordered list');
  assert.ok(aimsText.includes('jail prisoners') && aimsText.includes('conducive to the objects of the Foundation'),'Cross-image objectives 17 and 26 are joined');
  const aimsStatistic=[...(await read()).html.matchAll(/<dd>([\s\S]*?)<\/dd>/g)].map(match=>match[1]).find(text=>text.includes('Aims and Objectives'));
  assert.ok(aimsStatistic && /\b42\b/.test(aimsStatistic.replace(/<[^>]+>/g,' ')),'Homepage count matches all 42 published objectives');
  assert.ok((await read('/about')).html.includes('42 aims and objectives covering'),'About card and metadata use the full objectives count');
  assert.ok(who.includes('Read All 42 Aims and Objectives'),'Who We Are points to the complete list');
  assert.ok((await read('/faq')).html.includes('lists all 42 objectives'),'FAQ reflects the complete list');
  const leadership=(await read('/about/message-of-ceo')).html.replace(/<script\b[\s\S]*?<\/script>/g,'');
  assert.ok(leadership.includes('Chairman’s Message'), 'Keep supplied author title');
  assert.ok(leadership.includes('Reviewed leadership portrait') && leadership.includes('/api/public-assets/012345678901234567890132') && leadership.includes('/about/people/muhammad-yousaf-badar'), 'Leadership message uses its published author portrait and profile link');
  assert.ok((await read('/about/board-of-directors')).html.includes('Active reviewed director'));
  page = await read('/about/our-team');
  const operational=page.html.replace(/<script\b[\s\S]*?<\/script>/g,'').match(/<main[\s\S]*?<\/main>/)[0];
  for(const text of ['Our Operational Team','Synthetic operational member','Operations officer','Coordinate daily work.','Maintain team schedules.','Reporting to','Operations lead'])assert.ok(operational.includes(text),'Complete operational card: '+text);
  for(const text of ['Active reviewed director','Our office-bearers and team','office-bearers who also serve','/about/people/active-director'])assert.ok(!operational.includes(text),'No board content in team cards: '+text);
  assert.ok((await read('/admin/team')).html.includes('Loading operational team management'),'Dedicated operational team administration route');
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
  assert.ok(page.html.includes('Apply for Membership')); assert.ok(page.html.includes('Review application')); assert.ok(!page.html.includes('docs.google.com/forms'));
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
  assert.ok(page.html.includes('/blogs/real-news') && page.html.includes('Progress Reports') && page.html.includes('/about/profile') && !page.html.includes('Building Safer Digital Spaces'));
  for (const path of ['/campaigns','/events','/careers','/get-help','/get-involved']) assert.ok(!page.html.includes('href=\"'+path), 'Search removes '+path);
  console.log('Navigation checks passed: menu destinations, canonical Blogs, 308 redirects, pagination, public media/documents/board and membership.');
}

export async function checkEmptyNavigation(read) {
  const team=(await read('/about/our-team')).html.replace(/<script\b[\s\S]*?<\/script>/g,'');
  assert.ok(team.includes('Nothing to show here')&&!team.includes('Synthetic operational member')&&!team.includes('Active reviewed director'),'Empty operational team stays empty');
  const page = await read('/blogs');
  assert.ok(!page.html.includes('Managed news') && !page.html.includes('/blogs/real-news'));
  assert.equal((await read('/blogs/real-news')).status, 404, 'Withdrawn blog must not resolve');
  assert.equal((await read('/about/people/active-director')).status,404);
  const leadership=(await read('/about/message-of-ceo')).html.replace(/<script\b[\s\S]*?<\/script>/g,'');
  assert.ok(leadership.includes('It gives me great satisfaction') && !leadership.includes('Reviewed leadership portrait') && !leadership.includes('/api/public-assets/012345678901234567890132'), 'Withdrawn author portrait stays hidden while the supplied message remains readable');
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
