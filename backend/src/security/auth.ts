import { Router, type Request, type Response, type RequestHandler } from 'express';
import { SignJWT, jwtVerify } from 'jose';
import mongoose, { Types } from 'mongoose';
import { z } from 'zod';
import type { Environment } from '../config/env.js';
import { User, AuthSession, AuditLog, EmailOutbox } from '../domain/models.js';
import { ApiError, unavailable, validate } from '../http/errors.js';
import { digest, encrypt, equal, hashPassword, keyedHash, token, verifyPassword } from './crypto.js';
export type Principal = { id: string; name: string; email: string; role: 'super_admin' | 'admin' | 'editor' | 'case_manager'; sessionId: string };
export const credentials = z.object({ email: z.email().max(254).transform(v => v.toLowerCase().trim()), password: z.string().min(1).max(200) }).strict();
export const newPassword = z.string().min(12).max(200);
export function cookieNames(env: Environment) {
  const prefix = env.NODE_ENV === 'production' ? '__Host-' : '';
  return { access: `${prefix}hrpf-access`, refresh: `${prefix}hrpf-refresh`, csrf: `${prefix}hrpf-csrf` };
}
function cookies(req: Request) {
  const result: Record<string, string> = {};
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const index = part.indexOf('='); if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (Object.hasOwn(result, key)) throw new ApiError(400, 'INVALID_COOKIE', 'Invalid cookie header.');
    try { result[key] = decodeURIComponent(part.slice(index + 1)); } catch { throw new ApiError(400, 'INVALID_COOKIE', 'Invalid cookie header.'); }
  }
  return result;
}
export function createAuth(env: Environment) {
  const names = cookieNames(env);
  const settings = { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
  function enabled() { if (!env.JWT_ACCESS_SECRET || !env.JWT_REFRESH_SECRET) throw unavailable(); }
  const secret = (kind: 'access' | 'refresh') => new TextEncoder().encode(kind === 'access' ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET);
  async function sign(kind: 'access' | 'refresh', userId: string, sessionId: string, version: number) {
    enabled();
    return new SignJWT({ sid: sessionId, av: version, kind }).setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setSubject(userId).setIssuer('hrpf-api').setAudience(`hrpf-${kind}`).setIssuedAt().setExpirationTime(kind === 'access' ? '15m' : '7d').sign(secret(kind));
  }
  async function decode(value: string, kind: 'access' | 'refresh') {
    enabled();
    const { payload } = await jwtVerify(value, secret(kind), { algorithms: ['HS256'], issuer: 'hrpf-api', audience: `hrpf-${kind}` });
    if (payload.kind !== kind || typeof payload.sub !== 'string' || typeof payload.sid !== 'string' || !Types.ObjectId.isValid(payload.sid) || !Types.ObjectId.isValid(payload.sub) || !Number.isInteger(payload.av)) throw new Error('Invalid token');
    return { userId: payload.sub, sessionId: payload.sid, version: payload.av as number };
  }
  async function binding(req: Request) {
    const refresh = cookies(req)[names.refresh];
    if (!refresh) return 'anonymous';
    try { return (await decode(refresh, 'refresh')).sessionId; } catch { throw new ApiError(401, 'AUTH_REQUIRED', 'Sign in to continue.'); }
  }
  function issueCsrf(res: Response, bound: string) {
    const nonce = token();
    res.cookie(names.csrf, nonce, { ...settings, maxAge: 7 * 86400000 });
    return `${nonce}.${keyedHash(`${bound}:${nonce}`, env.JWT_REFRESH_SECRET!)}`;
  }
  const csrf: RequestHandler = async (req, _res, next) => {
    enabled();
    if (!req.headers.origin || !env.allowedOrigins.includes(req.headers.origin) || req.headers['sec-fetch-site'] === 'cross-site') throw new ApiError(403, 'CSRF_REJECTED', 'Request verification failed.');
    const nonce = cookies(req)[names.csrf]; const supplied = req.get('X-CSRF-Token');
    const bound = await binding(req);
    if (!nonce || !supplied || !equal(supplied, `${nonce}.${keyedHash(`${bound}:${nonce}`, env.JWT_REFRESH_SECRET!)}`)) throw new ApiError(403, 'CSRF_REJECTED', 'Request verification failed.');
    next();
  };
  const authenticate: RequestHandler = async (req, res, next) => {
    enabled(); const value = cookies(req)[names.access];
    if (!value) throw new ApiError(401, 'AUTH_REQUIRED', 'Sign in to continue.');
    let decoded;
    try { decoded = await decode(value, 'access'); } catch { throw new ApiError(401, 'AUTH_REQUIRED', 'Sign in to continue.'); }
    const session = await AuthSession.findOne({ _id: decoded.sessionId, userId: decoded.userId, revokedAt: null, expiresAt: { $gt: new Date() } });
    const user = await User.findOne({ _id: decoded.userId, active: true, authVersion: decoded.version });
    if (!session || !user) throw new ApiError(401, 'AUTH_REQUIRED', 'Sign in to continue.');
    res.locals.principal = { id: user.id, email: user.email, name: user.name, role: user.role, sessionId: session.id } satisfies Principal;
    next();
  };
  async function makeSession(userId: string, version: number, familyId: string, dbSession: mongoose.ClientSession) {
    const id = new Types.ObjectId(); const refresh = await sign('refresh', userId, id.toString(), version);
    await AuthSession.create([{ _id: id, userId, refreshHash: digest(refresh), familyId, expiresAt: new Date(Date.now() + 7 * 86400000), csrfHash: digest(token()) }], { session: dbSession });
    return { id: id.toString(), refresh, access: await sign('access', userId, id.toString(), version) };
  }
  function setSession(res: Response, session: { id: string; refresh: string; access: string }) {
    res.cookie(names.access, session.access, { ...settings, maxAge: 15 * 60000 });
    res.cookie(names.refresh, session.refresh, { ...settings, maxAge: 7 * 86400000 });
    return issueCsrf(res, session.id);
  }
  function clear(res: Response) { for (const name of Object.values(names)) res.clearCookie(name, settings); }
  const router = Router();
  router.get('/csrf', async (req, res) => { enabled(); res.json({ data: { csrfToken: issueCsrf(res, await binding(req)) } }); });
  let dummy: Promise<string> | undefined;
  router.post('/login', csrf, async (req, res) => {
    const input = validate(credentials, req.body);
    const user = await User.findOne({ email: input.email }).select('+passwordHash');
    dummy ??= hashPassword(token());
    const correct = await verifyPassword(input.password, user?.passwordHash ?? await dummy);
    if (!user || !user.active || !correct) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    const session = await mongoose.connection.transaction(async tx => {
      const created = await makeSession(user.id, user.authVersion, token(), tx);
      const updated = await User.updateOne({ _id: user._id, active: true, authVersion: user.authVersion }, { $set: { lastLogin: new Date() } }, { session: tx });
      if (!updated.matchedCount) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
      await AuditLog.create([{ actorId: user._id, action: 'auth.login', entityType: 'User', entityId: user.id, outcome: 'success', requestId: res.locals.requestId }], { session: tx });
      return created;
    });
    res.json({ data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, csrfToken: setSession(res, session) } });
  });
  router.post('/refresh', csrf, async (req, res) => {
    const value = cookies(req)[names.refresh];
    if (!value) throw new ApiError(401, 'AUTH_REQUIRED', 'Sign in to continue.');
    let decoded;
    try { decoded = await decode(value, 'refresh'); } catch { clear(res); throw new ApiError(401, 'AUTH_REQUIRED', 'Sign in to continue.'); }
    const result = await mongoose.connection.transaction(async tx => {
      const previous = await AuthSession.findOne({ _id: decoded.sessionId, refreshHash: digest(value) }).session(tx);
      if (!previous) return null;
      if (previous.revokedAt) {
        await AuthSession.updateMany({ familyId: previous.familyId, revokedAt: null }, { $set: { revokedAt: new Date() } }, { session: tx });
        return null;
      }
      const user = await User.findOne({ _id: decoded.userId, active: true, authVersion: decoded.version }).session(tx);
      if (!user || previous.expiresAt <= new Date()) return null;
      const next = await makeSession(user.id, user.authVersion, previous.familyId, tx);
      previous.revokedAt = new Date(); previous.replacedBy = new Types.ObjectId(next.id); await previous.save({ session: tx });
      return next;
    });
    if (!result) { clear(res); throw new ApiError(401, 'AUTH_REQUIRED', 'Sign in to continue.'); }
    res.json({ data: { csrfToken: setSession(res, result) } });
  });
  router.post('/logout', csrf, authenticate, async (_req, res) => {
    const principal = res.locals.principal as Principal;
    await AuthSession.updateOne({ _id: principal.sessionId }, { $set: { revokedAt: new Date() } });
    clear(res); res.json({ data: { status: 'signed_out' } });
  });
  router.get('/me', authenticate, (_req, res) => { const { sessionId: _session, ...user } = res.locals.principal as Principal; res.json({ data: { user } }); });
  router.post('/forgot-password', csrf, async (req, res) => {
    const { email } = validate(z.object({ email: z.email().max(254).transform(v => v.toLowerCase().trim()) }).strict(), req.body);
    if (!env.DATA_ENCRYPTION_KEY || !env.SMTP_HOST || !env.MAIL_FROM || !env.FRONTEND_URL) throw unavailable();
    // The same crypto work and response are used for unknown and inactive accounts.
    const reset = token(); const encryptedToken = encrypt(reset, env.DATA_ENCRYPTION_KEY, 'password-reset');
    await mongoose.connection.transaction(async tx => {
      const user = await User.findOneAndUpdate({ email, active: true }, { $set: { resetHash: digest(reset), resetExpiresAt: new Date(Date.now() + 30 * 60000) } }, { session: tx });
      if (user) await EmailOutbox.create([{ dedupeKey: `reset:${digest(reset)}`, template: 'password-reset', entityType: 'User', entityId: user.id, recipient: user.email, encryptedToken }], { session: tx });
    });
    res.json({ data: { status: 'accepted', message: 'If the account is eligible, reset instructions will be sent.' } });
  });
  router.post('/reset-password', csrf, async (req, res) => {
    const input = validate(z.object({ token: z.string().min(43).max(100), password: newPassword }).strict(), req.body);
    const passwordHash = await hashPassword(input.password);
    const success = await mongoose.connection.transaction(async tx => {
      const user = await User.findOneAndUpdate({ resetHash: digest(input.token), resetExpiresAt: { $gt: new Date() }, active: true }, { $set: { passwordHash }, $unset: { resetHash: 1, resetExpiresAt: 1 }, $inc: { authVersion: 1 } }, { session: tx });
      if (!user) return false;
      await AuthSession.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } }, { session: tx });
      await AuditLog.create([{ actorId: user._id, action: 'auth.password_reset', entityType: 'User', entityId: user.id, outcome: 'success', requestId: res.locals.requestId }], { session: tx });
      return true;
    });
    if (!success) throw new ApiError(400, 'INVALID_RESET_TOKEN', 'The reset link is invalid or expired.');
    clear(res); res.json({ data: { status: 'password_reset' } });
  });
  return { router, authenticate, csrf };
}
