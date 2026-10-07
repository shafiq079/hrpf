import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEnv } from '../src/config/env.js';
import { assertMailConfiguration, mailSender, type Mail } from '../src/services/outbox.js';

const env = parseEnv({ NODE_ENV: 'test', EMAIL_PROVIDER: 'resend', RESEND_API_KEY: 'private-test-key', MAIL_FROM: 'sender@example.org' });
const bytes = Buffer.from('%PDF-1.4\nSynthetic attachment\n%%EOF');
const mail: Mail = { to: 'user@example.org', subject: 'Test receipt', text: 'Complete synthetic form',
  html: '<p>Complete synthetic form</p>', messageId: '<hrpf-test@example.org>',
  attachments: [{ filename: 'complaint.pdf', content: bytes, contentType: 'application/pdf', contentDisposition: 'attachment' }],
};
test('HTTPS sender transmits full copies and exact original attachments without provider file URLs', async () => {
  const sender = mailSender(env, async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(options?.method, 'POST'); assert.equal(options?.redirect, 'error');
    assert.ok(options?.signal); assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer private-test-key');
    const body = JSON.parse(String(options?.body));
    assert.deepEqual(body.to, [mail.to]); assert.equal(body.from, env.MAIL_FROM);
    assert.equal(body.text, mail.text); assert.equal(body.html, mail.html); assert.equal(body.subject, mail.subject);
    assert.equal(body.headers['Message-ID'], mail.messageId);
    assert.equal(body.attachments.length, 1); assert.equal(body.attachments[0].filename, 'complaint.pdf');
    assert.deepEqual(Buffer.from(body.attachments[0].content, 'base64'), bytes);
    assert.equal(body.attachments[0].path, undefined);
    return Response.json({ id: 'synthetic-provider-id' });
  });
  assert.equal(await sender(mail), 'synthetic-provider-id');
});
test('ambiguous HTTPS responses reuse the same idempotency key; distinct copies use distinct keys', async () => {
  const keys: string[] = []; let calls = 0;
  const sender = mailSender(env, async (_url, options) => {
    keys.push(new Headers(options?.headers).get('Idempotency-Key')!);
    if (++calls === 1) throw new Error('Lost response containing private provider diagnostics');
    return Response.json({ id: 'captured' });
  });
  await assert.rejects(sender(mail), /unavailable/i);
  await sender(mail); await sender({ ...mail, to: 'admin@example.org', messageId: '<hrpf-admin@example.org>' });
  assert.equal(keys[0], keys[1]); assert.notEqual(keys[1], keys[2]);
  assert.ok(!keys[0]!.includes(mail.to));
});
test('provider rate limits, invalid responses and network failures stay retryable and redacted', async () => {
  for (const response of [new Response('private-provider-diagnostic', { status: 429 }),
    new Response('private-provider-diagnostic', { status: 503 }), new Response('invalid-private-json'), Response.json({ error: 'private' })]) {
    await assert.rejects(mailSender(env, async () => response)(mail), error =>
      error instanceof Error && /unavailable/i.test(error.message) && !error.message.includes('private'));
  }
});
test('missing selected-provider configuration never sends and invalid delivery settings fail parsing', async () => {
  let called = false;
  const missing = parseEnv({ EMAIL_PROVIDER: 'resend', MAIL_FROM: 'sender@example.org' });
  await assert.rejects(mailSender(missing, async () => { called = true; return Response.json({ id: 'wrong' }); })(mail));
  assert.equal(called, false); assert.throws(() => assertMailConfiguration(missing));
  assert.throws(() => parseEnv({ EMAIL_DELIVERY_MODE: 'private-value' }), /EMAIL_DELIVERY_MODE/);
  assert.throws(() => parseEnv({ EMAIL_PROVIDER: 'private-value' }), /EMAIL_PROVIDER/);
  assert.doesNotThrow(() => assertMailConfiguration(env));
  assert.doesNotThrow(() => assertMailConfiguration(parseEnv({ SMTP_HOST: 'test.invalid', MAIL_FROM: 'sender@example.org' })));
});
