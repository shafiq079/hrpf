import assert from 'node:assert/strict';
import test from 'node:test';
import { createNavigationTracker, isPageNavigation } from '../lib/navigation-feedback.ts';

test('a streamed fallback keeps progress active after the clicked link finishes', () => {
  const tracker = createNavigationTracker();
  tracker.start('link');
  tracker.start('route-fallback');
  tracker.finish('link');
  assert.equal(tracker.snapshot(), true);
  tracker.finish('route-fallback');
  assert.equal(tracker.snapshot(), false);
});

test('cancelling an older navigation does not hide a newer pending navigation', () => {
  const tracker = createNavigationTracker();
  tracker.start('first');
  tracker.start('second');
  tracker.finish('first');
  assert.equal(tracker.snapshot(), true);
  tracker.finish('second');
  assert.equal(tracker.snapshot(), false);
});

test('error recovery and back-forward document restoration clear stale progress', () => {
  const tracker = createNavigationTracker();
  tracker.start('document');
  tracker.start('fallback');
  tracker.reset();
  assert.equal(tracker.snapshot(), false);
  tracker.finish('fallback');
  assert.equal(tracker.snapshot(), false);
});

test('search changes navigate while same-page anchors and external links stay native', () => {
  const current = 'https://hrpf.org/gallery?page=1';
  assert.equal(isPageNavigation('/gallery?page=2', current), true);
  assert.equal(isPageNavigation('/contact', current), true);
  assert.equal(isPageNavigation('#main-content', current), false);
  assert.equal(isPageNavigation('/gallery?page=1', current), false);
  assert.equal(isPageNavigation('https://youtube.com/watch?v=fixture', current), false);
  assert.equal(isPageNavigation('mailto:info@hrpf.org', current), false);
});


test('prefetched navigation finishes on route commit without clearing a later destination', () => {
  const tracker = createNavigationTracker();
  tracker.start('prefetched', '/projects?');
  tracker.start('later', '/blogs?');
  tracker.committed('/projects?');
  assert.equal(tracker.snapshot(), true);
  tracker.committed('/blogs?');
  assert.equal(tracker.snapshot(), false);
});
