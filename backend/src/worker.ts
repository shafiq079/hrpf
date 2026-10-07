import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { ConfigurationError, parseEnv } from './config/env.js';
import { createDependencies } from './infrastructure/dependencies.js';
import { createRedisServices } from './infrastructure/redis-services.js';
import { createBusiness } from './http/business.js';
import { assertMailConfiguration, mailSender, startOutboxWorker } from './services/outbox.js';
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
async function main() {
  const env = parseEnv(process.env), deps = createDependencies(env);
  if (env.EMAIL_DELIVERY_MODE !== 'worker') throw new ConfigurationError('Use the API process for EMAIL_DELIVERY_MODE=embedded; do not also start a worker.');
  try { assertMailConfiguration(env); } catch { throw new ConfigurationError('Email worker requires MAIL_FROM and configuration for EMAIL_PROVIDER.'); }
  const uploads = createBusiness(env, { redis: createRedisServices(deps.redis, env.CLOUDINARY_NAMESPACE) }).uploads;
  deps.start();
  const worker = await startOutboxWorker(env, mailSender(env), () => uploads.prune());
  console.log('HRPF outbox worker started.');
  let closing = false;
  const shutdown = async () => {
    if (closing) return; closing = true;
    const timer = setTimeout(() => process.exit(1), 30000);
    await worker.close(); await deps.close(); clearTimeout(timer); process.exit(0);
  };
  process.once('SIGINT', () => { void shutdown(); }); process.once('SIGTERM', () => { void shutdown(); });
}
main().catch(error => { console.error(error instanceof ConfigurationError ? error.message : 'Worker failed. Check private configuration.'); process.exitCode = 1; });
