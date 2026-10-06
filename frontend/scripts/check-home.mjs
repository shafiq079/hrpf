import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
let revision=1,empty=false;const requests=[];
const api=createServer((req,res)=>{
 requests.push({path:req.url,cookie:req.headers.cookie});res.setHeader('Content-Type','application/json');
 const project={title:`Managed project ${revision}`,slug:'real-project',summary:'Synthetic project summary',focusArea:'Rights',status:'Ongoing',location:'Pakistan',startYear:2026,image:null,blocks:[{type:'paragraph',text:'Managed project body'}]};
 const news={title:`Managed news ${revision}`,slug:'real-news',excerpt:'Synthetic news summary',publishedAt:'2026-01-01T00:00:00.000Z',image:null,blocks:[{type:'paragraph',text:'Managed news body'}]};
 const path=new URL(req.url,'http://localhost').pathname;
 if(path==='/api/projects'||path==='/api/news')res.end(JSON.stringify({data:empty?[]:[path.endsWith('projects')?project:news]}));
 else if(path==='/api/projects/real-project'||path==='/api/news/real-news')res.end(JSON.stringify({data:path.includes('projects')?project:news}));
 else{res.statusCode=404;res.end('{}');}
});
api.listen(0,'127.0.0.1');await once(api,'listening');
const reserve=createServer();reserve.listen(0,'127.0.0.1');await once(reserve,'listening');const port=reserve.address().port;await new Promise(r=>reserve.close(r));
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{cwd:new URL('..',import.meta.url),env:{...process.env,INTERNAL_API_URL:`http://127.0.0.1:${api.address().port}`},stdio:['ignore','pipe','pipe']});let logs='';child.stdout.on('data',x=>logs+=x);child.stderr.on('data',x=>logs+=x);
const read=async(path='/')=>{const r=await fetch(`http://127.0.0.1:${port}${path}`,{signal:AbortSignal.timeout(15000)});return {status:r.status,html:await r.text()};};
try{
 const deadline=Date.now()+20000;while(true){try{await read();break;}catch{if(Date.now()>deadline||child.exitCode!==null)throw new Error(logs);await new Promise(r=>setTimeout(r,100));}}
 let page=await read();assert.equal(page.status,200);assert.equal((page.html.split('</main>')[0].match(/<section/g)||[]).length,9,'All original homepage sections remain');
 for(const text of ['Managed project 1','Managed news 1','Our Guiding Principles','Muhammad Yousaf Badar','home-hero.webp','home-about.webp','home-chairman.webp'])assert.ok(page.html.includes(text),text);
 for(const text of ['Ana Ortiz','UNHCR','ICRC','World Bank','5000+','500K','Safe Haven Initiative','since 2015'])assert.ok(!page.html.includes(text),`Unverified claim: ${text}`);
 revision=2;page=await read();assert.ok(page.html.includes('Managed project 2')&&page.html.includes('Managed news 2'),'Managed homepage feeds must refresh');
 assert.ok((await read('/programmes')).html.includes('Managed project 2'));
 assert.ok((await read('/programmes/real-project')).html.includes('Managed project body'));assert.ok((await read('/updates/real-news')).html.includes('Managed news body'));assert.equal((await read('/updates/unknown')).status,404);
 empty=true;page=await read();assert.ok(page.html.includes('Our Programmes &amp; Priorities')&&page.html.includes('Progress Reports &amp; Updates'));assert.ok(!page.html.includes('Managed project'));
 await new Promise(r=>api.close(r));page=await read();assert.equal(page.status,200);assert.ok(page.html.includes('Human Rights Protection Foundation Pakistan')&&page.html.includes('Access to Information')&&page.html.includes('Progress Report 2025'),'Source content remains visible without backend');
 assert.ok(requests.every(r=>r.cookie===undefined),'Public reads must not forward cookies');
 console.log('Homepage checks passed: sourced copy/photos, excluded placeholders, managed feeds/details, fresh updates, empty/offline source cards and cookie isolation.');
}finally{if(api.listening)await new Promise(r=>api.close(r));if(child.exitCode===null){child.kill('SIGTERM');await once(child,'exit');}}
