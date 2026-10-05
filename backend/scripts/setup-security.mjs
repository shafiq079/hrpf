import { randomBytes } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const path = fileURLToPath(new URL('../.env', import.meta.url));
const existing = await readFile(path, 'utf8').catch(() => '');
const keys = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'DATA_ENCRYPTION_KEY', 'CNIC_HASH_KEY'];
const updates = [];
for (const key of keys) {
  // Preserve nonempty configured values; blank examples are safely overridden by
  // one appended value. Inherited Codespaces secrets still take precedence.
  const matches = [...existing.matchAll(new RegExp(`^[ \t]*${key}[ \t]*=[ \t]*(.*)$`, 'gm'))];
  const value = matches.at(-1)?.[1]?.trim();
  if (process.env[key]?.trim() || (value && value !== '""' && value !== "''")) continue;
  updates.push(`${key}=${randomBytes(32).toString(key === 'DATA_ENCRYPTION_KEY' ? 'hex' : 'base64url')}`);
}
if (updates.length) {
  const file = await open(path, 'a', 0o600);
  try { await file.writeFile(`\n# Generated locally; never share these values.\n${updates.join('\n')}\n`); } finally { await file.close(); }
}
console.log(updates.length ? 'Missing security keys added to backend/.env. Existing values preserved; restart the backend.' : 'Existing security keys preserved.');
