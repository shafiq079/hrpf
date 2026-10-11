import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import { z } from 'zod';
import { AuditLog, Counter, User, VideoInterview } from '../domain/models.js';
import { bumpPublicRevision } from '../services/public-cache.js';
import { fetchYouTubeMetadata, type YouTubeMetadataReader } from '../services/youtube-metadata.js';

const manifestSchema = z.object({
  version: z.literal('hrpf-youtube-v1'),
  videos: z.array(z.object({
    videoUrl: z.string().regex(/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/),
    category: z.enum(['tv-interviews', 'media-coverage']),
    sortOrder: z.number().int().min(0).max(100000),
  }).strict()).length(28),
}).strict().refine(value => new Set(value.videos.map(v => v.videoUrl)).size === value.videos.length, 'Duplicate video');
export type VideoManifest = z.infer<typeof manifestSchema>;
export async function loadVideoManifest(): Promise<VideoManifest> {
  return manifestSchema.parse(JSON.parse(await readFile(new URL('../../seed/youtube-videos.json', import.meta.url), 'utf8')));
}
export type VideoSeedResult = { videoUrl: string; category: string; status: 'created' | 'preserved' | 'planned' | 'failed' };
const seedKey = (videoUrl: string) => `youtube:${new URL(videoUrl).searchParams.get('v')}`;
export async function planVideoSeed(manifest: VideoManifest): Promise<VideoSeedResult[]> {
  return Promise.all(manifest.videos.map(async video => ({ ...video, status: await VideoInterview.exists({ $or: [{ videoUrl: video.videoUrl }, { seedKey: seedKey(video.videoUrl) }] }) ? 'preserved' as const : 'planned' as const })));
}
export async function applyVideoSeed(manifest: VideoManifest, actorId: string, readMetadata: YouTubeMetadataReader = fetchYouTubeMetadata, report?: (result: VideoSeedResult) => void): Promise<VideoSeedResult[]> {
  const results: VideoSeedResult[] = [];
  for (const video of manifest.videos) {
    let status: VideoSeedResult['status'];
    try {
      const key = seedKey(video.videoUrl);
      const existing = await VideoInterview.exists({ $or: [{ videoUrl: video.videoUrl }, { seedKey: key }] });
      if (existing) status = 'preserved';
      else {
        // Fetch before opening a transaction; never seed guessed titles or placeholders.
        const metadata = await readMetadata(video.videoUrl);
        status = await mongoose.connection.transaction(async tx => {
          await Counter.findOneAndUpdate({ key: 'security:user-governance' }, { $inc: { sequence: 1 } }, { session: tx, upsert: true });
          const actor = await User.findOne({ _id: actorId, active: true, role: { $in: ['super_admin', 'admin'] } }).session(tx);
          if (!actor) throw new Error('Active seed administrator required');
          if (await VideoInterview.exists({ $or: [{ videoUrl: video.videoUrl }, { seedKey: key }] }).session(tx)) return 'preserved' as const;
          const [row] = await VideoInterview.create([{
            ...video, seedKey: key, title: { en: metadata.title }, sourceName: metadata.sourceName,
            youtubeThumbnailUrl: metadata.thumbnailUrl, description: { en: '' },
            reviewStatus: 'approved', publishedAt: new Date(),
          }], { session: tx });
          await bumpPublicRevision(tx);
          await AuditLog.create([{ actorId, action: 'interviews.seed', entityType: 'VideoInterview', entityId: row!.id, outcome: 'success', changedFields: ['videoUrl', 'category', 'title', 'youtubeThumbnailUrl', 'publishedAt'] }], { session: tx });
          return 'created' as const;
        });
      }
    } catch { status = 'failed'; }
    const result = { videoUrl: video.videoUrl, category: video.category, status };
    results.push(result); report?.(result);
  }
  return results;
}
