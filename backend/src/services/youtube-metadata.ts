import { z } from 'zod';
import { ApiError } from '../http/errors.js';
import { videoLink } from './video-links.js';

const metadataSchema = z.object({
  title: z.string().trim().min(1).max(200),
  author_name: z.string().trim().max(200),
  thumbnail_url: z.string().url().refine(value => {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'i.ytimg.com' &&
      !url.username && !url.password && !url.port && /^\/vi(?:_webp)?\/[A-Za-z0-9_-]{11}\//.test(url.pathname);
  }),
});
export type YouTubeMetadata = { title: string; sourceName: string; thumbnailUrl: string };
export type YouTubeMetadataReader = (videoUrl: string) => Promise<YouTubeMetadata>;

// The user link is normalized, then passed only to YouTube's fixed oEmbed host.
// Neither returned HTML nor arbitrary thumbnail/provider URLs are rendered.
export async function fetchYouTubeMetadata(videoUrl: string, request: typeof fetch = fetch): Promise<YouTubeMetadata> {
  const link = videoLink(videoUrl);
  if (link?.provider !== 'youtube') throw new ApiError(400, 'INVALID_VIDEO', 'Enter an individual YouTube video link.');
  const endpoint = new URL('https://www.youtube.com/oembed');
  endpoint.searchParams.set('url', link.watchUrl);
  endpoint.searchParams.set('format', 'json');
  try {
    const response = await request(endpoint, { signal: AbortSignal.timeout(8000), redirect: 'error', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Unavailable video');
    // Bound the response, including when no Content-Length header is supplied.
    if (Number(response.headers.get('content-length') ?? 0) > 32768) throw new Error('Oversized metadata');
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Empty metadata');
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      for (;;) {
        const next = await reader.read();
        if (next.done) break;
        bytes += next.value.byteLength;
        if (bytes > 32768) throw new Error('Oversized metadata');
        chunks.push(next.value);
      }
    } finally { await reader.cancel(); }
    const value = metadataSchema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    const thumbnailId = new URL(value.thumbnail_url).pathname.split('/')[2];
    if (thumbnailId !== new URL(link.watchUrl).searchParams.get('v')) throw new Error('Mismatched thumbnail');
    return { title: value.title, sourceName: value.author_name, thumbnailUrl: value.thumbnail_url };
  } catch {
    throw new ApiError(422, 'VIDEO_METADATA_UNAVAILABLE', 'YouTube information could not be loaded. Check that the video is public and allows embedding, then try again.');
  }
}
