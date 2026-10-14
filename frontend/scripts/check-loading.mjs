import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
// Optional browser test: provide Playwright and a Chromium executable.
const {chromium:playwright}=await import(process.env.HRPF_PLAYWRIGHT_MODULE || 'playwright');
const browserArgs=process.env.HRPF_CHROMIUM_MODULE ? (await import(process.env.HRPF_CHROMIUM_MODULE)).default.args : [];
const executablePath=process.env.HRPF_BROWSER_EXECUTABLE;
const frontend=new URL('..',import.meta.url);
let failContact=true, uploadNumber=0, submissions=0, failProjects=false;
const project={title:'Synthetic managed project',slug:'fixture',summary:'Synthetic public project',focusArea:'Women’s Rights',workAreas:['womens-rights'],status:'Ongoing',location:'Pakistan',startYear:2026,image:null,blocks:[]};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const api=createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 const body=[];for await(const chunk of req)body.push(chunk);
 res.setHeader('Content-Type','application/json');
 if(path==='/api/projects') {await delay(1800);if(failProjects){res.statusCode=503;res.end('{}');return;}res.end(JSON.stringify({data:[project],meta:{page:1,pages:1}}));}
 else if(path==='/api/forms/session') {await delay(600);if(failContact&&Buffer.concat(body).toString().includes('contact')){res.statusCode=403;res.end(JSON.stringify({error:{code:'ORIGIN_NOT_ALLOWED',message:'Request origin is not allowed.'}}));return;}res.end(JSON.stringify({data:{ticket:'fixture-ticket',expiresIn:600}}));}
 else if(path==='/api/contact-messages') {await delay(1200);res.end(JSON.stringify({data:{status:'received',reference:'HRPF-MSG-012345678901234567890123'}}));}
 else if(path==='/api/form-uploads') {uploadNumber++;await delay(1100);res.end(JSON.stringify({data:{assetId:String(uploadNumber).padStart(24,'0')}}));}
 else if(path==='/api/complaints') {submissions++;await delay(1100);res.end(JSON.stringify({data:{status:'received',reference:'HRPF-TEST-012345678901234567890123'}}));}
 else if(path.startsWith('/api/'))res.end(JSON.stringify({data:[],meta:{page:1,pages:0}}));
 else {res.statusCode=404;res.end('{}');}
});
api.listen(5000,'127.0.0.1');await once(api,'listening');
const reserve=createServer();reserve.listen(0,'127.0.0.1');await once(reserve,'listening');const port=reserve.address().port;await new Promise(resolve=>reserve.close(resolve));
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{cwd:frontend,env:{...process.env,INTERNAL_API_URL:'http://127.0.0.1:5000'},stdio:['ignore','pipe','pipe']});
let logs='';child.stdout.on('data',chunk=>logs+=chunk);child.stderr.on('data',chunk=>logs+=chunk);
let browser;
try {
 const deadline=Date.now()+20000;
 while(true){try{await fetch(`http://127.0.0.1:${port}/contact`);break;}catch{if(Date.now()>deadline||child.exitCode!==null)throw new Error(logs);await delay(100);}}
 browser=await playwright.launch({executablePath,args:browserArgs,headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:800}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://challenges.cloudflare.com/**',route=>route.fulfill({contentType:'application/javascript',body:'window.turnstile={render:(element,options)=>{setTimeout(()=>options.callback("synthetic-verification"),10);return "synthetic-widget"},remove:()=>{}};'}));
 await page.route('https://cdn.gtranslate.net/**',route=>route.abort());
 await page.route('**/*',route=>route.request().headers()['next-router-prefetch']==='1'?route.abort():route.fallback());
 await page.goto(`http://127.0.0.1:${port}/contact`);
 await page.getByRole('button',{name:'Send message',exact:true}).click();
 await page.getByText('Enter your name using up to 150 characters.',{exact:true}).waitFor(); await page.locator('#contact-name').fill('Synthetic visitor');
 const cdp=await context.newCDPSession(page);
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:350,downloadThroughput:150000,uploadThroughput:100000});
 const link=page.locator('header a[href="/projects"]').first();
 await page.evaluate(()=>{window.loadingSeen={bar:false,skeleton:false};new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.matches('.hrpf-navigation-progress')||node.querySelector('.hrpf-navigation-progress'))window.loadingSeen.bar=true;if(node.matches('[data-page-loading]')||node.querySelector('[data-page-loading]'))window.loadingSeen.skeleton=true;}}).observe(document.body,{subtree:true,childList:true});}); await link.click();
 await page.waitForFunction(()=>window.loadingSeen.bar && window.loadingSeen.skeleton,undefined,{timeout:10000});
 await page.locator('text=Synthetic managed project').first().waitFor({state:'visible',timeout:15000});
 await page.locator('.hrpf-navigation-progress').waitFor({state:'hidden'});
 console.log('PASS: throttled navigation shows progress and skeletons before real project content, then clears.');
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
 await page.goto(`http://127.0.0.1:${port}/contact`);
 await page.locator('form').filter({has:page.locator('#contact-name')}).getByRole('button',{name:'Send message'}).click();
 assert.equal(await page.locator('dialog[open]').count(),0);
 await page.locator('#contact-name').fill('Synthetic visitor');
 await page.locator('#contact-email').fill('visitor@example.test');
 await page.locator('#contact-subject').fill('Synthetic test');
 await page.locator('#contact-message').fill('Synthetic test message.');
 await page.locator('#contact-consent').check();
 await page.waitForTimeout(100);
 await page.getByRole('button',{name:'Send message',exact:true}).click();
 const dialog=page.locator('dialog[open]');await dialog.waitFor({state:'visible'});
 assert.equal(await dialog.getAttribute('aria-modal'),'true');
 const box=await dialog.boundingBox();assert.equal(box.width,1280);assert.equal(box.height,800);
 assert.equal(await dialog.locator('[role="progressbar"]').getAttribute('aria-valuenow'),null);
 await page.keyboard.press('Escape');assert.equal(await dialog.count(),1);
 await dialog.waitFor({state:'hidden'});
 await page.locator('[data-sonner-toast]').filter({hasText:'Request origin is not allowed.'}).waitFor();
 assert.equal(await page.locator('#contact-name').inputValue(),'Synthetic visitor');
 console.log('PASS: invalid fields stay inline; submission uses a full-screen modal; Escape does not interrupt it; failed verification preserves answers and shows a toast.');
 failContact=false;
 await page.getByRole('button',{name:'Send message',exact:true}).click();
 await dialog.waitFor({state:'visible'});await dialog.waitFor({state:'hidden'});
 await page.getByText('HRPF-MSG-012345678901234567890123',{exact:true}).waitFor();
 assert.equal(await page.locator('[role="status"][tabindex="-1"]').evaluate(node=>node===document.activeElement),true);
 console.log('PASS: retry succeeds, closes the overlay and focuses the receipt/reference.');
 await page.setViewportSize({width:390,height:844});
 await page.goto(`http://127.0.0.1:${port}/file-a-complaint`);
 for(const [id,value] of Object.entries({name:'Synthetic visitor',fatherName:'Synthetic parent',cnic:'1234512345671',email:'visitor@example.test',phone:'03001234567',district:'Synthetic district',address:'Synthetic address'}))await page.locator('#'+id).fill(value);
 await page.locator('#province').selectOption({label:'Punjab'});
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.locator('#category').selectOption({label:'Other'});
 await page.locator('#description').fill('Synthetic complaint for testing submission progress.');
 const files=page.locator('input[type="file"]');
 await files.nth(0).setInputFiles({name:'proof.png',mimeType:'image/png',buffer:Buffer.from('synthetic')});
 await files.nth(1).setInputFiles({name:'complaint.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF synthetic')});
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.locator('#consent').check();
 const submit=page.getByRole('button',{name:'Submit complaint',exact:true});await submit.waitFor();await page.waitForTimeout(100);await submit.click();
 await dialog.waitFor({state:'visible'});
 await dialog.getByText('Checking and uploading file 1 of 2…',{exact:true}).waitFor();
 const mobileBox=await dialog.boundingBox();assert.equal(mobileBox.width,390);assert.equal(mobileBox.height,844);
 if(process.env.HRPF_LOADING_SCREENSHOT)await page.screenshot({path:process.env.HRPF_LOADING_SCREENSHOT});
 await dialog.getByText('Checking and uploading file 2 of 2…',{exact:true}).waitFor();
 await dialog.getByText('Saving your complaint and queuing both email copies…',{exact:true}).waitFor();
 await dialog.waitFor({state:'hidden'});await page.getByText('HRPF-TEST-012345678901234567890123',{exact:true}).waitFor();
 assert.equal(uploadNumber,2);assert.equal(submissions,1);
 console.log('PASS: mobile overlay displays both real upload stages, saves once and shows receipt.');
 failProjects=true;
 await page.goto(`http://127.0.0.1:${port}/projects`);
 await page.getByText('Projects could not be loaded. Please try again later.',{exact:false}).waitFor();
 failProjects=false;
 await page.getByRole('button',{name:'Try again',exact:true}).click();
 await page.getByText('Synthetic managed project',{exact:true}).first().waitFor();
 await page.locator('.hrpf-navigation-progress').waitFor({state:'hidden'});
 console.log('PASS: an unavailable collection can be retried successfully without stale loading feedback.');
 assert.deepEqual(errors,[]);
 console.log('PASS: no browser JavaScript errors.');
} finally {await browser?.close();child.kill('SIGTERM');api.close();}
