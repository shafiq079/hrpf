import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
const env = { ...process.env, NODE_ENV: 'test' };
let redis;
if (!env.TEST_REDIS_URL) {
  const port = await new Promise((resolve, reject) => {
    const server = createServer(); server.on('error', reject);
    server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); });
  });
  redis = spawn(env.TEST_REDIS_BINARY || 'redis-server', ['--bind', '127.0.0.1', '--port', String(port), '--save', '', '--appendonly', 'no'], { stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    redis.once('error', reject); redis.once('exit', code => reject(new Error(`Test Redis exited (${code}). Install Redis or set TEST_REDIS_URL to an isolated test instance.`)));
    redis.stdout.on('data', value => { if (value.toString().includes('Ready to accept connections')) resolve(); });
    redis.stderr.on('data', () => {});
  });
  env.TEST_REDIS_URL = `redis://127.0.0.1:${port}`;
}
const child = spawn(process.execPath, ['--import', 'tsx', '--test', 'test/integration.test.ts'], { stdio: 'inherit', env });
const code = await new Promise(resolve => child.once('exit', code => resolve(code ?? 1)));
if (redis) redis.kill('SIGTERM');
process.exitCode = code;
