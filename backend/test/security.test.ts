import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { parseEnv } from '../src/config/env.js';
import { createAuth, cookieNames } from '../src/security/auth.js';
import { can } from '../src/security/permissions.js';
import { decrypt, digest, encrypt, hashPassword, keyedHash, verifyPassword } from '../src/security/crypto.js';
import { cloudinaryProvider, inspectUpload } from '../src/services/uploads.js';
import { complaintInput } from '../src/http/contracts.js';
import { createRedisServices } from '../src/infrastructure/redis-services.js';
import { turnstileVerifier } from '../src/services/forms.js';
import express from 'express';
import request from 'supertest';
import { ApiError } from '../src/http/errors.js';
const env = parseEnv({ NODE_ENV: 'test', JWT_ACCESS_SECRET: 'a'.repeat(64), JWT_REFRESH_SECRET: 'b'.repeat(64) });
test('password hashing uses per-password salts and rejects incorrect passwords', async () => {
  const hash = await hashPassword('twelve-characters-plus');
  assert.ok(hash.startsWith('scrypt$131072$8$1$'));
  assert.ok(await verifyPassword('twelve-characters-plus', hash));
  assert.ok(!await verifyPassword('wrong', hash));
  assert.ok(!await verifyPassword('password', 'malformed'));
});
test('AES-GCM rejects tampering and wrong entity context; lookup hashes require a key', () => {
  const key = 'ab'.repeat(32), value = 'synthetic-identity';
  const encoded = encrypt(value, key, 'complaint:one');
  assert.equal(decrypt(encoded, key, 'complaint:one'), value);
  assert.ok(!encoded.includes(value));
  assert.throws(() => decrypt(encoded, key, 'complaint:two'));
  const split = encoded.split('.'); split[3] = Buffer.from('changed').toString('base64url');
  assert.throws(() => decrypt(split.join('.'), key, 'complaint:one'));
  assert.notEqual(keyedHash(value, 'one'), keyedHash(value, 'two'));
});
test('roles cannot cross from content editing into casework or user administration', () => {
  assert.equal(can('editor', 'content'), true);
  assert.equal(can('editor', 'restrictedAssets'), false);
  assert.equal(can('case_manager', 'complaints'), true);
  assert.equal(can('case_manager', 'memberExport'), false);
  assert.equal(can('admin', 'users'), false);
  assert.equal(can('super_admin', 'users'), true);
});
test('CSRF token requires its host-only HttpOnly cookie and an exact origin', async () => {
  const auth = createAuth(env), app = express();
  app.use('/api/auth', auth.router);
  app.post('/protected', auth.csrf, (_req, res) => res.json({ ok: true }));
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => { res.status(error instanceof ApiError ? error.status : 500).json({ code: error instanceof ApiError ? error.code : 'ERROR' }); });
  const csrf = await request(app).get('/api/auth/csrf').expect(200);
  const set = csrf.headers['set-cookie'] as unknown as string[];
  const cookie = set[0]!.split(';')[0]!;
  assert.ok(set[0]!.includes('HttpOnly')); assert.ok(set[0]!.includes('SameSite=Lax'));
  await request(app).post('/protected').set('Origin', 'http://localhost:3000').set('Cookie', cookie).set('X-CSRF-Token', csrf.body.data.csrfToken).expect(200);
  await request(app).post('/protected').set('Origin', 'http://localhost:3000').set('X-CSRF-Token', csrf.body.data.csrfToken).expect(403);
  await request(app).post('/protected').set('Cookie', cookie).set('X-CSRF-Token', csrf.body.data.csrfToken).expect(403);
  await request(app).post('/protected').set('Origin', 'https://evil.example').set('Cookie', cookie).set('X-CSRF-Token', csrf.body.data.csrfToken).expect(403);
  await request(app).post('/protected').set('Origin', 'http://localhost:3000').set('Cookie', cookie).set('X-CSRF-Token', 'tampered').expect(403);
  assert.ok(cookieNames(parseEnv({ NODE_ENV: 'production', MONGODB_URI: 'mongodb://localhost', FRONTEND_URL: 'https://example.org', CLOUDINARY_NAMESPACE: 'hrpf/prod' })).access.startsWith('__Host-'));
});
test('file checks reject MIME spoofing, executable SVG, mismatched extension and empty files', async () => {
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF');
  assert.equal((await inspectUpload({ bytes: pdf, filename: 'proof.pdf', mime: 'application/pdf' })).ext, 'pdf');
  await assert.rejects(inspectUpload({ bytes: pdf, filename: 'proof.jpg', mime: 'image/jpeg' }));
  await assert.rejects(inspectUpload({ bytes: Buffer.from('<svg onload="alert(1)"></svg>'), filename: 'proof.svg', mime: 'image/svg+xml' }));
  await assert.rejects(inspectUpload({ bytes: pdf, filename: 'proof.exe', mime: 'application/pdf' }));
  await assert.rejects(inspectUpload({ bytes: Buffer.alloc(0), filename: 'proof.pdf', mime: 'application/pdf' }));
});
test('contracts reject Mongo operators, unknown fields, absent proceeding details and duplicate assets', () => {
  const valid = { name: 'Test', fatherName: 'Test', email: 'test@example.org', phone: '03001234567', province: 'Test', district: 'Test', address: 'Test', ticket: 't'.repeat(43), submissionKey: '6ee5b1fd-5d30-405e-952f-54d25c905ae5', consent: true, consentVersion: 'v1', cnic: '1234512345671', cnicImageId: 'a'.repeat(24), complaintDocumentId: 'b'.repeat(24), category: 'Test', description: 'Test', priorProceedings: false };
  assert.equal(complaintInput.safeParse(valid).success, true);
  assert.equal(complaintInput.safeParse({ ...valid, name: { $ne: '' } }).success, false);
  assert.equal(complaintInput.safeParse({ ...valid, $where: 'x' }).success, false);
  assert.equal(complaintInput.safeParse({ ...valid, priorProceedings: true }).success, false);
  assert.equal(complaintInput.safeParse({ ...valid, complaintDocumentId: valid.cnicImageId }).success, false);
});
test('business endpoints fail closed when Redis is unavailable, while health stays available', async () => {
  const redis = createRedisServices({ isReady: false } as Parameters<typeof createRedisServices>[0], 'test');
  const app = createApp(env, async () => ({ mongo: false, redis: false }), { redis });
  await request(app).get('/api/health/live').expect(200);
  await request(app).get('/api/auth/me').expect(503);
  await request(app).post('/api/forms/session').send({ purpose: 'contact', botToken: 'anything' }).expect(503);
});
test('Turnstile has no development bypass; encryption keys and JWT secrets are validated safely', async () => {
  await assert.rejects(turnstileVerifier(env)('anything', 'contact'), /temporarily unavailable/);
  assert.throws(() => parseEnv({ DATA_ENCRYPTION_KEY: 'private-invalid' }), /DATA_ENCRYPTION_KEY/);
  assert.throws(() => parseEnv({ JWT_ACCESS_SECRET: 'a'.repeat(64), JWT_REFRESH_SECRET: 'a'.repeat(64) }), /distinct/);
  assert.throws(() => parseEnv({ TRUST_PROXY_CIDRS: 'true' }), /TRUST_PROXY_CIDRS/);
  assert.equal(digest('test').length, 64);
});

test('managed thumbnails sign bounded, versioned Cloudinary transformations while original reads stay unchanged', async () => {
  const configured = parseEnv({ NODE_ENV: 'test', CLOUDINARY_CLOUD_NAME: 'synthetic', CLOUDINARY_API_KEY: '123', CLOUDINARY_API_SECRET: 'synthetic-secret' });
  const provider = cloudinaryProvider(configured), originalFetch = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = async input => { urls.push(String(input)); return new Response('synthetic bytes'); };
  try {
    const asset = { publicId: 'hrpf/dev/content/synthetic-image', resourceType: 'image' as const, version: 123 };
    for (const width of [480, 960, 1440] as const) await provider.read(asset, { width });
    await provider.read(asset);
    for (let i = 0; i < 3; i++) {
      assert.match(urls[i]!, /\/image\/authenticated\/s--[^/]+--\//);
      assert.ok(urls[i]!.includes(`w_${[480, 960, 1440][i]}`));
      assert.ok(urls[i]!.includes('c_limit') && urls[i]!.includes('f_webp') && urls[i]!.includes('q_82'));
      assert.ok(urls[i]!.includes('/v123/'));
    }
    assert.ok(!urls[3]!.includes('w_') && !urls[3]!.includes('f_webp'));
  } finally { globalThis.fetch = originalFetch; }
});
