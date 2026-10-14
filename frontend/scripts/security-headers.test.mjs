import {test} from 'node:test';
import assert from 'node:assert/strict';
import {securityHeaders} from '../lib/security-headers.ts';

test('only local development allows eval and general development WebSockets', () => {
  for (const preview of [false, true]) {
    const production = securityHeaders(false, preview).find(h => h.key === 'Content-Security-Policy').value;
    assert.ok(!production.includes("'unsafe-eval'"));
    assert.doesNotMatch(production, /\s(?:ws:|wss:)(?:\s|;|$)/);
  }
  const development = securityHeaders(true, false).find(h => h.key === 'Content-Security-Policy').value;
  assert.ok(development.includes("'unsafe-eval'") && development.includes(' ws: wss:'));
});

test('Vercel toolbar sources are available only in preview builds', () => {
  const production = securityHeaders(false, false).map(h => h.value).join('; ');
  for (const host of ['vercel.live', 'vercel.com', 'pusher.com']) assert.ok(!production.includes(host));
  const preview = securityHeaders(false, true).find(h => h.key === 'Content-Security-Policy').value;
  for (const host of ['https://vercel.live', 'https://vercel.com', 'https://assets.vercel.com', 'wss://ws-us3.pusher.com']) assert.ok(preview.includes(host));
});
