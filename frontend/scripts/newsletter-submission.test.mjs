import test from 'node:test';
import assert from 'node:assert/strict';
import { newContactAttempt } from '../lib/contact-submission.ts';
import { submitNewsletter, NewsletterRequestError } from '../lib/newsletter-submission.ts';
test('newsletter lost-response retries preserve the email, consent, ticket and submission key', async () => {
 const attempt = newContactAttempt(), payloads = []; let sessions = 0;
 const request = async (path, options) => {
  assert.equal(options.credentials, 'omit'); assert.equal(options.cache, 'no-store');
  if (path === '/api/forms/session') { sessions++; assert.equal(JSON.parse(options.body).purpose, 'newsletter'); return Response.json({data:{ticket:'t'.repeat(43),expiresIn:900}}); }
  assert.equal(path, '/api/newsletter/subscriptions'); payloads.push(options.body);
  if (payloads.length === 1) throw new Error('lost reply');
  return Response.json({data:{status:'accepted'}},{status:202});
 };
 await assert.rejects(submitNewsletter(' EMAIL@example.org ', true, attempt, 'token', request));
 attempt.expiresAt = 0;
 assert.equal((await submitNewsletter('changed@example.org', false, attempt, '', request)).status, 'accepted');
 assert.equal(sessions, 1); assert.equal(payloads[0], payloads[1]);
 assert.equal(JSON.parse(payloads[0]).email, 'email@example.org'); assert.equal(JSON.parse(payloads[0]).consent, true);
});
test('newsletter does not claim success on failed or malformed verification/subscription responses', async () => {
 await assert.rejects(submitNewsletter('email@example.org',true,newContactAttempt(),'',async()=>{throw Error('must not request');}),/Complete the security/);
 const request = async path => path.includes('/session') ? Response.json({data:{ticket:'t'.repeat(43),expiresIn:900}}) : Response.json({error:{code:'DEPENDENCY_UNAVAILABLE',message:'Unavailable'}},{status:503});
 await assert.rejects(submitNewsletter('email@example.org',true,newContactAttempt(),'token',request),e=>e instanceof NewsletterRequestError && e.status===503);
 const malformed = async path => path.includes('/session') ? Response.json({data:{ticket:'t'.repeat(43),expiresIn:900}}) : Response.json({data:{status:'confirmed'}});
 await assert.rejects(submitNewsletter('email@example.org',true,newContactAttempt(),'token',malformed),/could not be confirmed/);
});
