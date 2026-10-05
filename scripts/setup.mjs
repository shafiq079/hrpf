import { execFileSync } from 'node:child_process';
import { existsSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('Use Node.js 24 before running setup.');
for (const directory of ['frontend', 'backend']) {
  execFileSync('npm', ['ci', '--no-fund', '--no-audit'], {
    cwd: path.join(root, directory), stdio: 'inherit',
  });
}
const envPath = path.join(root, 'backend/.env');
if (!existsSync(envPath)) {
  copyFileSync(path.join(root, 'backend/.env.example'), envPath);
  console.log('Created backend/.env. Configure MONGODB_URI privately; Codespaces secrets take priority.');
}
console.log('Dependencies installed. Redis is provided by the rebuilt devcontainer.');
