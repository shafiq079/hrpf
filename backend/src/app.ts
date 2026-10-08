import { randomUUID } from 'node:crypto';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import type { Environment } from './config/env.js';
import type { Readiness } from './infrastructure/dependencies.js';
import { ApiError } from './http/errors.js';
import { createBusiness, type BusinessAdapters } from './http/business.js';
export { ApiError } from './http/errors.js';

export function createApp(env: Environment, readiness: Readiness, adapters?: BusinessAdapters) {
  const app = express();
  app.disable('x-powered-by');
  // Trust only explicitly configured deployment proxy addresses, never arbitrary hops.
  app.set('trust proxy', env.TRUST_PROXY_CIDRS.length ? env.TRUST_PROXY_CIDRS : false);
  app.use((_req, res, next) => {
    res.locals.requestId = randomUUID();
    res.setHeader('X-Request-ID', res.locals.requestId);
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(helmet());
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes(origin)) return callback(null, true);
      callback(new ApiError(403, 'ORIGIN_NOT_ALLOWED', 'Request origin is not allowed.'));
    },
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Form-Ticket', 'X-Upload-Key'],
  }));
  app.use(['/api/admin/projects', '/api/admin/blogs', '/api/admin/news'], express.json({ limit: '256kb', strict: true }));
  app.use(['/api/admin/gallery', '/api/admin/interviews'], express.json({ limit: '64kb', strict: true }));
  app.use(express.json({ limit: '32kb', strict: true }));
  const emptyQuery = z.object({}).strict();
  app.use(['/api/health/live', '/api/health/ready'], (req, _res, next) => {
    if (!emptyQuery.safeParse(req.query).success) {
      return next(new ApiError(400, 'VALIDATION_ERROR', 'This endpoint does not accept query parameters.'));
    }
    next();
  });
  app.get('/api/health/live', (_req, res) => res.json({ data: { status: 'alive' } }));
  app.get('/api/health/ready', async (_req, res, next) => {
    const status = await readiness();
    if (!status.mongo || !status.redis) {
      return next(new ApiError(503, 'DEPENDENCIES_UNAVAILABLE', 'Required services are unavailable.'));
    }
    res.json({ data: { status: 'ready' } });
  });
  if (adapters) app.use('/api', createBusiness(env, adapters).router);
  app.use((_req, _res, next) => next(new ApiError(404, 'NOT_FOUND', 'Endpoint not found.')));
  const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    let known = error instanceof ApiError ? error : undefined;
    if (!known && error && typeof error === 'object' && 'type' in error) {
      if (error.type === 'entity.too.large') known = new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
      if (error.type === 'entity.parse.failed') known = new ApiError(400, 'INVALID_JSON', 'Request body must be valid JSON.');
    }
    if (res.headersSent) { res.destroy(); return; }
    res.setHeader('Cache-Control', 'no-store');
    res.removeHeader('ETag');
    if (!known && error && typeof error === 'object' && 'code' in error && error.code === 11000) known = new ApiError(409, 'CONFLICT', 'A record with this unique value already exists.');
    res.status(known?.status ?? 500).json({ error: {
      code: known?.code ?? 'INTERNAL_ERROR',
      message: known?.message ?? 'An unexpected error occurred.',
      requestId: res.locals.requestId,
      ...(known?.fields ? { fields: known.fields } : {}),
    } });
  };
  app.use(errorHandler);
  return app;
}
