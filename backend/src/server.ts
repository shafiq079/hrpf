import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { ConfigurationError, parseEnv } from './config/env.js';
import { createRedisServices } from './infrastructure/redis-services.js';
import { createDependencies } from './infrastructure/dependencies.js';

// src/server.ts and dist/server.js both resolve to backend/.env.
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
async function main() {
  const env = parseEnv(process.env);
  const dependencies = createDependencies(env);
  const server = createApp(env, dependencies.readiness, { ready: dependencies.available, redis: createRedisServices(dependencies.redis, env.CLOUDINARY_NAMESPACE) }).listen(env.PORT, '0.0.0.0', () => {
    console.log(`HRPF API listening on port ${env.PORT}.`);
    dependencies.start();
  });
  let closing = false;
  async function shutdown(exitCode: number) {
    if (closing) return;
    closing = true;
    const forceExit = setTimeout(() => process.exit(1), 10_000);
    server.close(async () => {
      await dependencies.close().catch(() => {});
      clearTimeout(forceExit);
      process.exit(exitCode);
    });
    server.closeIdleConnections();
  }
  server.once('error', () => {
    console.error('API failed to listen. Check PORT and running processes.');
    void shutdown(1);
  });
  process.once('SIGINT', () => { void shutdown(0); });
  process.once('SIGTERM', () => { void shutdown(0); });
}
main().catch(error => {
  console.error(error instanceof ConfigurationError ? error.message : 'API startup failed. Check private configuration.');
  process.exitCode = 1;
});
