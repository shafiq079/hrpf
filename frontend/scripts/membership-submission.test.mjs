import test from 'node:test';
import assert from 'node:assert/strict';
import { newMembershipAttempt, submitMembership } from '../lib/membership-submission.ts';
import { emptyAnswers, feeChoices, amountPKR, validateApplication } from '../lib/membership-registration.ts';
const data={...emptyAnswers(),email:'applicant@example.org',name:'Test applicant',fatherName:'Test parent',gmailId:'other@example.org',dateOfBirth:'2000-01-01',gender:'Other',phone:'03001234567 / 03007654321',address:'Address, city and district',interests:['Other'],availability:['Other'],availabilityOther:'Weekends',emergencyContact:'Contact and number',fees:[...feeChoices],paymentMethod:'JazzCash',certification:'No'};
const picture=()=>new File(['synthetic bytes'],'picture.png',{type:'image/png'});
const files=()=>({cnic:[picture(),picture()],photo:[picture()],payment:[picture()],police:[new File(['%PDF synthetic'],'police.pdf',{type:'application/pdf'})]});
test('membership retains source choices, optional fields, file limits and non-additive total fees',()=>{
 assert.deepEqual(validateApplication(data,files(),['Bank transfer','JazzCash']),{});
 assert.equal(amountPKR([...feeChoices]),5000);assert.equal(amountPKR([feeChoices[0]]),2000);assert.equal(amountPKR([feeChoices[1]]),3000);
 assert.ok(validateApplication({...data,availabilityOther:''},files(),['JazzCash']).availabilityOther);
 assert.ok(validateApplication(data,{...files(),cnic:Array.from({length:6},picture)},['JazzCash']).cnic);
 assert.ok(validateApplication(data,{...files(),payment:[new File(['%PDF'],'proof.pdf',{type:'application/pdf'})]},['JazzCash']).payment);
 assert.ok(validateApplication({...data,email:''},files(),['JazzCash']).email);
});
test('lost membership receipt retries the original answers/key/ticket without another upload or email',async()=>{
 const attempt=newMembershipAttempt(),attachments=files(),payloads=[];let sessions=0,uploads=0;
 const request=async(path,options)=>{
  assert.equal(options.credentials,'omit');assert.equal(options.cache,'no-store');
  if(path==='/api/forms/session'){sessions++;assert.equal(JSON.parse(options.body).purpose,'membership_registration');return Response.json({data:{ticket:'t'.repeat(43),expiresIn:900}});}
  if(path.includes('form-uploads')){uploads++;assert.ok(options.headers['X-Upload-Key']);return Response.json({data:{assetId:String(uploads).padStart(24,'0')}});}
  payloads.push(options.body);if(payloads.length===1)throw Error('Lost receipt');return Response.json({data:{reference:'HRPF-VR-2026-000001',status:'received'}});
 };
 await assert.rejects(submitMembership(data,attachments,attempt,'token',()=>{},request),/Retry this same/);
 attempt.expiresAt=0;
 const result=await submitMembership({...data,name:'Changed'},attachments,attempt,'',()=>{},request);
 assert.equal(result.reference,'HRPF-VR-2026-000001');assert.equal(sessions,1);assert.equal(uploads,5);assert.equal(payloads[0],payloads[1]);
 const saved=JSON.parse(payloads[1]);assert.equal(saved.answers.name,data.name);assert.equal(saved.answers.certification,'No');assert.equal(saved.cnicImageIds.length,2);assert.equal(saved.policeCertificateIds.length,1);
});
test('an interrupted upload retries its original upload key and reuses completed files',async()=>{
 const attempt=newMembershipAttempt(),attachments=files(),keys=[];let uploads=0;
 const request=async(path,options)=>{
  if(path.includes('session'))return Response.json({data:{ticket:'t'.repeat(43),expiresIn:900}});
  if(path.includes('uploads')){uploads++;keys.push(options.headers['X-Upload-Key']);if(uploads===2)throw Error('Lost upload response');return Response.json({data:{assetId:String(uploads).padStart(24,'0')}});}
  return Response.json({data:{reference:'HRPF-VR-2026-000001',status:'received'}});
 };
 await assert.rejects(submitMembership(data,attachments,attempt,'token',()=>{},request),/Retry this same/);
 assert.equal(attempt.submissionStarted,false);
 await submitMembership(data,attachments,attempt,'',()=>{},request);
 assert.equal(keys[1],keys[2]);assert.equal(uploads,6);
});
