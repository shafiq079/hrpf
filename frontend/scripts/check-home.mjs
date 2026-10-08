import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {checkNavigation, checkEmptyNavigation, checkOfflineNavigation} from './check-navigation.mjs';
let revision=1,empty=false,richBlog=true;const requests=[];
const workPages=[["childrens-rights", "Children's Rights"], ["access-to-justice", "Access to Justice"], ["minority-rights", "Minority Rights"], ["education-and-awareness", "Education and Awareness"], ["research-and-advocacy", "Research and Advocacy"]];
const api=createServer((req,res)=>{
 requests.push({path:req.url,cookie:req.headers.cookie});res.setHeader('Content-Type','application/json');
 const project={title:`Managed project ${revision}`,slug:'real-project',summary:'Synthetic project summary',focusArea:'Women’s Rights',status:'Ongoing',location:'Pakistan',startYear:2026,image:null,blocks:[{type:'paragraph',text:'Managed project body'}],details:{overview:'Project overview text',challenge:'Documented challenge',approach:'Community approach',period:'March–September 2026',targetCommunity:'Local families',objectives:['Improved access'],activities:['Community sessions'],outcomes:['Documented result'],milestones:[{period:'June 2026',title:'First milestone'}],metrics:[{value:'12',label:'Sessions',source:'Project report'}],partners:['Verified partner'],sections:[{heading:'Lessons learned',body:'Project lessons'}]},gallery:[{image:'/api/public-assets/012345678901234567890123',alt:'Community session',caption:'Reviewed caption'},{image:'/api/public-assets/012345678901234567890124',alt:'Project activity'}],documents:[{file:'/api/public-assets/012345678901234567890125',label:'Project report PDF'}]};
 const news={title:`Managed news ${revision}`,slug:'real-news',excerpt:'Synthetic news summary',publishedAt:'2026-01-01T00:00:00.000Z',image:'/images/hrpf/home-report-2023.webp',imageAlt:'Reviewed blog cover',category:'Community advocacy',authorName:'HRPF Pakistan',readingMinutes:4,blocks:[{type:'paragraph',text:'Managed news body'}],...(richBlog?{tags:['Accountability'],details:{category:'Community advocacy',authorName:'HRPF Pakistan',authorRole:'Foundation team',intro:'Blog introduction text',coverCaption:'Illustrative archive cover',takeaways:['Important blog takeaway'],sections:[{heading:'Story context',body:'Article section text',bullets:['Supported detail'],quote:'A verified quotation',attribution:'Supplied report'}],conclusion:'Blog closing thoughts',sources:[{label:'Blog source reference',url:'https://example.org/source',note:'Historical source note'}]},gallery:[{image:'/api/public-assets/012345678901234567890128',alt:'Blog archive photograph',caption:'Illustrative article photograph'},{image:'/api/public-assets/012345678901234567890129',alt:'Second archive photograph'}],documents:[{file:'/api/public-assets/012345678901234567890130',label:'Blog source brief PDF'}]}:{})};
 const path=new URL(req.url,'http://localhost').pathname;
 if(path==='/api/projects'||path==='/api/blogs'){
  const page=Number(new URL(req.url,'http://localhost').searchParams.get('page')??1);
  const field=new URL(req.url,'http://localhost').searchParams.get('focusArea');
  const area=workPages.find(([,title])=>title===field);
  const row=path.endsWith('projects')?(area?{...project,title:`Field project: ${area[0]} ${revision}`,focusArea:field}:project):{...news,...(page===2?{title:'Second page blog',slug:'second-page-blog'}:{})};
  res.end(JSON.stringify({data:empty?[]:[row,...(path.endsWith('blogs')&&page===1?[{...news,title:'Related published blog',slug:'related-blog'}]:[])],meta:{page,pages:empty?0:2}}));
 }
 else if(!empty&&(path==='/api/projects/real-project'||path==='/api/blogs/real-news'))res.end(JSON.stringify({data:path.includes('projects')?project:news}));
 else if(path==='/api/reports')res.end(JSON.stringify({data:empty?[]:[{id:'012345678901234567890125',title:'Published progress report',summary:'Report summary',edition:'public-edition',releaseNote:'Reviewed public edition; case annexes omitted.',pages:26,format:'pdf',bytes:650000,view:'/api/documents/reports/012345678901234567890125/view',year:2025,slug:'progress-report',file:'/api/public-assets/012345678901234567890125',download:'/api/reports/012345678901234567890125/download'}],meta:{pages:empty?0:1}}));
 else if(path==='/api/certificates')res.end(JSON.stringify({data:empty?[]:[{id:'012345678901234567890126',title:'Released registration certificate',issuer:'Test issuer',summary:'Historical registration document',releaseNote:'Historical document; no renewal asserted.',expiresAt:'2023-05-15T00:00:00.000Z',validFrom:'2022-05-16T00:00:00.000Z',format:'jpg',view:'/api/documents/certificates/012345678901234567890126/view',download:'/api/documents/certificates/012345678901234567890126/download',file:'/api/public-assets/012345678901234567890126'}]}));
 else if(path==='/api/gallery'){
  const query=new URL(req.url,'http://localhost').searchParams,category=query.get('category');
  assert.ok(['media-coverage','in-action'].includes(category));
  res.end(JSON.stringify({data:empty?[]:[{id:'012345678901234567890127',title:category==='in-action'?'Published HRPF photograph':'Published media coverage',file:'/api/public-assets/012345678901234567890127',alt:'Reviewed coverage image',caption:'Reviewed media caption',category,sourceName:'Published newspaper',eventDate:'2020-02-29',mediaType:category==='in-action'?'photo':'newspaper',treatment:'AI_RESTORATION'}],meta:{page:Number(query.get('page')??1),pages:empty?0:2}}));
 }
 else if(path==='/api/interviews')res.end(JSON.stringify({data:empty?[]:[{id:'012345678901234567890131',title:'Published TV interview',description:'Reviewed interview introduction',provider:'youtube',watchUrl:'https://www.youtube.com/watch?v=Abcdef123_-',embedUrl:'https://www.youtube-nocookie.com/embed/Abcdef123_-',sourceName:'Reviewed channel',eventDate:'2020-02-29',thumbnail:null,thumbnailAlt:''}],meta:{page:1,pages:empty?0:2}}));
 else if(path==='/api/board'||path==='/api/team')res.end(JSON.stringify({data:empty?[]:[{name:'Active reviewed director',slug:'active-director',designation:'Board member',bio:'Reviewed biography',photo:'/images/hrpf/home-chairman.webp',photoAlt:'Reviewed director portrait',photoZoom:1.4,showOnBoard:true,showOnTeam:true}],meta:{page:1,pages:empty?0:2}}));
 else if(!empty&&path==='/api/board/active-director')res.end(JSON.stringify({data:{name:'Active reviewed director',slug:'active-director',designation:'Board member',bio:'Reviewed biography',photo:'/images/hrpf/home-chairman.webp',photoAlt:'Reviewed director portrait',photoZoom:1.4,showOnBoard:true,showOnTeam:true,sections:[{heading:'Journalism and public service',body:'Complete reviewed profile text.\n\nAdditional profile paragraph.'}]}}));
 else{res.statusCode=404;res.end('{}');}
});
api.listen(0,'127.0.0.1');await once(api,'listening');
const reserve=createServer();reserve.listen(0,'127.0.0.1');await once(reserve,'listening');const port=reserve.address().port;await new Promise(r=>reserve.close(r));
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{cwd:new URL('..',import.meta.url),env:{...process.env,INTERNAL_API_URL:`http://127.0.0.1:${api.address().port}`},stdio:['ignore','pipe','pipe']});let logs='';child.stdout.on('data',x=>logs+=x);child.stderr.on('data',x=>logs+=x);
const read=async(path='/')=>{const r=await fetch(`http://127.0.0.1:${port}${path}`,{signal:AbortSignal.timeout(15000)});return {status:r.status,html:await r.text()};};
try{
 const deadline=Date.now()+20000;while(true){try{await read();break;}catch{if(Date.now()>deadline||child.exitCode!==null)throw new Error(logs);await new Promise(r=>setTimeout(r,100));}}
 let page=await read();assert.equal(page.status,200);assert.equal((page.html.split('</main>')[0].match(/<section/g)||[]).length,9,'All original homepage sections remain');
 assert.ok(page.html.includes('hrpf-language-widget') && page.html.includes('Languages'),'Public translation entry point');
 assert.ok(!page.html.includes('src="https://cdn.gtranslate.net/'),'Translation provider is not loaded during server rendering');
 const privatePage=await read('/admin/complaints');
 assert.ok(!privatePage.html.includes('id="hrpf-language-widget"'),'No language control on private administration');
 assert.ok(privatePage.html.includes('translate="no"'),'Private content excluded from automatic translation');
 const women=await read('/our-work/womens-rights');assert.equal(women.status,200);
 assert.equal((women.html.match(/<h1[ >]/g)||[]).length,1,'Women rights page has one primary heading');
 for(const text of ['Projects in this field','Managed project 1','/projects/real-project','womens-rights-archive.webp','/file-a-complaint'])assert.ok(women.html.includes(text),`General women rights page: ${text}`);
 for(const text of ['Dar-ul-Aman','Provincial Ombudsman','pages 14–15','AI restored','event date not recorded','1,200+','40+','Leadership Participation','Rights Awareness Workshops','Community Member','Illustrative indicators','/images/work/womens-rights.jpg','womens-community-leadership'])assert.ok(!women.html.includes(text),`Removed women rights case/prototype text: ${text}`);
 assert.ok(requests.some(r=>r.path.startsWith('/api/projects')&&new URL(r.path,'http://localhost').searchParams.get('focusArea')==="Women's Rights"),'Related project request uses focus-area filter');
 for(const [slug,title] of workPages){
  const field=await read('/our-work/'+slug);assert.equal(field.status,200);
  assert.equal((field.html.match(/<h1[ >]/g)||[]).length,1,slug+' has one H1');
  for(const text of ['Projects in this field',`Field project: ${slug} 1`,`${slug}-archive.webp`,'/projects/real-project','/file-a-complaint','/contact'])assert.ok(field.html.includes(text),slug+': '+text);
  for(const text of ['(sample)','Illustrative indicators','Community Member','Legal Awareness Clinics','Referral Network','Digital Literacy Corps','Source: HRPF','AI restored','event date not recorded'])assert.ok(!field.html.includes(text),slug+' removed: '+text);
  assert.ok(requests.some(r=>new URL(r.path,'http://localhost').searchParams.get('focusArea')===title),slug+' requests its focus label');
 }
 console.log('All six work pages passed: distinct general content/photos, managed field projects, canonical links and no prototype/source notes.');
 for(const route of ['privacy-policy','terms-of-use','accessibility','safeguarding-policy']){
  const policy=await read('/'+route);assert.equal(policy.status,200);
  assert.equal((policy.html.match(/<h1[ >]/g)||[]).length,1,route+' has one H1');
  for(const removed of ['placeholder — update before publication','(placeholder address)','Download PDF','File coming soon','review schedule should be confirmed'])assert.ok(!policy.html.includes(removed),route+' removed '+removed);
  assert.ok(policy.html.includes('2026-10-08')&&policy.html.includes('mailto:hrpf786@gmail.com'),route+' dated and has source contact');
 }
 const privacy=await read('/privacy-policy');for(const text of ['every uploaded file','fixed automatic deletion period','Google Forms','GTranslate','do not transmit entries'])assert.ok(privacy.html.includes(text),'Privacy current feature: '+text);
 const safeguarding=await read('/safeguarding-policy');assert.ok(safeguarding.html.includes('not an anonymous channel')&&safeguarding.html.includes('dedicated independent reporting contact'),'Safeguarding distinguishes actual reporting and its limits');
 const access=await read('/accessibility');assert.ok(access.html.includes('WCAG 2.2 Level AA')&&access.html.includes('do not claim full conformance'),'Accessibility states target rather than unaudited compliance');
 console.log('Policy checks passed: dated pages, sourced contact, actual complaint/email/translation/retention behaviour, honest safeguarding and accessibility limits, no prototype notes or dead PDF controls.');
 const donation=await read('/donate');assert.equal(donation.status,200);
 const donationMain=donation.html.match(/<main[\s\S]*?<\/main>/)[0];
 for(const text of ['Human Rights Protection Foundation','ABHI Micro Finance Bank','90099009181133945000','PK42ABHI9009181133945000','0322-2670590','mailto:hrpf786@gmail.com','Copy Account number','Copy IBAN','Copy JazzCash number'])assert.ok(donationMain.includes(text),'Sourced transfer details: '+text);
 for(const text of ['<form','<input','Payments are not configured','Bank details to be added','Payment provider integration pending','demonstration website','refund policy','Sponsor-a-project'])assert.ok(!donationMain.includes(text),'Removed payment prototype: '+text);
 assert.ok(!donationMain.includes('Easypaisa'),'No unsourced wallet account');
 assert.equal((donationMain.match(/<h1[ >]/g)||[]).length,1);
 console.log('Donation page checks passed: exact sourced bank/JazzCash details, copy controls, no payment form or unsourced wallet.');
 assert.equal((await read('/our-work/unknown-area')).status,404);
 console.log('Women rights checks passed: general content, managed field projects, one H1, archive photo, actions and removal of hardcoded case/source notes.');
 for(const text of ['Managed project 1','Managed news 1','Our Guiding Principles','Muhammad Yousaf Badar','home-hero.webp','home-about.webp','home-chairman.webp'])assert.ok(page.html.includes(text),text);
 for(const text of ['Ana Ortiz','UNHCR','ICRC','World Bank','5000+','500K','Safe Haven Initiative','since 2015'])assert.ok(!page.html.includes(text),`Unverified claim: ${text}`);
 revision=2;assert.ok((await read('/our-work/womens-rights')).html.includes('Managed project 2'),'Field projects reflect managed updates');page=await read();assert.ok(page.html.includes('Managed project 2')&&page.html.includes('Managed news 2'),'Managed homepage feeds must refresh');
 assert.ok((await read('/programmes')).html.includes('Managed project 2'));
 assert.ok((await read('/programmes/real-project')).html.includes('Managed project body'));assert.ok((await read('/updates/real-news')).html.includes('Managed news body'));assert.equal((await read('/updates/unknown')).status,404);
 page=await read('/projects/real-project');assert.equal(page.status,200);
 for(const text of ['Project overview text','Documented challenge','Community approach','Improved access','Community sessions','Documented result','First milestone','Project report','Verified partner','Lessons learned','Project report PDF','Next photograph','Community session'])assert.ok(page.html.includes(text),`Rich project detail: ${text}`);
 assert.ok((await read('/projects')).html.includes('Managed project 2'),'Project listing must use managed records');assert.equal((await read('/projects/unknown')).status,404);
 assert.ok((await read('/admin/projects')).html.includes('Loading project management'),'Project admin route must render');
 await checkNavigation(read,port);
 const richPage=await read('/blogs/real-news');
 for(const content of ['Key takeaways','Important blog takeaway','Story context','Article section text','Supported detail','A verified quotation','Supplied report','Blog closing thoughts','Blog photographs','Sources and references','Historical source note','Blog source brief PDF','Illustrative archive cover','Article contents','Share this blog','Copy link','Related published blog','4','min read']) assert.ok(richPage.html.includes(content),`Blog detail: ${content}`);
 assert.ok(richPage.html.includes('article:published_time'),'Article SEO metadata');
 assert.ok((await read('/admin/blogs')).html.includes('Loading blog management'));
 richBlog=false;
 const legacyBlog=await read('/blogs/real-news');
 assert.equal(legacyBlog.status,200);assert.ok(legacyBlog.html.includes('Managed news body'));assert.ok(!legacyBlog.html.includes('Key takeaways'));
 richBlog=true;
 console.log('Blog detail checks passed: rich article, legacy text, gallery, sources, downloads, share controls, related articles, admin route and article metadata.');
 empty=true;for(const [slug] of workPages){const field=await read('/our-work/'+slug);assert.ok(field.html.includes('There are no projects listed in this field yet.')&&!field.html.includes('Field project:'),slug+' has empty field state');}const emptyWomen=await read('/our-work/womens-rights');assert.ok(emptyWomen.html.includes('Projects in this field')&&emptyWomen.html.includes('There are no projects listed in this field yet.')&&!emptyWomen.html.includes('Managed project'),'Empty field retains general page without prototypes');page=await read();assert.ok(page.html.includes('Featured Projects')&&page.html.includes('Latest News &amp; Updates'));assert.ok(!page.html.includes('Our Programmes &amp; Priorities')&&!page.html.includes('Progress Reports &amp; Updates'));assert.ok(!page.html.includes('Managed project'));
 await checkEmptyNavigation(read);
 await new Promise(r=>api.close(r));page=await read();assert.equal(page.status,200);assert.ok(page.html.includes('Human Rights Protection Foundation Pakistan')&&page.html.includes('Featured Projects')&&page.html.includes('Latest News &amp; Updates'),'Original headings remain visible without backend');
 const offlineWomen=await read('/our-work/womens-rights');assert.equal(offlineWomen.status,200);assert.ok(offlineWomen.html.includes('Projects could not be loaded.')&&offlineWomen.html.includes('Dignity, safety and a voice.'),'General page remains usable offline');
 for(const [slug] of workPages){const field=await read('/our-work/'+slug);assert.equal(field.status,200);assert.ok(field.html.includes('Projects could not be loaded.')&&field.html.includes('Our priorities'),slug+' usable without backend');}
 await checkOfflineNavigation(read);
 assert.ok(requests.some(r=>r.path.startsWith('/api/blogs'))&&!requests.some(r=>r.path.startsWith('/api/news')),'Frontend must use canonical Blogs API');
 assert.ok(requests.every(r=>r.cookie===undefined),'Public reads must not forward cookies');
 console.log('Homepage/project checks passed: sourced home, managed listings, rich details, gallery controls, project admin route, fresh updates, empty/offline headings and cookie isolation.');
}finally{if(api.listening)await new Promise(r=>api.close(r));if(child.exitCode===null){child.kill('SIGTERM');await once(child,'exit');}}
