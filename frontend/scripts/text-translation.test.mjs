import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preferredTranslation, translationSelected } from '../lib/translation.ts';

test('translated document navigation stays safe when browser storage is blocked', t => {
  const previous = { storage: Object.getOwnPropertyDescriptor(globalThis, 'localStorage'), document: Object.getOwnPropertyDescriptor(globalThis, 'document') };
  t.after(() => {
    for (const [key, descriptor] of [['localStorage', previous.storage], ['document', previous.document]]) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
  let value = 'en|ur';
  const documentElement = { lang: 'en' };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { querySelector: () => ({ value }), documentElement } });
  assert.equal(preferredTranslation(), 'en');
  assert.equal(translationSelected(), true, 'pending native selection must not fall back to SPA navigation');
  value = 'en|en'; documentElement.lang = 'ur';
  assert.equal(translationSelected(), true, 'currently translated document still requires safe navigation');
  documentElement.lang = 'en';
  assert.equal(translationSelected(), false, 'restored English may use normal Next navigation');
});
