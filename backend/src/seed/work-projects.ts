import { readFile } from 'node:fs/promises';
import { projectDetailsInput } from '../http/project-details.js';
import { applyHomepageSeed, homepageAssetRoot, homepageFiles } from './homepage.js';
import { validateManifest, type Manifest } from './manifest.js';
import type { UploadProvider } from '../services/uploads.js';

export const workProjectFields = ["Women's Rights", "Children's Rights", 'Access to Justice', 'Minority Rights', 'Education and Awareness', 'Research and Advocacy', 'Refugees and Migrants', 'Community Development'] as const;
export const workProjectAssetRoot = homepageAssetRoot;
export async function loadWorkProjectsManifest(): Promise<Manifest> {
  const manifest = await validateManifest(JSON.parse(await readFile(new URL('../../seed/work-projects-manifest.json', import.meta.url), 'utf8')));
  if (manifest.version !== 'work-projects-v1') throw new Error('Unknown work project manifest.');
  for (const record of manifest.records) {
    if (record.kind !== 'Project' || record.key !== `work-project:${record.payload.slug}` || record.reviewTasks.length || record.payload.locale !== 'en') throw new Error('Only reviewed English work projects may be published.');
    const fields = String(record.payload.focusArea).split(', ');
    if (!fields.length || new Set(fields).size !== fields.length || fields.some(field => !workProjectFields.some(known => known === field))) throw new Error('Unknown or repeated work field.');
    const details = projectDetailsInput.parse(record.payload.details);
    if (!details.overview || !details.challenge || !details.approach || !details.activities.length || !details.outcomes.length) throw new Error('A complete sourced project narrative is required.');
    const evidence = manifest.files.find(file => record.files.includes(file.id) && file.id === `work-evidence:${record.payload.slug}`);
    if (!evidence || evidence.path !== `progress reports/work-project-evidence/${record.payload.slug}.json` || record.files.length !== 2) throw new Error('A project evidence record and reviewed report cover are required.');
    if (!(record.payload.sourceReferences as unknown[] | undefined)?.length) throw new Error('Internal source references are required.');
  }
  return manifest;
}
// Verifies every evidence file and every cover before a database or provider write.
export const workProjectFiles = homepageFiles;
export async function applyWorkProjectsSeed(options: { manifest: Manifest; files: Map<string, Buffer>; actorId: string; namespace: string; provider: UploadProvider; report?: NonNullable<Parameters<typeof applyHomepageSeed>[0]['report']> }) {
  if (options.manifest.records.some(record => record.kind !== 'Project' || !record.key.startsWith('work-project:') || record.reviewTasks.length)) throw new Error('Only reviewed work projects may be imported.');
  return applyHomepageSeed({ ...options, publicationAction: 'work-project.seed-published' });
}
