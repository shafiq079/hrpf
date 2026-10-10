import { readFile } from 'node:fs/promises';
import { digest } from '../security/crypto.js';

// Owner-approved placeholder replaces these exact supplied portrait files.
// Match source bytes, not a name/slug: copies remain redacted if a profile is renamed,
// while future administrator replacements continue through the normal asset flow.
const replacements: Record<string, string> = {
  babe92240436ff3ad2ea10489184c9d663781b633b98126b68ce3f305118f00d: 'portrait-placeholder.webp',
  c0ed9ba4ee9b154f102aa34db9c0160aab6324e99307e007de2da7bb36dac3bb: 'portrait-placeholder.webp',
};
type Portrait = { bytes: Buffer; sha256: string; format: 'webp' };
// Immutable bundled bytes only. No request, user or database state is cached here.
const files = new Map<string, Promise<Portrait>>();
export function publicPortraitReplacement(sourceHash: string, width?: string): Promise<Portrait> | null {
  const original = replacements[sourceHash];
  if (!original) return null;
  const name = width ? original.replace(".webp", `-${width}.webp`) : original;
  let file = files.get(name);
  if (!file) {
    file = readFile(new URL(`../../assets/portraits/${name}`, import.meta.url)).then(bytes => ({ bytes, sha256: digest(bytes), format: 'webp' as const }));
    files.set(name, file);
    void file.catch(() => files.delete(name));
  }
  // Missing placeholder fails closed; never fall back to the original photograph.
  return file;
}
