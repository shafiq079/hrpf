import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { parseEnv } from '../src/config/env.js';

const env = parseEnv({ NODE_ENV: 'test' });
const app = createApp(env, async () => ({ mongo: true, redis: true }));
test('liveness works without external services and adds security headers', async () => {
  const unavailable = createApp(env, async () => ({ mongo: false, redis: false }));
  const response = await request(unavailable).get('/api/health/live').expect(200);
  assert.equal(response.body.data.status, 'alive');
  assert.equal(response.headers['x-powered-by'], undefined);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.ok(response.headers['x-content-type-options']);
});
test('readiness returns 503 without exposing dependency details', async () => {
  const unavailable = createApp(env, async () => ({ mongo: true, redis: false }));
  const response = await request(unavailable).get('/api/health/ready').expect(503);
  assert.equal(response.body.error.code, 'DEPENDENCIES_UNAVAILABLE');
  assert.equal(response.body.error.requestId, response.headers['x-request-id']);
  assert.deepEqual(Object.keys(response.body), ['error']);
});
test('readiness requires both dependencies', async () => {
  const response = await request(app).get('/api/health/ready').expect(200);
  assert.equal(response.body.data.status, 'ready');
});
test('foreign origins are rejected; exact local origin is allowed', async () => {
  const rejected = await request(app).get('/api/health/live').set('Origin', 'https://untrusted.example').expect(403);
  assert.equal(rejected.body.error.code, 'ORIGIN_NOT_ALLOWED');
  const accepted = await request(app).get('/api/health/live').set('Origin', 'http://localhost:3000').expect(200);
  assert.equal(accepted.headers['access-control-allow-origin'], 'http://localhost:3000');
  assert.equal(accepted.headers['access-control-allow-credentials'], 'true');
});
test('unexpected query input and unknown endpoints use consistent errors', async () => {
  const invalid = await request(app).get('/api/health/live?$where=ignored').expect(400);
  assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');
  const missing = await request(app).get('/api/nonexistent').expect(404);
  assert.equal(missing.body.error.code, 'NOT_FOUND');
});
test('invalid and oversized JSON do not echo submitted data', async () => {
  const invalid = await request(app).post('/api/nonexistent').set('Content-Type', 'application/json').send('{"private-value":').expect(400);
  assert.equal(invalid.body.error.code, 'INVALID_JSON');
  assert.ok(!JSON.stringify(invalid.body).includes('private-value'));
  const oversized = await request(app).post('/api/nonexistent').send({ text: 'x'.repeat(33_000) }).expect(413);
  assert.equal(oversized.body.error.code, 'PAYLOAD_TOO_LARGE');
});
test('unexpected dependency errors are redacted', async () => {
  const failing = createApp(env, async () => { throw new Error('private-connection-detail'); });
  const result = await request(failing).get('/api/health/ready').expect(500);
  assert.equal(result.body.error.code, 'INTERNAL_ERROR');
  assert.ok(!JSON.stringify(result.body).includes('private-connection-detail'));
});
test('environment rejects unsafe origins and redacts invalid secret values', () => {
  assert.throws(() => parseEnv({ FRONTEND_URL: 'https://example.org/path' }), /FRONTEND_URL/);
  assert.throws(() => parseEnv({ REDIS_URL: 'private-value' }), error =>
    error instanceof Error && error.message.includes('REDIS_URL') && !error.message.includes('private-value'));
  assert.throws(() => parseEnv({ NODE_ENV: 'production' }), /Production requires/);
  assert.throws(() => parseEnv({ NODE_ENV: 'production', MONGODB_URI: 'mongodb://localhost', FRONTEND_URL: 'http://example.org' }), /HTTPS/);
});
test('Codespaces allow-list includes only this Codespace frontend', () => {
  const configured = parseEnv({ NODE_ENV: 'development', CODESPACE_NAME: 'hrpf-demo' });
  assert.ok(configured.allowedOrigins.includes('https://hrpf-demo-3000.app.github.dev'));
  assert.ok(!configured.allowedOrigins.includes('https://other-3000.app.github.dev'));
});
test('database names accept blank defaults and surrounding spaces, but reject invalid names safely', () => {
  assert.equal(parseEnv({ MONGODB_DB_NAME: '  ' }).MONGODB_DB_NAME, 'hrpf_dev');
  assert.equal(parseEnv({ MONGODB_DB_NAME: ' hrpf_dev ' }).MONGODB_DB_NAME, 'hrpf_dev');
  assert.equal(parseEnv({ MONGODB_DB_NAME: 'hrpf_prod' }).MONGODB_DB_NAME, 'hrpf_prod');
  assert.throws(() => parseEnv({ MONGODB_DB_NAME: 'private/invalid-name' }), error =>
    error instanceof Error && error.message.includes('MONGODB_DB_NAME') && !error.message.includes('private/invalid-name'));
});
