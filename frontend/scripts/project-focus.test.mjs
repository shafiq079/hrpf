import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../lib/project-focus.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { projectFields, projectMatchesField, projectPageLabels, selectedWorkPages, projectAppearsInField } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('related field options are distinct canonical labels and match the same multi-field project', () => {
  const value = 'Children’s Rights, Education and Awareness, Access to Justice';
  assert.deepEqual(projectFields(value), ["Children's Rights", 'Access to Justice', 'Education and Awareness']);
  for (const field of projectFields(value)) assert.equal(projectMatchesField(value, field), true);
  assert.equal(projectMatchesField(value, "Women's Rights"), false);
  assert.equal(projectMatchesField('Research and Advocacy / Minority Rights', 'Minority Rights'), true);
  assert.equal(projectMatchesField('Minority RightsExtended', 'Minority Rights'), false);
});
test('legacy apostrophes, combined separators, case and custom fields remain supported', () => {
  assert.equal(projectMatchesField('women’s rights / Access to Justice', "Women's Rights"), true);
  assert.deepEqual(projectFields('Community Development / Environment'), ['Community Development']);
  assert.deepEqual(projectFields('Local Health, Environment'), ['Local Health', 'Environment']);
  assert.equal(projectMatchesField('Local Health, Environment', 'Local Health'), true);
  assert.equal(projectMatchesField('EnvironmentPlus', 'Environment'), false);
});

test('explicit work-page selections override topic text and preserve All Projects only', () => {
 const project = {focusArea:"Women's Rights, Education and Awareness", workAreas:['minority-rights']};
 assert.deepEqual(projectPageLabels(project), ['Minority Rights']);
 assert.equal(projectAppearsInField(project,"Women's Rights"), false);
 assert.equal(projectAppearsInField(project,'Minority Rights'), true);
 assert.deepEqual(selectedWorkPages({...project,workAreas:[]}), []);
 assert.deepEqual(selectedWorkPages({focusArea:"Children’s Rights, Education and Awareness"}), ['childrens-rights','education-and-awareness']);
});
