import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { createClient } from 'redis';
import request from 'supertest';
import express from 'express';
import { unavailable } from '../src/http/errors.js';
import { createApp } from '../src/app.js';
import { parseEnv } from '../src/config/env.js';
import { Asset, AuditLog, Project, BlogPost, BoardMember, GalleryItem, VideoInterview, Report, Certificate, AuthSession, Complaint, ContactMessage, Counter, EmailOutbox, FormTicket, MembershipApplication, Setting, User, ensureIndexes, roles, type Role } from '../src/domain/models.js';
import { createRedisServices } from '../src/infrastructure/redis-services.js';
import { digest, hashPassword } from '../src/security/crypto.js';
import { createOutbox, startOutboxWorker, type Mail } from '../src/services/outbox.js';
import { createForms } from '../src/services/forms.js';
import { createUploads, MB, type UploadProvider } from '../src/services/uploads.js';
const env = parseEnv({ NODE_ENV: 'test', JWT_ACCESS_SECRET: 'a'.repeat(64), JWT_REFRESH_SECRET: 'b'.repeat(64), DATA_ENCRYPTION_KEY: 'ab'.repeat(32), CNIC_HASH_KEY: 'c'.repeat(64), REDIS_URL: process.env.TEST_REDIS_URL!, ADMIN_NOTIFY_EMAILS: 'admin@example.org', FRONTEND_URL: 'http://localhost:3000', SMTP_HOST: 'test.invalid', MAIL_FROM: 'no-reply@example.org' });
const redis = createClient({ url: env.REDIS_URL }); redis.on('error', () => {});
const services = createRedisServices(redis, 'hrpf-test');
let mongo: MongoMemoryReplSet, passwordHash: string, app: ReturnType<typeof createApp>, providerReads = 0;
let scan: 'clean' | 'infected' | 'unavailable' = 'clean';
const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF');
// Valid tiny PNG. These fixture bytes are synthetic and are never sent to Cloudinary.
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1sAAAAASUVORK5CYII=', 'base64');
const provider: UploadProvider = {
  async store(upload, folder, format) { return { publicId: `${folder}/${randomUUID()}`, resourceType: upload.mime === 'application/pdf' ? 'raw' : 'image', deliveryType: 'authenticated', bytes: upload.bytes.length, format, version: 1 }; },
  async remove() {},
  async read(asset) { providerReads++; return new Response(asset.resourceType === 'image' ? png : pdf); },
};
const bot = async (value: string) => value === 'verified-test-token';
const scanner = async () => { if (scan === 'unavailable') throw unavailable(); return scan; };
const personal = { name: 'Synthetic test', fatherName: 'Synthetic parent', email: 'applicant@example.org', phone: '03001234567', province: 'Test province', district: 'Test district', address: 'Test address' };
const complaintBody = (ticket: string, cnic: string, document: string) => ({ ...personal, ticket, submissionKey: randomUUID(), consent: true, consentVersion: 'test-v1', cnic: '1234512345671', cnicImageId: cnic, complaintDocumentId: document, category: 'Test category', description: 'Synthetic integration test complaint', priorProceedings: false });
async function login(role: Role = 'super_admin') {
  const user = await User.create({ name: 'Test administrator', email: `${randomUUID()}@example.org`, passwordHash, role });
  const agent = request.agent(app);
  const csrf = await agent.get('/api/auth/csrf').expect(200);
  const result = await agent.post('/api/auth/login').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', csrf.body.data.csrfToken).send({ email: user.email, password: 'Test-password-long' }).expect(200);
  return { agent, csrf: result.body.data.csrfToken as string, user, result };
}
async function form(purpose: 'complaint' | 'membership' | 'contact' = 'complaint') {
  const response = await request(app).post('/api/forms/session').send({ purpose, botToken: 'verified-test-token' }).expect(201);
  return response.body.data.ticket as string;
}
async function upload(ticket: string, bytes = png, purpose = 'complaint', filename = 'proof.png') {
  const response = await request(app).post(`/api/form-uploads?purpose=${purpose}`).set('X-Form-Ticket', ticket).attach('file', bytes, { filename, contentType: filename.endsWith('.pdf') ? 'application/pdf' : 'image/png' }).expect(201);
  return response.body.data.assetId as string;
}
async function waitFor(check: () => Promise<boolean>) {
  const limit = Date.now() + 15000;
  while (Date.now() < limit) { if (await check()) return; await new Promise(resolve => setTimeout(resolve, 50)); }
  throw new Error('Timed out waiting for durable worker result');
}
describe('M2 real Mongo replica-set and Redis integration', { timeout: 180000 }, () => {
  before(async () => {
    mongo = await MongoMemoryReplSet.create({ binary: { version: '8.0.5' }, replSet: { count: 1 }, instanceOpts: [{ args: ['--nounixsocket', '--setParameter', 'diagnosticDataCollectionEnabled=false'] }] });
    mongoose.set('bufferCommands', false); mongoose.set('sanitizeFilter', false);
    await mongoose.connect(mongo.getUri(), { dbName: `hrpf_test_${randomUUID().replaceAll('-', '')}`, autoIndex: false });
    await ensureIndexes(); await redis.connect(); passwordHash = await hashPassword('Test-password-long');
    app = createApp(env, async () => ({ mongo: true, redis: true }), { redis: services, bot, scanner, provider });
  });
  after(async () => { if (redis.isOpen) await redis.quit(); await mongoose.disconnect(); if (mongo) await mongo.stop(); });
  beforeEach(async () => {
    for (const model of Object.values(mongoose.models)) await model.deleteMany({});
    await redis.flushDb(); scan = 'clean'; providerReads = 0;
  });
  it('login, rotation and refresh replay revoke the whole family immediately', async () => {
    const auth = await login();
    assert.equal(auth.result.body.data.user.role, 'super_admin');
    assert.ok(!JSON.stringify(auth.result.body).includes('passwordHash'));
    await auth.agent.get('/api/auth/me').expect(200);
    const originalCookies = (auth.result.headers['set-cookie'] as unknown as string[]).map(v => v.split(';')[0]).join('; ');
    const rotated = await auth.agent.post('/api/auth/refresh').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', auth.csrf).send({}).expect(200);
    assert.notEqual(rotated.body.data.csrfToken, auth.csrf);
    await request(app).post('/api/auth/refresh').set('Origin', 'http://localhost:3000').set('Cookie', originalCookies).set('X-CSRF-Token', auth.csrf).send({}).expect(401);
    await auth.agent.get('/api/auth/me').expect(401);
    assert.equal(await AuthSession.countDocuments({ revokedAt: null }), 0);
  });
  it('current DB roles are enforced; last-super-admin and optimistic versions are protected', async () => {
    const superAuth = await login();
    const editor = await login('editor');
    await editor.agent.get('/api/admin/users').expect(403);
    await superAuth.agent.patch(`/api/admin/users/${superAuth.user.id}`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', superAuth.csrf).send({ version: 0, active: false }).expect(409);
    await superAuth.agent.patch(`/api/admin/users/${editor.user.id}`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', superAuth.csrf).send({ version: 0, active: false }).expect(200);
    await editor.agent.get('/api/auth/me').expect(401);
    await superAuth.agent.patch(`/api/admin/users/${editor.user.id}`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', superAuth.csrf).send({ version: 0, active: true }).expect(409);
    assert.equal(await User.countDocuments({ role: 'super_admin', active: true }), 1);
  });
  it('concurrent super-admin removal cannot remove both remaining administrators', async () => {
    const one = await login(), two = await login();
    const responses = await Promise.all([
      one.agent.patch(`/api/admin/users/${one.user.id}`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', one.csrf).send({ version: 0, active: false }),
      two.agent.patch(`/api/admin/users/${two.user.id}`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', two.csrf).send({ version: 0, active: false }),
    ]);
    assert.deepEqual(responses.map(v => v.status).sort(), [200, 409]);
    assert.equal(await User.countDocuments({ role: 'super_admin', active: true }), 1);
  });
  it('bot verification, ticket purpose, expiry and membership policy fail closed', async () => {
    await request(app).post('/api/forms/session').send({ purpose: 'contact', botToken: 'fake' }).expect(403);
    await request(app).post('/api/forms/session').send({ purpose: 'membership', botToken: 'verified-test-token' }).expect(503);
    const ticket = await form('contact');
    await request(app).post('/api/form-uploads?purpose=complaint').set('X-Form-Ticket', ticket).attach('file', png, 'proof.png').expect(403);
    await FormTicket.updateOne({ tokenHash: digest(ticket) }, { $set: { expiresAt: new Date(0) } });
    await request(app).post('/api/contact-messages').send({ ticket, submissionKey: randomUUID(), consent: true, consentVersion: 'test-v1', name: 'Test', email: 'test@example.org', subject: 'Test', message: 'Test' }).expect(403);
  });
  it('uploads reject spoofing, malware, unavailable scanning and enforce ticket quotas', async () => {
    const ticket = await form();
    await request(app).post('/api/form-uploads?purpose=complaint').set('X-Form-Ticket', ticket).attach('file', pdf, { filename: 'image.png', contentType: 'image/png' }).expect(400);
    scan = 'infected';
    await request(app).post('/api/form-uploads?purpose=complaint').set('X-Form-Ticket', ticket).attach('file', png, 'proof.png').expect(400);
    scan = 'unavailable';
    await request(app).post('/api/form-uploads?purpose=complaint').set('X-Form-Ticket', ticket).attach('file', png, 'proof.png').expect(503);
    assert.equal(await Asset.countDocuments(), 0);
    scan = 'clean';
    await FormTicket.updateOne({ tokenHash: digest(ticket) }, { $set: { uploadCount: 5 } });
    await request(app).post('/api/form-uploads?purpose=complaint').set('X-Form-Ticket', ticket).attach('file', png, 'proof.png').expect(400);
  });
  it('complaints commit identity encryption, all asset claims, counter and two outbox entries atomically', async () => {
    const ticket = await form(), cnic = await upload(ticket), document = await upload(ticket, pdf, 'complaint', 'complaint.pdf');
    const body = complaintBody(ticket, cnic, document);
    const responses = await Promise.all([request(app).post('/api/complaints').send(body), request(app).post('/api/complaints').send(body)]);
    assert.deepEqual(responses.map(v => v.status), [201, 201]);
    assert.equal(responses[0]!.body.data.reference, responses[1]!.body.data.reference);
    assert.match(responses[0]!.body.data.reference, /^HRPF-C-\d{4}-000001$/);
    assert.equal(await Complaint.countDocuments(), 1); assert.equal(await EmailOutbox.countDocuments(), 2);
    assert.equal(await Asset.countDocuments({ claimStatus: 'claimed' }), 2);
    assert.equal((await Counter.findOne({ key: `C:${new Date().getUTCFullYear()}` }))!.sequence, 1);
    const stored = await Complaint.findOne().select('+encryptedCNIC +cnicHash');
    assert.ok(stored!.encryptedCNIC && !stored!.encryptedCNIC.includes(body.cnic));
    assert.ok(!JSON.stringify(responses[0]!.body).includes('cnic'));
    await redis.flushDb(); // The saved ticket rehydrates Redis without creating a second submission.
    await request(app).post('/api/complaints').send(body).expect(201);
    await request(app).post('/api/complaints').send({ ...body, description: 'Different body' }).expect(409);
    await request(app).post('/api/complaints').send({ ...body, submissionKey: randomUUID() }).expect(403);
  });
  it('different concurrent complaints allocate distinct sequential references', async () => {
    const one = await form(), two = await form();
    const a = complaintBody(one, await upload(one), await upload(one, pdf, 'complaint', 'complaint.pdf'));
    const b = complaintBody(two, await upload(two), await upload(two, pdf, 'complaint', 'complaint.pdf'));
    const responses = await Promise.all([request(app).post('/api/complaints').send(a), request(app).post('/api/complaints').send(b)]);
    assert.deepEqual(responses.map(v => v.status), [201, 201]);
    assert.equal(new Set(responses.map(v => v.body.data.reference)).size, 2);
    assert.equal(await Complaint.countDocuments(), 2);
    assert.equal(await EmailOutbox.countDocuments(), 4);
  });
  it('foreign assets cause rollback without consuming the ticket or leaving a counter/outbox', async () => {
    const ticket = await form(), other = await form(), cnic = await upload(ticket), foreign = await upload(other, pdf, 'complaint', 'complaint.pdf');
    const body = complaintBody(ticket, cnic, foreign);
    await request(app).post('/api/complaints').send(body).expect(400);
    assert.equal(await Complaint.countDocuments(), 0); assert.equal(await EmailOutbox.countDocuments(), 0); assert.equal(await Counter.countDocuments(), 0);
    assert.equal(await Asset.countDocuments({ claimStatus: 'claimed' }), 0);
    assert.equal((await FormTicket.findOne({ tokenHash: digest(ticket) }))!.consumedAt, undefined);
  });
  it('membership records the configured fee snapshot and unverified payment, without creating a member', async () => {
    await Setting.create({ key: 'membershipPolicy', value: { enabled: true, version: 'synthetic-test-policy', currency: 'PKR', types: [{ key: 'test', amountPaisa: 100, validityMonths: 12 }] } });
    const ticket = await form('membership'), proof = await upload(ticket, pdf, 'membership', 'payment.pdf');
    const body = { ...personal, ticket, submissionKey: randomUUID(), consent: true, consentVersion: 'test-v1', membershipType: 'test', paymentReference: 'test-payment', paymentProofId: proof };
    const response = await request(app).post('/api/membership-applications').send(body).expect(201);
    assert.match(response.body.data.reference, /^HRPF-A-/);
    const application = await MembershipApplication.findOne();
    assert.equal(application!.feeSnapshot.amountPaisa, 100); assert.equal(application!.paymentStatus, 'unverified'); assert.equal(application!.status, 'pending');
    assert.equal(await mongoose.models.Member!.countDocuments(), 0);
    await request(app).post('/api/membership-applications').send(body).expect(201);
    assert.equal(await MembershipApplication.countDocuments(), 1);
  });
  it('restricted asset authorization happens before delivery and does not return provider URLs', async () => {
    const ticket = await form(), asset = await upload(ticket);
    await request(app).get(`/api/admin/assets/${asset}/content`).expect(401);
    const editor = await login('editor'); await editor.agent.get(`/api/admin/assets/${asset}/content`).expect(403);
    assert.equal(providerReads, 0);
    const manager = await login('case_manager');
    const response = await manager.agent.get(`/api/admin/assets/${asset}/content`).expect(200);
    assert.equal(providerReads, 1); assert.equal(response.headers['cache-control'], 'private, no-store');
    assert.equal(response.headers.location, undefined); assert.ok(response.headers['content-disposition']!.startsWith('attachment'));
  });
  it('Redis limits are shared across app instances and ignore spoofed forwarded IPs by default', async () => {
    const limiter = services.limit('shared-test', 2, 60000);
    const first = express(), second = express();
    for (const instance of [first, second]) { instance.set('trust proxy', false); instance.get('/limited', limiter, (_req, res) => res.json({ ok: true })); instance.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(error && typeof error === 'object' && 'status' in error ? Number(error.status) : 500).end()); }
    await request(first).get('/limited').set('X-Forwarded-For', '8.8.8.8').expect(200);
    await request(second).get('/limited').set('X-Forwarded-For', '1.1.1.1').expect(200);
    const blocked = await request(first).get('/limited').set('X-Forwarded-For', '9.9.9.9').expect(429);
    assert.ok(Number(blocked.headers['retry-after']) > 0);
    let calls = 0;
    assert.deepEqual(await services.publicCache('test', 30, async () => { calls++; return { title: 'Public' }; }), { title: 'Public' });
    await services.publicCache('test', 30, async () => { calls++; return { title: 'Changed' }; }); assert.equal(calls, 1);
    await services.invalidatePublic('test'); await services.publicCache('test', 30, async () => { calls++; return {}; }); assert.equal(calls, 2);
  });
  it('contact submission stays saved after email failure; leases and retries do not send successful entries twice', async () => {
    const ticket = await form('contact');
    const body = { ticket, submissionKey: randomUUID(), consent: true, consentVersion: 'test-v1', name: 'Test', email: 'test@example.org', subject: 'Test', message: 'Sensitive test message' };
    await request(app).post('/api/contact-messages').send(body).expect(201);
    assert.equal(await ContactMessage.countDocuments(), 1);
    const entries = await EmailOutbox.find(); const first = entries[0]!;
    await assert.rejects(createOutbox(env, async () => { throw new Error('private SMTP diagnostic'); }).deliver(first.id));
    assert.equal((await EmailOutbox.findById(first._id))!.errorCode, 'DELIVERY_UNAVAILABLE');
    const sent: Mail[] = [];
    const sender = createOutbox(env, async mail => { sent.push(mail); return 'test-provider-id'; });
    await EmailOutbox.updateOne({ _id: first._id }, { $set: { nextAttemptAt: new Date(0) } });
    await Promise.all([sender.deliver(first.id), sender.deliver(first.id)]);
    await sender.deliver(first.id); assert.equal(sent.length, 1); assert.ok(!sent[0]!.text.includes(body.message));
    assert.equal((await EmailOutbox.findById(first._id))!.status, 'sent');
  });
  it('BullMQ worker drains persisted pending entries using only outbox IDs', async () => {
    const entry = await EmailOutbox.create({ dedupeKey: 'queue-test', template: 'acknowledgement', entityType: 'Complaint', entityId: new Types.ObjectId().toString(), recipient: 'test@example.org', reference: 'TEST-ONLY' });
    const sent: Mail[] = [];
    const worker = await startOutboxWorker(env, async mail => { sent.push(mail); return 'test-id'; }, async () => {});
    try { await waitFor(async () => (await EmailOutbox.findById(entry._id))!.status === 'sent'); assert.equal(sent.length, 1); }
    finally { await worker.close(); }
  });
  it('password reset responses are indistinguishable; reset is single-use and revokes prior sessions', async () => {
    const auth = await login();
    const known = await auth.agent.post('/api/auth/forgot-password').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', auth.csrf).send({ email: auth.user.email }).expect(200);
    const unknown = await auth.agent.post('/api/auth/forgot-password').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', auth.csrf).send({ email: 'absent@example.org' }).expect(200);
    assert.deepEqual(known.body, unknown.body);
    const mails: Mail[] = []; const outbox = await EmailOutbox.findOne({ template: 'password-reset' });
    await createOutbox(env, async mail => { mails.push(mail); return 'reset-test'; }).deliver(outbox!.id);
    const value = /#token=([^\s]+)/.exec(mails[0]!.text)![1]!;
    await auth.agent.post('/api/auth/reset-password').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', auth.csrf).send({ token: value, password: 'Replacement-long-password' }).expect(200);
    const csrf = await auth.agent.get('/api/auth/csrf').expect(200);
    await auth.agent.post('/api/auth/reset-password').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', csrf.body.data.csrfToken).send({ token: value, password: 'Another-long-password' }).expect(400);
    assert.equal(await AuthSession.countDocuments({ revokedAt: null }), 0);
  });
  it('admin outbox diagnostics omit recipients/tokens; retry requires an authorized role', async () => {
    const entry = await EmailOutbox.create({ dedupeKey: 'failed-test', template: 'acknowledgement', entityType: 'Complaint', recipient: 'private@example.org', encryptedToken: 'private-token', status: 'failed', attempts: 8, errorCode: 'DELIVERY_UNAVAILABLE' });
    const editor = await login('editor');
    await editor.agent.get('/api/admin/outbox').expect(403);
    const admin = await login('admin');
    const response = await admin.agent.get('/api/admin/outbox').expect(200);
    assert.ok(!JSON.stringify(response.body).includes('private@example.org'));
    assert.ok(!JSON.stringify(response.body).includes('private-token'));
    await admin.agent.post(`/api/admin/outbox/${entry.id}/retry`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', admin.csrf).send({}).expect(200);
    assert.equal((await EmailOutbox.findById(entry.id))!.status, 'pending');
    await admin.agent.post(`/api/admin/outbox/${entry.id}/retry`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', admin.csrf).send({}).expect(409);
  });
  it('staged cleanup never deletes claimed assets', async () => {
    const ticket = await form(), asset = await upload(ticket);
    await Asset.updateOne({ _id: asset }, { $set: { stagingExpiresAt: new Date(0) } });
    const claimed = await Asset.create({ publicId: 'test-claimed', resourceType: 'raw', deliveryType: 'authenticated', format: 'pdf', bytes: 20, sha256: 'a'.repeat(64), purpose: 'complaint', claimStatus: 'claimed', scanStatus: 'clean', stagingExpiresAt: new Date(0) });
    const uploads = createUploads(env, createForms(services, bot), provider, scanner);
    await uploads.prune(); assert.equal(await Asset.countDocuments(), 1); assert.ok(await Asset.findById(claimed.id));
  });
  it('M4 public settings strip private fields and managed blogs respect publication', async () => {
    const { publicSettingSchemas } = await import('../src/http/public-content.js');
    const setting = await Setting.create({ key: 'contact', visibility: 'public', value: { address: 'Test address', postalCode: '50490', phone: '+923001234567', landline: '+92546123456', emails: ['test@example.org'], notificationEmails: ['private@example.org'], password: 'private-secret' } });
    await Setting.create({ key: 'smtp', visibility: 'public', value: { password: 'private-secret' } });
    assert.equal(publicSettingSchemas.contact.safeParse(setting.value).success, true);
    const settings = await request(app).get('/api/settings/public').expect(200);
    assert.deepEqual(Object.keys(settings.body.data), ['contact']);
    assert.ok(!JSON.stringify(settings.body).includes('private'));
    const page = await BlogPost.create({ slug: 'test-mission', locale: 'en', title: { en: 'Reviewed test mission' }, blocks: [{ type: 'paragraph', text: '<script>text, not markup</script>' }], sourceReferences: ['restricted source filename'] });
    await request(app).get('/api/blogs/test-mission').expect(404);
    const admin = await login('admin');
    await admin.agent.get('/api/admin/publication/page').expect(400);
    await request(app).get('/api/content/mission').expect(404);
    const review = await admin.agent.get('/api/admin/publication/setting').expect(200);
    assert.equal(review.body.data.length, 1); assert.ok(!JSON.stringify(review.body).includes('private-secret'));
    const auth = await login('editor');
    const release = (version: number, action = 'publish') => auth.agent.post(`/api/admin/publication/blog/${page.id}`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', auth.csrf).send({ version, action, releaseReviewed: true });
    await release(0).expect(200);
    const content = await request(app).get('/api/blogs/test-mission').expect(200);
    assert.equal(content.body.data.title, 'Reviewed test mission');
    assert.ok(!JSON.stringify(content.body).includes('restricted source'));
    await request(app).get('/api/blogs/test-mission?locale=ur').expect(404);
    await release(0, 'withdraw').expect(409);
    await release(1, 'withdraw').expect(200);
    await request(app).get('/api/blogs/test-mission').expect(404);
    assert.equal(await AuditLog.countDocuments({ action: { $in: ['publication.publish', 'publication.withdraw'] } }), 2);
  });
  it('M4 publication enforces role, CSRF and an explicit review attestation', async () => {
    const board = await BoardMember.create({ name: 'Synthetic board member', slug: 'synthetic-board', designation: 'Chair', rank: 1, isActive: false });
    const editor = await login('editor');
    await editor.agent.get('/api/admin/publication/board').expect(403);
    await editor.agent.post(`/api/admin/publication/board/${board.id}`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', editor.csrf).send({ version: 0, action: 'publish', releaseReviewed: true }).expect(403);
    const admin = await login('admin');
    await admin.agent.post(`/api/admin/publication/board/${board.id}`).send({ version: 0, action: 'publish', releaseReviewed: true }).expect(403);
    await admin.agent.post(`/api/admin/publication/board/${board.id}`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', admin.csrf).send({ version: 0, action: 'publish' }).expect(400);
    const pending = await admin.agent.get('/api/admin/publication/board').expect(200);
    assert.equal(pending.body.data[0].id, board.id); assert.equal(pending.body.data[0].version, 0);
    assert.equal((await request(app).get('/api/board').expect(200)).body.data.length, 0);
  });
  it('M4 concurrent publication uses optimistic versions and cannot expose a draft twice', async () => {
    const page = await BlogPost.create({ slug: 'test-vision', locale: 'en', title: { en: 'Test vision' }, blocks: [{ type: 'paragraph', text: 'Synthetic source' }] });
    const auth = await login('editor');
    const responses = await Promise.all([1, 2].map(() => auth.agent.post(`/api/admin/publication/blog/${page.id}`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', auth.csrf).send({ version: 0, action: 'publish', releaseReviewed: true })));
    assert.deepEqual(responses.map(r => r.status).sort(), [200, 409]);
    assert.equal((await BlogPost.findById(page.id))!.__v, 1);
    assert.equal(await AuditLog.countDocuments({ action: 'publication.publish' }), 1);
  });
  it('M4 reviewed gallery release joins clean bound files, filters before pagination and revokes URLs on withdrawal', async () => {
    const auth = await login('editor');
    const image = await GalleryItem.create({ category: 'in-action', title: { en: 'Synthetic image' }, alt: { en: 'Synthetic one-pixel test image' } });
    const uploaded = await auth.agent.post('/api/admin/assets?purpose=content').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', auth.csrf).attach('file', png, 'sample.png').expect(201);
    const file = uploaded.body.data.assetId;
    await request(app).get(`/api/public-assets/${file}`).expect(404);
    const release = (version: number, action = 'publish', assetId?: string) => auth.agent.post(`/api/admin/publication/gallery/${image.id}`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', auth.csrf).send({ version, action, releaseReviewed: true, ...(assetId ? { assetId } : {}) });
    await release(0, 'publish', file).expect(200);
    const bound = (await GalleryItem.findById(image.id))!;
    await GalleryItem.create({ category: 'in-action', title: { en: 'Mismatched entity must stay hidden' }, alt: { en: 'Test image' }, asset: bound.asset!, reviewStatus: 'approved', publishedAt: new Date() });
    const list = await request(app).get('/api/gallery?category=in-action&limit=1').expect(200);
    assert.equal(list.body.meta.total, 1); assert.equal(list.body.data[0].file, `/api/public-assets/${file}`);
    assert.ok(!JSON.stringify(list.body).includes('publicId')); assert.ok(!JSON.stringify(list.body).includes('sha256'));
    assert.equal((await request(app).get('/api/gallery?category=media-coverage').expect(200)).body.meta.total, 0);
    const response = await request(app).get(`/api/public-assets/${file}`).expect(200);
    assert.match(response.headers['cache-control'] ?? '', /no-store/); assert.equal(response.headers['content-type'], 'image/png');
    await release(1, 'withdraw').expect(200);
    await request(app).get(`/api/public-assets/${file}`).expect(404);
    assert.equal((await request(app).get('/api/gallery').expect(200)).body.meta.total, 0);
    await release(2).expect(200); // Re-publishing the same bound file is supported.
    await request(app).get(`/api/public-assets/${file}`).expect(200);
  });
  it('M4 publication rejects foreign uploads and complaint evidence atomically', async () => {
    const auth = await login('editor'), other = await login('editor');
    const image = await GalleryItem.create({ category: 'in-action', alt: { en: 'Test image' } });
    const foreign = await other.agent.post('/api/admin/assets?purpose=content').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', other.csrf).attach('file', png, 'foreign.png').expect(201);
    const ticket = await form(), proof = await upload(ticket);
    const own = await auth.agent.post('/api/admin/assets?purpose=content').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', auth.csrf).attach('file', png, 'unrevocable.png').expect(201);
    await Asset.updateOne({ _id: own.body.data.assetId }, { $set: { deliveryType: 'upload' } });
    for (const assetId of [foreign.body.data.assetId, proof, own.body.data.assetId]) await auth.agent.post(`/api/admin/publication/gallery/${image.id}`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', auth.csrf).send({ version: 0, action: 'publish', releaseReviewed: true, assetId }).expect(400);
    assert.equal((await GalleryItem.findById(image.id))!.publishedAt, undefined);
    assert.equal(await AuditLog.countDocuments({ action: 'publication.publish' }), 0);
    await Asset.updateOne({ _id: proof }, { $set: { visibility: 'public', claimStatus: 'claimed', entityType: 'Complaint', entityId: new Types.ObjectId() } });
    await request(app).get(`/api/public-assets/${proof}`).expect(404);
  });
  it('M4 only public report releases download; HEAD does not count and original stays restricted', async () => {
    const auth = await login('editor');
    const report = await Report.create({ title: { en: 'Synthetic report' }, slug: 'synthetic-report', year: 2025 });
    const uploaded = await auth.agent.post('/api/admin/assets?purpose=content').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', auth.csrf).attach('file', pdf, 'public.pdf').expect(201);
    await auth.agent.post(`/api/admin/publication/report/${report.id}`).set('Origin', 'http://localhost:3000').set('X-CSRF-Token', auth.csrf).send({ version: 0, action: 'publish', releaseReviewed: true, assetId: uploaded.body.data.assetId }).expect(200);
    const list = await request(app).get('/api/reports').expect(200);
    assert.equal(list.body.meta.total, 1); assert.ok(!JSON.stringify(list.body).includes('restrictedOriginal'));
    await request(app).head(`/api/reports/${report.id}/download`).expect(200);
    assert.equal((await Report.findById(report.id))!.downloadCount, 0);
    await request(app).get(`/api/reports/${report.id}/download`).expect(200);
    // The stream can finish at the client before the post-delivery counter write.
    await waitFor(async () => (await Report.findById(report.id))!.downloadCount === 1);
    assert.equal((await Report.findById(report.id))!.downloadCount, 1);
  });
  it('M4 blog queries are bounded, literal and hide scheduled or unreviewed content', async () => {
    for (const [slug, status, reviewStatus, publishedAt] of [['published', 'published', 'approved', new Date(0)], ['draft', 'draft', 'pending', new Date(0)], ['future', 'published', 'approved', new Date(Date.now() + 86400000)]] as const) await BlogPost.create({ title: { en: slug === 'published' ? 'Literal .* title' : slug }, slug, status, reviewStatus, publishedAt, blocks: [{ type: 'paragraph', text: 'Synthetic article' }], sourceReferences: ['private-source'] });
    const response = await request(app).get('/api/blogs?q=.*').expect(200);
    assert.equal(response.body.meta.total, 1); assert.equal(response.body.data[0].slug, 'published');
    await request(app).get('/api/blogs/draft').expect(404); await request(app).get('/api/blogs/future').expect(404);
    assert.ok(!JSON.stringify((await request(app).get('/api/blogs/published').expect(200)).body).includes('private-source'));
    for (const path of ['/api/blogs?limit=100', '/api/gallery?page=-1', '/api/blogs?locale=xx', '/api/blogs?unexpected=true', '/api/public-assets/nope']) await request(app).get(path).expect(400);
  });

  it('homepage projects and news support authorized audited CRUD, versions and publish/withdraw', async () => {
    const project={title:{en:'Synthetic project'},slug:'synthetic-project',locale:'en',summary:{en:'Synthetic summary'},focusArea:'Test focus',location:'Test location',projectStatus:'Ongoing',startYear:2026,blocks:[{type:'paragraph',text:'Synthetic body'}]};
    const news={title:{en:'Synthetic update'},slug:'synthetic-update',locale:'en',excerpt:{en:'Synthetic excerpt'},blocks:[{type:'paragraph',text:'Synthetic update body'}]};
    await request(app).post('/api/admin/projects').send(project).expect(401);
    const manager=await login('case_manager');
    await manager.agent.get('/api/admin/projects').expect(403);
    const editor=await login('editor');
    for(const [kind,payload,publicationKind] of [['projects',project,'project'],['news',news,'blog']] as const) {
      await editor.agent.post(`/api/admin/${kind}`).send(payload).expect(403);
      const created=await editor.agent.post(`/api/admin/${kind}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(payload).expect(201);
      const {id}=created.body.data;
      assert.equal((await request(app).get(`/api/${kind}`).expect(200)).body.data.length,0);
      await request(app).get(`/api/${kind}/${payload.slug}`).expect(404);
      assert.equal((await editor.agent.get(`/api/admin/${kind}`).expect(200)).body.data.length,1);
      const publish=(version:number)=>editor.agent.post(`/api/admin/publication/${publicationKind}/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version,action:'publish',releaseReviewed:true});
      await publish(0).expect(200);
      assert.equal((await request(app).get(`/api/${kind}?limit=3`).expect(200)).body.data[0].title,payload.title.en);
      assert.equal((await request(app).get(`/api/${kind}/${payload.slug}`).expect(200)).body.data.blocks[0].text,payload.blocks[0]!.text);
      const edit=(version:number)=>editor.agent.patch(`/api/admin/${kind}/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...payload,version,title:{en:'Changed title'}});
      await edit(0).expect(409);await edit(1).expect(200);
      await request(app).get(`/api/${kind}/${payload.slug}`).expect(404);
      await publish(2).expect(200);
      await editor.agent.delete(`/api/admin/${kind}/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:2}).expect(409);
      await editor.agent.delete(`/api/admin/${kind}/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:3}).expect(200);
      await request(app).get(`/api/${kind}/${payload.slug}`).expect(404);
    }
    assert.equal(await AuditLog.countDocuments({action:{$in:['projects.post','projects.patch','projects.delete','news.post','news.patch','news.delete']}}),6);
  });
  it('canonical blog CRUD retains news compatibility, access checks and shared publication state',async()=>{
    const input={title:{en:'Canonical blog'},slug:'canonical-blog',locale:'en',excerpt:{en:'Blog excerpt'},blocks:[{type:'paragraph',text:'Blog body'}]};
    await request(app).post('/api/admin/blogs').send(input).expect(401);
    const manager=await login('case_manager');
    await manager.agent.get('/api/admin/blogs').expect(403);
    const editor=await login('editor');
    await editor.agent.post('/api/admin/blogs').send(input).expect(403);
    const created=await editor.agent.post('/api/admin/blogs').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(input).expect(201);
    const {id}=created.body.data;
    for(const kind of ['blogs','news']){
      assert.equal((await editor.agent.get(`/api/admin/${kind}`).expect(200)).body.data[0].id,id);
      await request(app).get(`/api/${kind}/canonical-blog`).expect(404);
    }
    await editor.agent.post(`/api/admin/publication/blog/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:0,action:'publish',releaseReviewed:true}).expect(200);
    const canonical=(await request(app).get('/api/blogs/canonical-blog').expect(200)).body;
    assert.deepEqual((await request(app).get('/api/news/canonical-blog').expect(200)).body,canonical);
    await editor.agent.patch(`/api/admin/blogs/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...input,version:0}).expect(409);
    await editor.agent.patch(`/api/admin/blogs/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...input,title:{en:'Edited blog'},version:1}).expect(200);
    for(const kind of ['blogs','news'])await request(app).get(`/api/${kind}/canonical-blog`).expect(404);
    await editor.agent.delete(`/api/admin/blogs/${id}`).send({version:2}).expect(403);
    await editor.agent.delete(`/api/admin/blogs/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:2}).expect(200);
    assert.equal((await editor.agent.get('/api/admin/news').expect(200)).body.data.length,0);
    assert.equal(await AuditLog.countDocuments({action:{$in:['blogs.post','blogs.patch','blogs.delete']}}),3);
  });
  it('homepage cover files are clean, owned, bound and revoked on update or deletion',async()=>{
    const editor=await login('editor');
    const input={title:{en:'Synthetic pictured update'},slug:'pictured-update',excerpt:{en:'Synthetic excerpt'},blocks:[{type:'paragraph',text:'Synthetic body'}]};
    const created=await editor.agent.post('/api/admin/news').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(input).expect(201);
    const upload=await editor.agent.post('/api/admin/assets?purpose=content').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).attach('file',png,'sample.png').expect(201);
    const {id}=created.body.data,assetId=upload.body.data.assetId;
    await editor.agent.post(`/api/admin/publication/blog/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:0,action:'publish',releaseReviewed:true,assetId}).expect(200);
    assert.equal((await request(app).get('/api/news').expect(200)).body.data[0].image,`/api/public-assets/${assetId}`);
    await request(app).get(`/api/public-assets/${assetId}`).expect(200);
    await editor.agent.patch(`/api/admin/news/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...input,version:1}).expect(200);
    await request(app).get(`/api/public-assets/${assetId}`).expect(404);
    await request(app).get('/api/news/pictured-update').expect(404);
    await editor.agent.post('/api/admin/news').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...input,slug:'bad-body',blocks:[{type:'paragraph'}]}).expect(400);
  });

  it('rich project drafts retain media privately, publish every reviewed file, and revoke removed media', async () => {
    const editor = await login('editor');
    const stage = async (bytes = png, filename = 'project.png') => {
      const result = await editor.agent.post('/api/admin/assets?purpose=content').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', editor.csrf).attach('file', bytes, filename).expect(201);
      return result.body.data.assetId as string;
    };
    const cover = await stage(), first = await stage(), second = await stage(), document = await stage(pdf, 'brief.pdf');
    const payload = { title: {en:'Project with a complete story'}, summary: {en:'A verified summary'}, slug:'rich-project', locale:'en', focusArea:'Health', location:'Test district', projectStatus:'Completed', blocks:[{type:'paragraph',text:'Existing source text'}], coverAssetId:cover, coverAlt:'Health outreach',
      gallery:[{assetId:first,alt:'Community meeting',caption:'A reviewed photo'},{assetId:second,alt:'Project activities'}], documents:[{assetId:document,label:'Project brief'}],
      details:{overview:'About the work',challenge:'A documented need',approach:'Working with communities',period:'2026',targetCommunity:'Local families',objectives:['Improve access'],activities:['Community outreach'],outcomes:['Improved services'],partners:['Confirmed partner'],milestones:[{period:'June 2026',title:'Outreach completed',description:'First stage'}],metrics:[{value:'12',label:'Sessions held',source:'Project report'}],sections:[{heading:'Lessons learned',body:'A longer reflection'}]},
    };
    const created = await editor.agent.post('/api/admin/projects').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(payload).expect(201);
    const id = created.body.data.id;
    assert.equal(await Asset.countDocuments({entityId:id,claimStatus:'claimed',visibility:'restricted'}),4);
    await request(app).get('/api/projects/rich-project').expect(404);
    await request(app).get(`/api/public-assets/${first}`).expect(404);
    const privateRow = await editor.agent.get(`/api/admin/projects/${id}`).expect(200);
    assert.equal(privateRow.body.data.coverAssetId,cover);
    assert.equal(privateRow.body.data.gallery.length,2);
    assert.ok(!JSON.stringify(privateRow.body).includes('publicId'));
    const publish = (version:number) => editor.agent.post(`/api/admin/publication/project/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version,action:'publish',releaseReviewed:true});
    await publish(0).expect(200);
    const listing = await editor.agent.get('/api/admin/projects').expect(200);
    const listed = listing.body.data.find((item: {id: string}) => item.id === id);
    assert.equal(listed.version, 1, 'Project list must include the version required for withdrawal/deletion');
    assert.ok(!JSON.stringify(listing.body).includes('publicId'));
    const result = await request(app).get('/api/projects/rich-project').expect(200);
    assert.equal(result.body.data.gallery.length,2); assert.equal(result.body.data.documents.length,1);
    assert.equal(result.body.data.details.metrics[0].source,'Project report');
    assert.equal(result.body.data.imageAlt,'Health outreach');
    assert.ok(!JSON.stringify(result.body).includes('publicId'));
    for (const file of [cover,first,second,document]) await request(app).get(`/api/public-assets/${file}`).expect(200);
    const changed = {...payload,gallery:payload.gallery.slice(0,1),documents:[],version:1};
    await editor.agent.patch(`/api/admin/projects/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(changed).expect(200);
    for (const file of [cover,first,second,document]) await request(app).get(`/api/public-assets/${file}`).expect(404);
    await publish(2).expect(200);
    await request(app).get(`/api/public-assets/${first}`).expect(200);
    await request(app).get(`/api/public-assets/${second}`).expect(404);
    await request(app).get(`/api/public-assets/${document}`).expect(404);
    const after = await request(app).get('/api/projects/rich-project').expect(200);
    assert.equal(after.body.data.gallery.length,1); assert.deepEqual(after.body.data.documents,[]);
    await editor.agent.delete(`/api/admin/projects/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:3}).expect(200);
    await request(app).get(`/api/public-assets/${cover}`).expect(404);
    await request(app).get('/api/projects/rich-project').expect(404);
  });
  it('project media validation rejects foreign, duplicate, expired, non-image and cross-project files atomically', async () => {
    const editor = await login('editor'), other = await login('editor');
    const stage = async (auth:typeof editor, bytes=png, filename='project.png') => (await auth.agent.post('/api/admin/assets?purpose=content').set('Origin','http://localhost:3000').set('X-CSRF-Token',auth.csrf).attach('file',bytes,filename).expect(201)).body.data.assetId as string;
    const own=await stage(editor),foreign=await stage(other),doc=await stage(editor,pdf,'brief.pdf'),expired=await stage(editor);
    await Asset.updateOne({_id:expired},{$set:{stagingExpiresAt:new Date(0)}});
    const base={title:{en:'Draft'},summary:{en:'Summary'},slug:'validation-project',locale:'en',focusArea:'Rights',location:'Test location',projectStatus:'Proposed',blocks:[{type:'paragraph',text:'Body'}]};
    for(const media of [{coverAssetId:foreign},{gallery:[{assetId:doc,alt:'Not a photo'}]},{coverAssetId:expired},{coverAssetId:own,gallery:[{assetId:own.toUpperCase(),alt:'Duplicate'}]},{documents:[{assetId:own,label:'Not a PDF'}]}]) {
      await editor.agent.post('/api/admin/projects').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...base,...media}).expect(400);
      assert.equal(await Project.countDocuments(),0);
      assert.equal((await Asset.findById(own))!.claimStatus,'staged');
    }
    await editor.agent.post('/api/admin/projects').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...base,coverAssetId:own}).expect(201);
    await editor.agent.post('/api/admin/projects').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...base,slug:'another-project',coverAssetId:own}).expect(400);
    const row=await Project.findOne({slug:base.slug});
    await editor.agent.patch(`/api/admin/projects/${row!.id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...base,version:7}).expect(409);
    const manager=await login('case_manager');
    await manager.agent.get(`/api/admin/projects/${row!.id}`).expect(403);
  });

  it('rich blog drafts retain media privately, publish every reviewed file, and revoke removed media', async () => {
    const editor = await login('editor');
    const stage = async (bytes = png, filename = 'blog.png') => {
      const result = await editor.agent.post('/api/admin/assets?purpose=content').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', editor.csrf).attach('file', bytes, filename).expect(201);
      return result.body.data.assetId as string;
    };
    const cover = await stage(), first = await stage(), second = await stage(), document = await stage(pdf, 'brief.pdf');
    const payload = { title: {en:'BlogPost with a complete story'}, excerpt: {en:'A verified summary'}, slug:'rich-blog', locale:'en', blocks:[{type:'paragraph',text:'Existing source text'}], coverAssetId:cover, coverAlt:'Health outreach',
      gallery:[{assetId:first,alt:'Community meeting',caption:'A reviewed photo'},{assetId:second,alt:'BlogPost activities'}], documents:[{assetId:document,label:'BlogPost brief'}],
      tags:['Accountability'], details:{category:'Community advocacy',authorName:'Public author',authorRole:'Editor',intro:'About this article',takeaways:['A documented concern'],sections:[{heading:'What happened',body:'A sourced account',bullets:['Known fact'],quote:'An attributed quotation',attribution:'Supplied report'}],conclusion:'A considered ending',sources:[{label:'Supplied report',url:'https://example.org/report',note:'Historical source'}],seoTitle:'Search title',seoDescription:'Search description'},
    };
    const created = await editor.agent.post('/api/admin/blogs').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(payload).expect(201);
    const id = created.body.data.id;
    assert.equal(await Asset.countDocuments({entityId:id,claimStatus:'claimed',visibility:'restricted'}),4);
    await request(app).get('/api/blogs/rich-blog').expect(404);
    await request(app).get(`/api/public-assets/${first}`).expect(404);
    const privateRow = await editor.agent.get(`/api/admin/blogs/${id}`).expect(200);
    assert.equal(privateRow.body.data.coverAssetId,cover);
    assert.equal(privateRow.body.data.gallery.length,2);
    assert.ok(!JSON.stringify(privateRow.body).includes('publicId'));
    const publish = (version:number) => editor.agent.post(`/api/admin/publication/blog/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version,action:'publish',releaseReviewed:true});
    await publish(0).expect(200);
    const listing = await editor.agent.get('/api/admin/blogs').expect(200);
    const listed = listing.body.data.find((item: {id: string}) => item.id === id);
    assert.equal(listed.version, 1, 'BlogPost list must include the version required for withdrawal/deletion');
    assert.ok(!JSON.stringify(listing.body).includes('publicId'));
    const result = await request(app).get('/api/blogs/rich-blog').expect(200);
    assert.equal(result.body.data.gallery.length,2); assert.equal(result.body.data.documents.length,1);
    assert.equal(result.body.data.details.sections[0].attribution,'Supplied report');
    assert.equal(result.body.data.imageAlt,'Health outreach');
    assert.ok(!JSON.stringify(result.body).includes('publicId'));
    for (const file of [cover,first,second,document]) await request(app).get(`/api/public-assets/${file}`).expect(200);
    const changed = {...payload,gallery:payload.gallery.slice(0,1),documents:[],version:1};
    await editor.agent.patch(`/api/admin/blogs/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(changed).expect(200);
    for (const file of [cover,first,second,document]) await request(app).get(`/api/public-assets/${file}`).expect(404);
    await publish(2).expect(200);
    await request(app).get(`/api/public-assets/${first}`).expect(200);
    await request(app).get(`/api/public-assets/${second}`).expect(404);
    await request(app).get(`/api/public-assets/${document}`).expect(404);
    const after = await request(app).get('/api/blogs/rich-blog').expect(200);
    assert.equal(after.body.data.gallery.length,1); assert.deepEqual(after.body.data.documents,[]);
    await editor.agent.post(`/api/admin/publication/blog/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:3,action:'withdraw',releaseReviewed:true}).expect(200);
    for(const file of [cover,first]) await request(app).get(`/api/public-assets/${file}`).expect(404);
    await request(app).get('/api/blogs/rich-blog').expect(404);
    await publish(4).expect(200);
    assert.equal((await request(app).get('/api/news/rich-blog').expect(200)).body.data.category,'Community advocacy');
    await editor.agent.delete(`/api/admin/blogs/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:5}).expect(200);
    await request(app).get(`/api/public-assets/${cover}`).expect(404);
    await request(app).get('/api/blogs/rich-blog').expect(404);
  });
  it('blog media validation rejects foreign, duplicate, expired, non-image and cross-blog files atomically', async () => {
    const editor = await login('editor'), other = await login('editor');
    const stage = async (auth:typeof editor, bytes=png, filename='blog.png') => (await auth.agent.post('/api/admin/assets?purpose=content').set('Origin','http://localhost:3000').set('X-CSRF-Token',auth.csrf).attach('file',bytes,filename).expect(201)).body.data.assetId as string;
    const own=await stage(editor),foreign=await stage(other),doc=await stage(editor,pdf,'brief.pdf'),expired=await stage(editor);
    await Asset.updateOne({_id:expired},{$set:{stagingExpiresAt:new Date(0)}});
    const base={title:{en:'Draft'},excerpt:{en:'Summary'},slug:'validation-blog',locale:'en',blocks:[{type:'paragraph',text:'Body'}]};
    for(const media of [{coverAssetId:foreign},{gallery:[{assetId:doc,alt:'Not a photo'}]},{coverAssetId:expired},{coverAssetId:own,gallery:[{assetId:own.toUpperCase(),alt:'Duplicate'}]},{documents:[{assetId:own,label:'Not a PDF'}]}]) {
      await editor.agent.post('/api/admin/blogs').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...base,...media}).expect(400);
      assert.equal(await BlogPost.countDocuments(),0);
      assert.equal((await Asset.findById(own))!.claimStatus,'staged');
    }
    await editor.agent.post('/api/admin/blogs').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...base,coverAssetId:own}).expect(201);
    await editor.agent.post('/api/admin/blogs').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...base,slug:'another-blog',coverAssetId:own}).expect(400);
    const row=await BlogPost.findOne({slug:base.slug});
    await editor.agent.patch(`/api/admin/blogs/${row!.id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...base,version:7}).expect(409);
    const manager=await login('case_manager');
    await manager.agent.get(`/api/admin/blogs/${row!.id}`).expect(403);
  });

  it('blog publication supports section-only stories and rejects unsafe sources, unattributed quotes and excessive media', async () => {
    const editor = await login('editor');
    const send = (body: object) => editor.agent.post('/api/admin/blogs').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(body);
    const base = {title:{en:'Section story'},excerpt:{en:'Summary'},slug:'section-story',blocks:[],details:{intro:'A proper introduction',sections:[{heading:'Context',body:'Reviewed text'}]}};
    for (const details of [{sources:[{label:'Unsafe',url:'javascript:alert(1)'}]},{sources:[{label:'Unsafe',url:'https://user:pass@example.org/'}]},{sections:[{heading:'Quote',body:'Text',quote:'No attribution'}]}]) await send({...base,details}).expect(400);
    await send({...base,tags:['Rights','rights']}).expect(400);
    await send({...base,gallery:Array.from({length:13},()=>({assetId:new Types.ObjectId().toString(),alt:'Photo'}))}).expect(400);
    await send({...base,documents:Array.from({length:4},()=>({assetId:new Types.ObjectId().toString(),label:'PDF'}))}).expect(400);
    const created = await send(base).expect(201);
    await editor.agent.post(`/api/admin/publication/blog/${created.body.data.id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:0,action:'publish',releaseReviewed:true}).expect(200);
    const response = await request(app).get('/api/blogs/section-story').expect(200);
    assert.equal(response.body.data.authorName,'HRPF Pakistan');
    assert.equal(response.body.data.readingMinutes,1);
    assert.deepEqual(response.body.data.blocks,[]);
    assert.equal(response.body.data.details.sections[0].heading,'Context');
    const empty = await send({...base,slug:'empty-story',details:{}}).expect(201);
    await editor.agent.post(`/api/admin/publication/blog/${empty.body.data.id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:0,action:'publish',releaseReviewed:true}).expect(400);
  });

  it('Gallery administration keeps drafts private, publishes reviewed images, searches literally and revokes edited/removed files', async () => {
    const editor = await login('editor');
    const upload = await editor.agent.post('/api/admin/assets?purpose=content').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).attach('file',png,{filename:'cutting.png',contentType:'image/png'}).expect(201);
    const input = { title:{en:'Press [archive]',ur:'محفوظ خبر'}, category:'media-coverage', mediaType:'newspaper', alt:{en:'Newspaper cutting'}, caption:{en:'Historical context'}, sourceName:'Test newspaper', eventDate:'2020-02-29', treatment:'AI_RESTORATION', assetId:upload.body.data.assetId };
    const mutate = (method: 'post'|'patch'|'delete', path: string, body: object) => editor.agent[method](path).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(body);
    const draft = await mutate('post','/api/admin/gallery',input).expect(201); const id = draft.body.data.id;
    assert.equal((await request(app).get('/api/gallery')).body.data.length,0);
    await request(app).get(`/api/public-assets/${input.assetId}`).expect(404);
    const privateRow = await editor.agent.get(`/api/admin/gallery/${id}`).expect(200);
    assert.equal(privateRow.body.data.assetId,input.assetId); assert.ok(!JSON.stringify(privateRow.body).includes('publicId'));
    await editor.agent.patch(`/api/admin/gallery/${id}`).set('Origin','http://localhost:3000').send({...input,version:0}).expect(403);
    await mutate('post',`/api/admin/publication/gallery/${id}`,{version:0,action:'publish',releaseReviewed:true}).expect(200);
    const response = await request(app).get('/api/gallery?category=media-coverage&q=%5Barchive%5D&limit=1').expect(200);
    assert.equal(response.body.meta.total,1); assert.equal(response.body.data[0].sourceName,'Test newspaper'); assert.equal(response.body.data[0].treatment,'AI_RESTORATION'); assert.equal(response.body.data[0].eventDate,'2020-02-29');
    assert.equal((await request(app).get('/api/gallery?q=.*')).body.meta.total,0);
    await request(app).get(`/api/public-assets/${input.assetId}`).expect(200);
    await mutate('patch',`/api/admin/gallery/${id}`,{...input,version:0}).expect(409);
    await mutate('patch',`/api/admin/gallery/${id}`,{...input,eventDate:undefined,version:1}).expect(200);
    await request(app).get(`/api/public-assets/${input.assetId}`).expect(404);
    assert.equal((await GalleryItem.findById(id))!.eventDate,undefined);
    await mutate('post',`/api/admin/publication/gallery/${id}`,{version:2,action:'publish',releaseReviewed:true}).expect(200);
    await mutate('delete',`/api/admin/gallery/${id}`,{version:3}).expect(200);
    assert.equal((await request(app).get('/api/gallery')).body.meta.total,0); await request(app).get(`/api/public-assets/${input.assetId}`).expect(404);
    assert.ok(await AuditLog.exists({entityId:id,action:'gallery.delete'}));
  });
  it('Gallery rejects foreign/expired/non-image assets, unsafe links, invalid dates and publishing without an image', async () => {
    const editor = await login('editor'), other = await login('editor');
    const input = { title:{en:'Archive'},category:'media-coverage',mediaType:'newspaper',alt:{en:'Cutting'},caption:{en:''},treatment:'ORIGINAL' };
    const send = (body: object) => editor.agent.post('/api/admin/gallery').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(body);
    for (const extra of [{sourceUrl:'javascript:alert(1)'},{sourceUrl:'https://user:pass@example.org/'},{eventDate:'2025-02-30'},{title:{en:' '}},{publishedAt:'2020-01-01'}]) await send({...input,...extra}).expect(400);
    const foreign = await other.agent.post('/api/admin/assets?purpose=content').set('Origin','http://localhost:3000').set('X-CSRF-Token',other.csrf).attach('file',png,{filename:'other.png',contentType:'image/png'}).expect(201);
    await send({...input,assetId:foreign.body.data.assetId}).expect(400);
    const own = await editor.agent.post('/api/admin/assets?purpose=content').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).attach('file',pdf,{filename:'not-image.pdf',contentType:'application/pdf'}).expect(201);
    await send({...input,assetId:own.body.data.assetId}).expect(400);
    await Asset.updateOne({_id:foreign.body.data.assetId},{$set:{ownerId:editor.user.id,stagingExpiresAt:new Date(0)}});
    await send({...input,assetId:foreign.body.data.assetId}).expect(400);
    const noImage = await send(input).expect(201);
    await editor.agent.post(`/api/admin/publication/gallery/${noImage.body.data.id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:0,action:'publish',releaseReviewed:true}).expect(400);
    const restricted = await login('case_manager'); await restricted.agent.get('/api/admin/gallery').expect(403); await request(app).get('/api/admin/gallery').expect(401);
  });
  it('TV interviews normalize only supported individual video links; optional thumbnails are bound, private and revocable', async () => {
    const editor = await login('editor');
    const input = { title:{en:'Human rights conversation'},description:{en:'Reviewed interview topics'},videoUrl:'https://youtu.be/Abcdef123_-?t=30',sourceName:'Test channel',eventDate:'2021-11-29' };
    const send = (body: object) => editor.agent.post('/api/admin/interviews').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(body);
    for (const videoUrl of ['https://youtube.com/@hrpfpakistan','https://youtube.com/watch?v=bad','https://youtube.com.evil.example/watch?v=Abcdef123_-','javascript:alert(1)','https://user:pass@www.youtube.com/watch?v=Abcdef123_-','https://player.vimeo.com/video/123456?secret=1','<iframe src="https://example.org"></iframe>']) await send({...input,videoUrl}).expect(400);
    const created = await send(input).expect(201), id = created.body.data.id;
    assert.equal((await request(app).get('/api/interviews')).body.meta.total,0);
    await editor.agent.post(`/api/admin/publication/interview/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:0,action:'publish',releaseReviewed:true}).expect(200);
    const result = await request(app).get('/api/interviews?q=rights').expect(200);
    assert.equal(result.body.meta.total,1); assert.equal(result.body.data[0].embedUrl,'https://www.youtube-nocookie.com/embed/Abcdef123_-'); assert.equal(result.body.data[0].thumbnail,null);
    assert.equal((await request(app).get('/api/interviews?q=.*')).body.meta.total,0);
    const file = await editor.agent.post('/api/admin/assets?purpose=content').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).attach('file',png,{filename:'thumbnail.png',contentType:'image/png'}).expect(201);
    await editor.agent.patch(`/api/admin/interviews/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...input,assetId:file.body.data.assetId,version:1}).expect(200);
    await editor.agent.post(`/api/admin/publication/interview/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:2,action:'publish',releaseReviewed:true}).expect(400);
    await editor.agent.patch(`/api/admin/interviews/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({...input,thumbnailAlt:'Interview speakers',version:2}).expect(200);
    await editor.agent.post(`/api/admin/publication/interview/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:3,action:'publish',releaseReviewed:true}).expect(200);
    const publicRow = (await request(app).get('/api/interviews')).body.data[0]; await request(app).get(publicRow.thumbnail).expect(200); assert.ok(!JSON.stringify(publicRow).includes('publicId'));
    await editor.agent.post(`/api/admin/publication/interview/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:4,action:'withdraw',releaseReviewed:true}).expect(200);
    await request(app).get(publicRow.thumbnail).expect(404); assert.equal((await request(app).get('/api/interviews')).body.meta.total,0);
    const vimeo = await send({...input,videoUrl:'https://vimeo.com/12345678'}).expect(201);
    await editor.agent.post(`/api/admin/publication/interview/${vimeo.body.data.id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:0,action:'publish',releaseReviewed:true}).expect(200);
    assert.equal((await request(app).get('/api/interviews')).body.data[0].provider,'vimeo');
    await VideoInterview.collection.insertOne({title:{en:'Bad stored link'},videoUrl:'https://example.org/untrusted',publishedAt:new Date(),reviewStatus:'approved'});
    assert.equal((await request(app).get('/api/interviews')).body.meta.total,1,'Invalid stored video excluded before pagination/count');
  });

  it('manages future reports with private staging, reviewed release, inline viewing, downloads and immediate revocation', async () => {
    const editor = await login('editor');
    const send = (input: object) => editor.agent.post('/api/admin/reports').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(input);
    const input = { title: { en: 'Future progress report' }, slug: 'report-2029', year: 2029, summary: { en: 'Future administration' }, edition: 'public-edition', releaseNote: { en: 'Reviewed public edition; private case annexes omitted.' }, coverageStart: '2029-01-01', coverageEnd: '2029-12-31', pages: 3 };
    await request(app).get('/api/admin/reports').expect(401);
    await editor.agent.post('/api/admin/reports').set('Origin','http://localhost:3000').send(input).expect(403);
    await send({ ...input, coverageEnd: '2029-02-30' }).expect(400);
    await send({ ...input, coverageEnd: '2028-12-31' }).expect(400);
    await send({ ...input, releaseNote: { en: '' } }).expect(400);
    const file = await editor.agent.post('/api/admin/assets?purpose=content').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).attach('file',pdf,{filename:'report.pdf',contentType:'application/pdf'}).expect(201);
    const created = await send({ ...input, assetId: file.body.data.assetId }).expect(201), id = created.body.data.id;
    await request(app).get(`/api/documents/reports/${id}/view`).expect(404);
    await request(app).get(`/api/public-assets/${file.body.data.assetId}`).expect(404);
    const preview = await editor.agent.get(`/api/admin/assets/${file.body.data.assetId}/content?preview=1`).expect(200); assert.match(preview.headers['content-disposition']!,/^inline/);
    const mutation = (version: number, action = 'publish', extra = {}) => editor.agent.post(`/api/admin/publication/report/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({ version, action, releaseReviewed: true, ...extra });
    await mutation(0).expect(200);
    const publicRow = (await request(app).get('/api/reports')).body.data[0];
    assert.equal(publicRow.year,2029); assert.equal(publicRow.edition,'public-edition'); assert.ok(!JSON.stringify(publicRow).includes('publicId'));
    assert.match((await request(app).get(publicRow.view).expect(200)).headers['content-disposition']!,/^inline/);
    assert.match((await request(app).get(publicRow.download).expect(200)).headers['content-disposition']!,/^attachment/);
    await request(app).head(publicRow.download).expect(200);
    assert.equal((await Report.findById(id))!.downloadCount,1);
    await request(app).get(`/api/documents/certificates/${id}/view`).expect(404);
    await editor.agent.patch(`/api/admin/reports/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({ ...input, assetId:file.body.data.assetId, version:0 }).expect(409);
    await editor.agent.patch(`/api/admin/reports/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({ ...input, coverageStart:undefined, coverageEnd:undefined, pages:undefined, assetId:file.body.data.assetId, version:1 }).expect(200);
    await request(app).get(publicRow.view).expect(404); assert.equal((await request(app).get('/api/reports')).body.meta.total,0);
    const edited = await editor.agent.get(`/api/admin/reports/${id}`).expect(200); assert.equal(edited.body.data.coverageStart,undefined); assert.equal(edited.body.data.pages,undefined);
    await mutation(2).expect(200); await mutation(3,'withdraw').expect(200); await request(app).get(publicRow.download).expect(404);
    await mutation(4).expect(200);
    await editor.agent.delete(`/api/admin/reports/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send({version:5}).expect(200);
    await request(app).get(publicRow.file).expect(404); assert.equal(await Asset.countDocuments({entityId:id,visibility:'public'}),0);
  });
  it('requires certificate administrators, validates public copies and never releases restricted originals', async () => {
    const admin = await login('admin'), editor = await login('editor');
    const input = { title:{en:'Historical registration'}, issuer:'Test commission', reference:'TEST-123', validFrom:'2022-05-16', expiresAt:'2023-05-15', summary:{en:'Archive document'} };
    await editor.agent.get('/api/admin/certificates').expect(403);
    await editor.agent.post('/api/admin/certificates').set('Origin','http://localhost:3000').set('X-CSRF-Token',editor.csrf).send(input).expect(403);
    const uploadFile = (purpose: string, bytes=png, filename='certificate.png', contentType='image/png') => admin.agent.post(`/api/admin/assets?purpose=${purpose}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',admin.csrf).attach('file',bytes,{filename,contentType});
    const content = await uploadFile('content').expect(201);
    await admin.agent.post('/api/admin/certificates').set('Origin','http://localhost:3000').set('X-CSRF-Token',admin.csrf).send({...input,assetId:content.body.data.assetId}).expect(400);
    await admin.agent.post('/api/admin/reports').set('Origin','http://localhost:3000').set('X-CSRF-Token',admin.csrf).send({title:{en:'Wrong report'},slug:'wrong-file',year:2026,assetId:content.body.data.assetId}).expect(400);
    const publicFile = await uploadFile('certificate').expect(201), original = await uploadFile('certificate').expect(201);
    const created = await admin.agent.post('/api/admin/certificates').set('Origin','http://localhost:3000').set('X-CSRF-Token',admin.csrf).send({...input,assetId:publicFile.body.data.assetId}).expect(201), id = created.body.data.id;
    const originalAsset = await Asset.findById(original.body.data.assetId);
    await Asset.updateOne({_id:originalAsset!._id},{$set:{claimStatus:'claimed',entityType:'Certificate',entityId:id},$unset:{stagingExpiresAt:1}});
    await Certificate.updateOne({_id:id},{$set:{original:{assetId:originalAsset!._id,publicId:originalAsset!.publicId,resourceType:'image',deliveryType:'authenticated',format:'png',bytes:originalAsset!.bytes,version:1,sha256:originalAsset!.sha256}}});
    const publish = (extra = {}) => admin.agent.post(`/api/admin/publication/certificate/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',admin.csrf).send({version:0,action:'publish',releaseReviewed:true,...extra});
    await publish({assetId:originalAsset!.id.toUpperCase()}).expect(400); await publish().expect(200);
    const row = (await request(app).get('/api/certificates')).body.data[0]; assert.equal(row.expiresAt,'2023-05-15T00:00:00.000Z');
    await request(app).get(`/api/public-assets/${originalAsset!.id}`).expect(404);
    const releasedAsset = await Asset.findById(publicFile.body.data.assetId);
    await Certificate.updateOne({_id:id},{$set:{original:{assetId:releasedAsset!._id,publicId:releasedAsset!.publicId,resourceType:'image',deliveryType:'authenticated',format:'png',bytes:releasedAsset!.bytes,sha256:releasedAsset!.sha256}}});
    assert.equal((await request(app).get('/api/certificates')).body.meta.total,0);
    await request(app).get(row.view).expect(404);
    await Certificate.updateOne({_id:id},{$set:{'original.assetId':originalAsset!._id}});
    assert.match((await request(app).get(row.view).expect(200)).headers['content-disposition']!,/^inline/);
    assert.match((await request(app).get(row.download).expect(200)).headers['content-disposition']!,/^attachment/);
    const detail = await admin.agent.get(`/api/admin/certificates/${id}`).expect(200); assert.ok(!JSON.stringify(detail.body).includes('original')); assert.ok(!JSON.stringify(detail.body).includes('publicId'));
    await admin.agent.post(`/api/admin/publication/certificate/${id}`).set('Origin','http://localhost:3000').set('X-CSRF-Token',admin.csrf).send({version:1,action:'withdraw',releaseReviewed:true}).expect(200);
    await request(app).get(row.view).expect(404); await request(app).get(row.download).expect(404);
    await User.updateOne({_id:admin.user._id},{$set:{role:'editor'}}); await admin.agent.get('/api/admin/certificates').expect(403);
  });

});
