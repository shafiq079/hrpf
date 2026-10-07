import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { ConfigurationError, parseEnv } from './config/env.js';
import { createRedisServices } from './infrastructure/redis-services.js';
import { createDependencies } from './infrastructure/dependencies.js';
import { createBusiness } from './http/business.js';
import { assertMailConfiguration, mailSender, startEmbeddedOutbox } from './services/outbox.js';

// src/server.ts and dist/server.js both resolve to backend/.env.
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
async function main() {
  const env = parseEnv(process.env);
  if (env.EMAIL_DELIVERY_MODE === 'embedded') {
    try { assertMailConfiguration(env); } catch { throw new ConfigurationError('Embedded email requires MAIL_FROM and configuration for EMAIL_PROVIDER.'); }
  }
  const dependencies = createDependencies(env);
  const redis = createRedisServices(dependencies.redis, env.CLOUDINARY_NAMESPACE);
  const delivery = env.EMAIL_DELIVERY_MODE === 'embedded' ? startEmbeddedOutbox(env, mailSender(env),
    () => createBusiness(env, { redis }).uploads.prune(), dependencies.available) : undefined;
  const server = createApp(env, dependencies.readiness, { ready: dependencies.available, redis }).listen(env.PORT, '0.0.0.0', () => {
    console.log(`HRPF API listening on port ${env.PORT}.`);
    dependencies.start();
  });
  let closing = false;
  async function shutdown(exitCode: number) {
    if (closing) return;
    closing = true;
    const forceExit = setTimeout(() => process.exit(1), 30_000);
    server.close(async () => {
      await delivery?.close().catch(() => {});
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
