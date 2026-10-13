import assert from 'node:assert/strict';
import test from 'node:test';
import { toast } from 'sonner';
import { notify } from '../lib/notifications.ts';

// Sonner schedules browser dismissals on the next animation frame.
globalThis.requestAnimationFrame = callback => setTimeout(callback, 0);
globalThis.cancelAnimationFrame = clearTimeout;

test('repeated failures update one notification and a successful retry replaces it', () => {
  const before = toast.getHistory().length;
  notify.error('Request origin is not allowed.');
  notify.error('Request origin is not allowed.');
  notify.error('Complete the verification and try again.');
  assert.equal(toast.getHistory().length, before + 1);
  const failure = toast.getHistory().at(-1);
  assert.equal(failure.title, 'Complete the verification and try again.');
  assert.equal(failure.duration, Infinity);
  notify.success('Your complaint has been received.');
  assert.equal(toast.getHistory().length, before + 1);
  assert.equal(toast.getHistory().at(-1).type, 'success');
  assert.equal(toast.getHistory().at(-1).duration, 4000);
});

test('verification feedback stays independent from submission feedback', () => {
  notify.error('Verification could not load.', 'verification-contact');
  notify.success('Profile saved.');
  const verification = toast.getHistory().find(item => item.id === 'verification-contact');
  assert.equal(verification.type, 'error');
  assert.equal(toast.getHistory().find(item => item.id === 'hrpf-action-feedback').type, 'success');
  notify.dismiss('verification-contact');
  assert.equal(toast.getToasts().some(item => item.id === 'verification-contact'), false);
});

test('partial publication failures are warnings and never claim publication succeeded', () => {
  notify.failure('Your draft was saved, but publication failed. Please try again.');
  const feedback = toast.getHistory().find(item => item.id === 'hrpf-action-feedback');
  assert.equal(feedback.type, 'warning');
  assert.equal(feedback.duration, Infinity);
  assert.match(feedback.title, /draft was saved, but publication failed/);
});
