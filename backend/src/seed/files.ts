import { constants } from 'node:fs';
import { open, mkdir, readFile, realpath, writeFile, link, unlink } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { extname, join, relative, resolve } from 'node:path';
import type { Manifest, SourceFile } from './manifest.js';
const run = promisify(execFile);
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
async function createCompleteFile(path: string, bytes: Buffer | string) {
  const temporary = `${path}.partial-${randomUUID()}`;
  try {
    await writeFile(temporary, bytes, { flag: 'wx', mode: 0o600 });
    // Hard-link a complete file atomically, refusing to overwrite an existing path.
    await link(temporary, path);
  } finally { await unlink(temporary).catch(() => {}); }
}
export type FileResult = { id: string; status: 'verified' | 'missing' | 'mismatch' | 'unsafe-path' | 'unreadable' };
async function contained(root: string, file: string) {
  const rel = relative(root, await realpath(file));
  if (rel.startsWith('..') || rel === '' || resolve(root, rel) !== file) throw new Error('Unsafe source path.');
}
async function bytesAt(root: string, file: SourceFile) {
  const path = resolve(root, file.path);
  await contained(root, path);
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > 20 * 1024 * 1024) throw new Error('Unsafe source size.');
    if (file.archiveEntry) {
      // Extract one allowlisted member to memory, never the archive to disk. No shell.
      const { stdout } = await run('unzip', ['-p', path, file.archiveEntry], { encoding: 'buffer', maxBuffer: 5 * 1024 * 1024, timeout: 10000 });
      return stdout;
    }
    return await handle.readFile();
  } finally { await handle.close(); }
}
export async function verifySources(manifest: Manifest, inputRoot: string): Promise<FileResult[]> {
  let root: string;
  try { root = await realpath(inputRoot); } catch { return manifest.files.map(file => ({ id: file.id, status: 'missing' })); }
  const results: FileResult[] = [];
  for (const file of manifest.files) {
    try {
      const bytes = await bytesAt(root, file);
      results.push({ id: file.id, status: bytes.length === file.bytes && hash(bytes) === file.sha256 ? 'verified' : 'mismatch' });
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      results.push({ id: file.id, status: code === 'ENOENT' ? 'missing' : code === 'ELOOP' || (error instanceof Error && error.message === 'Unsafe source path.') ? 'unsafe-path' : 'unreadable' });
    }
  }
  return results;
}
export function assetCandidates(manifest: Manifest) {
  return manifest.files.filter(file => /^(board-photo:|gallery:|report:|certificate-scan:|branding:)/.test(file.id));
}
export async function prepareAssets(manifest: Manifest, inputRoot: string, outputRoot: string) {
  const input = await realpath(inputRoot);
  await mkdir(outputRoot, { recursive: true, mode: 0o700 });
  const output = await realpath(outputRoot);
  if (output !== resolve(outputRoot)) throw new Error('Prepared directory must not be a symbolic link.');
  const candidates = [];
  for (const file of assetCandidates(manifest)) {
    const bytes = await bytesAt(input, file);
    if (bytes.length !== file.bytes || hash(bytes) !== file.sha256) throw new Error('Source checksum mismatch.');
    const filename = file.id.replaceAll(':', '-') + extname(file.archiveEntry ?? file.path).toLowerCase();
    const path = join(output, filename);
    try { await createCompleteFile(path, bytes); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      await contained(output, path);
      if (hash(await readFile(path)) !== file.sha256) throw new Error('Prepared file changed; existing files are preserved.');
    }
    candidates.push({ sourceId: file.id, filename, sha256: file.sha256, bytes: file.bytes, width: file.width, height: file.height, reviewStatus: 'pending', uploadStatus: 'not-uploaded', needsPdfConversion: file.path.endsWith('.docx') && !file.archiveEntry });
  }
  // This local plan contains checksums, never credentials or provider URLs.
  const plan = JSON.stringify({ manifestVersion: manifest.version, candidates }, null, 2) + '\n';
  const planPath = join(output, 'asset-plan.json');
  try { await createCompleteFile(planPath, plan); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    await contained(output, planPath);
    if (await readFile(planPath, 'utf8') !== plan) throw new Error('Prepared plan changed; use a new output directory.');
  }
  return candidates.length;
}
