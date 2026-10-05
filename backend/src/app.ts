import { randomUUID } from 'node:crypto';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import type { Environment } from './config/env.js';
import type { Readiness } from './infrastructure/dependencies.js';

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message); }
}
export function createApp(env: Environment, readiness: Readiness) {
  const app = express();
  app.disable('x-powered-by');
  // Deployment-specific proxy trust is established in M2 before public forms.
  app.set('trust proxy', false);
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
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  }));
  app.use(express.json({ limit: '32kb', strict: true }));
  // M1 has health endpoints only. Replace process-local protection with Redis
  // per-client limits in M2 before business endpoints or public submissions.
  app.use('/api', rateLimit({
    windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false,
    skip: req => req.path === '/health/live' || req.path === '/health/ready',
    handler: (_req, _res, next) => next(new ApiError(429, 'RATE_LIMITED', 'Too many requests. Try again later.')),
  }));
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
  app.use((_req, _res, next) => next(new ApiError(404, 'NOT_FOUND', 'Endpoint not found.')));
  const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    let known = error instanceof ApiError ? error : undefined;
    if (!known && error && typeof error === 'object' && 'type' in error) {
      if (error.type === 'entity.too.large') known = new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
      if (error.type === 'entity.parse.failed') known = new ApiError(400, 'INVALID_JSON', 'Request body must be valid JSON.');
    }
    res.status(known?.status ?? 500).json({ error: {
      code: known?.code ?? 'INTERNAL_ERROR',
      message: known?.message ?? 'An unexpected error occurred.',
      requestId: res.locals.requestId,
    } });
  };
  app.use(errorHandler);
  return app;
}
