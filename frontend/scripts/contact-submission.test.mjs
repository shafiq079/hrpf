import test from 'node:test';
import assert from 'node:assert/strict';
import { ContactRequestError, newContactAttempt, submitContact } from '../lib/contact-submission.ts';
const data={name:' Test ',email:'USER@example.org ',phone:'',organization:'',inquiryType:'General',subject:' Test subject ',message:'Original private message',consent:true};
const reference='HRPF-MSG-'+'a'.repeat(24);
test('lost contact response retries exact original data/key/ticket even after expiry',async()=>{
 const attempt=newContactAttempt();const payloads=[];let sessions=0;
 const request=async(path,options)=>{
  assert.equal(options.credentials,'omit');assert.equal(options.cache,'no-store');
  if(path==='/api/forms/session'){sessions++;assert.equal(JSON.parse(options.body).purpose,'contact');return Response.json({data:{ticket:'t'.repeat(43),expiresIn:900}});}
  assert.equal(path,'/api/contact-messages');payloads.push(options.body);
  if(payloads.length===1)throw new Error('Lost saved response');
  return Response.json({data:{status:'received',reference}});
 };
 await assert.rejects(submitContact(data,attempt,'synthetic-token',request),/Retry this same/);
 attempt.expiresAt=0;
 assert.equal((await submitContact({...data,message:'Edited after network loss'},attempt,'',request)).reference,reference);
 assert.equal(sessions,1);assert.equal(payloads[0],payloads[1]);
 const stored=JSON.parse(payloads[1]);assert.equal(stored.message,data.message);assert.equal(stored.email,'user@example.org');assert.equal(stored.phone,undefined);assert.equal(stored.organization,undefined);
});
test('contact validates confirmation shape and preserves attempts on ambiguous responses',async()=>{
 const attempt=newContactAttempt();let session=0;
 const request=async(path)=>path.includes('session')?(session++,Response.json({data:{ticket:'t'.repeat(43),expiresIn:900}})):Response.json({data:{status:'received'}});
 await assert.rejects(submitContact(data,attempt,'token',request),/could not be confirmed/);
 await assert.rejects(submitContact(data,attempt,'',request),/could not be confirmed/);
 assert.equal(session,1);assert.ok(attempt.payload);
});
test('contact surfaces verification failures without claiming receipt',async()=>{
 await assert.rejects(submitContact(data,newContactAttempt(),'',async()=>{throw Error('must not request');}),/Complete the security/);
 const request=async()=>Response.json({error:{code:'BOT_VERIFICATION_FAILED',message:'Complete verification'}},{status:403});
 await assert.rejects(submitContact(data,newContactAttempt(),'token',request),e=>e instanceof ContactRequestError&&e.code==='BOT_VERIFICATION_FAILED'&&e.status===403);
});
