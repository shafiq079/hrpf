import { it } from 'node:test';
import assert from 'node:assert/strict';
import { fetchYouTubeMetadata } from '../src/services/youtube-metadata.js';
import { loadVideoManifest } from '../src/seed/videos.js';
import { ApiError } from '../src/http/errors.js';
const payload = { title: 'Original YouTube title', author_name: 'HRPF', thumbnail_url: 'https://i.ytimg.com/vi/f1ZNo-4YzzE/hqdefault.jpg', html: '<script>ignored</script>' };
const request = (body: unknown, status = 200): typeof fetch => async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
it('fetches metadata only from the fixed YouTube endpoint, strips HTML and normalizes share links', async () => {
  const value = await fetchYouTubeMetadata('https://youtu.be/f1ZNo-4YzzE?si=tracking', async (url, options) => {
    assert.equal(new URL(String(url)).origin, 'https://www.youtube.com');
    assert.equal(new URL(String(url)).searchParams.get('url'), 'https://www.youtube.com/watch?v=f1ZNo-4YzzE');
    assert.equal(options?.redirect, 'error');
    return new Response(JSON.stringify(payload));
  });
  assert.deepEqual(value, { title: payload.title, sourceName: payload.author_name, thumbnailUrl: payload.thumbnail_url });
});
it('rejects non-YouTube links before making a network request', async () => {
  await assert.rejects(fetchYouTubeMetadata('https://youtube.com.evil.test/watch?v=f1ZNo-4YzzE', async () => { assert.fail('Network must not be called'); }), (error: unknown) => error instanceof ApiError && error.status === 400);
});
it('unavailable, malformed, arbitrary-host, mismatched and oversized metadata fail without guessed titles', async () => {
  for (const fixture of [request({}, 404), request({ ...payload, title: '' }), request({ ...payload, thumbnail_url: 'https://evil.test/image.jpg' }), request({ ...payload, thumbnail_url: 'https://i.ytimg.com/vi/IbrCvA5g7us/hqdefault.jpg' }), request({ ...payload, html: 'x'.repeat(40000) })]) {
    await assert.rejects(fetchYouTubeMetadata('https://youtu.be/f1ZNo-4YzzE', fixture), (error: unknown) => error instanceof ApiError && error.code === 'VIDEO_METADATA_UNAVAILABLE');
  }
});
it('the approved manifest has 28 unique IDs, 5 interviews and 23 coverage videos', async () => {
  const manifest = await loadVideoManifest();
  assert.equal(new Set(manifest.videos.map(v => v.videoUrl)).size, 28);
  assert.equal(manifest.videos.filter(v => v.category === 'tv-interviews').length, 5);
  assert.equal(manifest.videos.filter(v => v.category === 'media-coverage').length, 23);
});
