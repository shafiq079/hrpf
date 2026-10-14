import assert from 'node:assert/strict';
import test from 'node:test';
import { completedHtml } from './streamed-html.mjs';

test('content checks resolve streamed slots and discard temporary route skeletons', () => {
  const source = '<!--$?--><template id="B:0"></template><main data-page-loading="cards"><section>Loading</section></main><!--/$-->' +
    '<div hidden id="S:0"><main id="main-content"><div><template id="P:1"></template></div><section>Published content</section></main></div>' +
    '<div hidden id="S:1"><h1>Destination heading</h1></div>' +
    '<script>$RS("S:1","P:1");$RC("B:0","S:0")</script>';
  const result = completedHtml(source);
  assert.ok(result.includes('<main id="main-content"><div><h1>Destination heading</h1>'));
  assert.ok(result.includes('Published content'));
  assert.ok(!result.includes('data-page-loading'));
  assert.ok(!result.includes('<div hidden'));
  assert.equal((result.match(/<h1>/g) || []).length, 1);
});
