import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newComplaintAttempt, submitComplaint, validateComplaintFiles } from '../lib/complaint-submission.ts';
const data = { name:'Synthetic person',fatherName:'Synthetic parent',cnic:'12345-1234567-1',email:'applicant@example.org',phone:'03001234567',province:'Punjab',district:'Synthetic district',address:'Synthetic address',category:'Other',description:'Synthetic complete complaint',priorProceedings:true,priorProceedingsDetails:'Synthetic institution and decision',consent:true };
const png = () => new File(['synthetic image'],'proof.png',{type:'image/png'});
const pdf = name => new File(['%PDF synthetic fixture'],name,{type:'application/pdf'});
const files = () => ({cnicImage:png(),complaintDocument:pdf('complaint.pdf'),decisions:[pdf('decision.pdf')],evidence:[png()]});
const response = value => new Response(JSON.stringify({data:value}),{status:201,headers:{'Content-Type':'application/json'}});
test('lost upload and submission responses reuse stable keys and the exact original form', async () => {
 const attempt=newComplaintAttempt(), documents=files(), uploaded=new Map(), submitted=new Map(), calls=[];
 let lostUpload=true,lostSubmission=true, sessions=0;
 const transport=async(path,options)=>{
  calls.push({path,options}); assert.equal(options.credentials,'omit');
  if(path==='/api/forms/session'){sessions++;return response({ticket:'t'.repeat(43),expiresIn:900});}
  if(path.includes('form-uploads')){
   const key=options.headers['X-Upload-Key']; assert.match(key,/^[a-f0-9-]{36}$/);
   if(!uploaded.has(key))uploaded.set(key,String(uploaded.size+1).padStart(24,'0'));
   if(lostUpload){lostUpload=false;throw new Error('Synthetic dropped upload response');}
   return response({assetId:uploaded.get(key)});
  }
  if(path==='/api/complaints'){
   const body=JSON.parse(options.body); if(submitted.has(body.submissionKey))assert.equal(submitted.get(body.submissionKey),options.body);else submitted.set(body.submissionKey,options.body);
   if(lostSubmission){lostSubmission=false;throw new Error('Synthetic dropped submission response');}
   return response({reference:'HRPF-C-TEST-000001',status:'received'});
  }
  throw new Error('Unexpected route');
 };
 await assert.rejects(submitComplaint(data,documents,attempt,'bot-token',()=>{},transport));
 assert.equal(attempt.submissionStarted,false);
 await assert.rejects(submitComplaint(data,documents,attempt,'',()=>{},transport));
 assert.equal(attempt.submissionStarted,true);
 const result=await submitComplaint({...data,description:'Must not replace the locked payload'},documents,attempt,'',()=>{},transport);
 assert.equal(result.reference,'HRPF-C-TEST-000001');assert.equal(sessions,1);assert.equal(uploaded.size,4);assert.equal(submitted.size,1);
 const body=JSON.parse([...submitted.values()][0]);assert.equal(body.description,data.description);assert.equal(body.cnic,'1234512345671');assert.equal(body.priorProceedingsDetails,data.priorProceedingsDetails);assert.equal(body.decisionDocumentIds.length,1);assert.equal(body.attachmentIds.length,1);assert.equal(body.consentVersion,'complaint-v1');assert.ok(!Object.hasOwn(body,'botToken'));
 assert.equal(calls.filter(call=>call.path.includes('form-uploads')).length,5);
});
test('file validation enforces required identity image, supported formats, counts and email size budget',()=>{
 assert.equal(validateComplaintFiles(files()),'');
 assert.match(validateComplaintFiles({...files(),cnicImage:null}),/CNIC image/);
 assert.match(validateComplaintFiles({...files(),cnicImage:pdf('identity.pdf')}),/must be a/);
 assert.match(validateComplaintFiles({...files(),evidence:[png(),png(),png()]}),/five files/);
 assert.match(validateComplaintFiles({...files(),complaintDocument:new File(['x'],'run.exe',{type:'application/octet-stream'})}),/JPG/);
 const large=new File([new Uint8Array(8*1024*1024)],'large.pdf',{type:'application/pdf'});
 assert.match(validateComplaintFiles({...files(),complaintDocument:large,decisions:[large]}),/15 MB/);
});
test('unsubmitted expired sessions require fresh verification and do not reuse old upload claims',async()=>{
 const attempt=newComplaintAttempt();attempt.ticket='old';attempt.expiresAt=0;attempt.uploads.set(png(),'old-asset');
 await assert.rejects(submitComplaint(data,files(),attempt,'',()=>{}),/verification/);assert.equal(attempt.submissionStarted,false);
});
