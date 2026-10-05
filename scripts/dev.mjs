import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const children = [];
let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.pid) continue;
    try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Already exited. */ }
  }
  const deadline = setTimeout(() => {
    for (const child of children) {
      if (!child.pid) continue;
      try { process.kill(-child.pid, 'SIGKILL'); } catch { /* Already exited. */ }
    }
    process.exit(code);
  }, 5000);
  Promise.all(children.map(child => child.exitCode !== null || child.signalCode !== null
    ? Promise.resolve() : new Promise(resolve => child.once('exit', resolve))))
    .then(() => { clearTimeout(deadline); process.exit(code); });
}
for (const script of ['dev:backend', 'dev:frontend']) {
  const child = spawn('npm', ['run', script], { cwd: root, stdio: 'inherit', detached: true });
  children.push(child);
  child.once('error', () => { console.error('Unable to start a development process.'); stop(1); });
  child.once('exit', code => { if (!stopping) stop(code ?? 1); });
}
process.once('SIGINT', () => stop(0));
process.once('SIGTERM', () => stop(0));
