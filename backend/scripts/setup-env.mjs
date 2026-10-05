import { copyFileSync, constants } from 'node:fs';
import { fileURLToPath } from 'node:url';

const envPath = fileURLToPath(new URL('../.env', import.meta.url));
const examplePath = fileURLToPath(new URL('../.env.example', import.meta.url));
try {
  copyFileSync(examplePath, envPath, constants.COPYFILE_EXCL);
  console.log('Created backend/.env. Configure MongoDB privately; inherited environment variables take priority.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('Existing backend/.env preserved.');
}
