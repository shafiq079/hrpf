import { readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { complaintInput, contactInput, membershipInput } from '../http/contracts.js';
import { credentials, newPassword } from '../security/auth.js';
import { purpose } from '../services/forms.js';
import { roles } from '../domain/models.js';
const jsonSchema = (value: z.ZodType) => { const { $schema: _schema, ...schema } = z.toJSONSchema(value, { io: 'input', unrepresentable: 'any' }); return schema; };
const user = z.object({ id: z.string(), name: z.string(), email: z.email(), role: z.enum(roles) });
const safeAdminUser = user.extend({ active: z.boolean(), version: z.number().int() });
const schemas = {
  ComplaintInput: jsonSchema(complaintInput), MembershipInput: jsonSchema(membershipInput), ContactInput: jsonSchema(contactInput),
  LoginInput: jsonSchema(credentials), FormSessionInput: jsonSchema(z.object({ purpose, botToken: z.string().min(1).max(2048) }).strict()),
  ForgotInput: jsonSchema(z.object({ email: z.email().max(254) }).strict()),
  ResetInput: jsonSchema(z.object({ token: z.string().min(43).max(100), password: newPassword }).strict()),
  UserCreateInput: jsonSchema(z.object({ name: z.string().trim().min(1).max(150), email: z.email().max(254), role: z.enum(roles), password: newPassword }).strict()),
  UserUpdateInput: jsonSchema(z.object({ version: z.number().int().nonnegative(), name: z.string().trim().min(1).max(150).optional(), role: z.enum(roles).optional(), active: z.boolean().optional() }).strict()),
  Error: jsonSchema(z.object({ error: z.object({ code: z.string(), message: z.string(), requestId: z.string().uuid(), fields: z.array(z.string()).optional() }) })),
};
const csrfSecurity = { csrfHeader: [], csrfCookie: [] }, adminSecurity = { accessCookie: [] };
const response = (data: z.ZodType) => ({ description: 'Success', content: { 'application/json': { schema: jsonSchema(z.object({ data })) } } });
const received = z.object({ reference: z.string().optional(), status: z.literal('received') });
const paths: Record<string, Record<string, unknown>> = {};
function operation(path: string, method: string, summary: string, data: z.ZodType, options: { body?: keyof typeof schemas; status?: string; security?: Record<string, never[]>[]; parameters?: unknown[]; description?: string } = {}) {
  paths[path] ??= {};
  paths[path][method] = { summary, ...(options.description ? { description: options.description } : {}),
    security: options.security ?? [], ...(options.parameters ? { parameters: options.parameters } : {}),
    ...(options.body ? { requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${options.body}` } } } } } : {}),
    responses: { [options.status ?? '200']: response(data), default: { description: 'Redacted validation, authorization, conflict, limit or dependency error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
  };
}
const parameter = (name: string, values?: string[]) => ({ name, in: values ? 'query' : 'path', required: true, schema: values ? { type: 'string', enum: values } : { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } });
operation('/api/health/live', 'get', 'Process liveness', z.object({ status: z.literal('alive') }));
operation('/api/health/ready', 'get', 'MongoDB and Redis readiness', z.object({ status: z.literal('ready') }));
operation('/api/auth/csrf', 'get', 'Issue a signed session-bound CSRF token and HttpOnly cookie', z.object({ csrfToken: z.string() }));
operation('/api/auth/login', 'post', 'Administrator login', z.object({ user, csrfToken: z.string() }), { body: 'LoginInput', security: [csrfSecurity] });
operation('/api/auth/refresh', 'post', 'Rotate refresh session; replay revokes the family', z.object({ csrfToken: z.string() }), { security: [{ ...csrfSecurity, refreshCookie: [] }] });
operation('/api/auth/logout', 'post', 'Revoke current session and clear cookies', z.object({ status: z.literal('signed_out') }), { security: [{ ...csrfSecurity, ...adminSecurity }] });
operation('/api/auth/me', 'get', 'Read current safe administrator profile', z.object({ user }), { security: [adminSecurity] });
operation('/api/auth/forgot-password', 'post', 'Queue reset without disclosing account existence', z.object({ status: z.literal('accepted'), message: z.string() }), { body: 'ForgotInput', security: [csrfSecurity] });
operation('/api/auth/reset-password', 'post', 'Consume reset token and revoke all user sessions', z.object({ status: z.literal('password_reset') }), { body: 'ResetInput', security: [csrfSecurity] });
operation('/api/forms/session', 'post', 'Issue a 15-minute purpose-bound form ticket after Turnstile verification', z.object({ ticket: z.string(), purpose, expiresIn: z.literal(900) }), { body: 'FormSessionInput', status: '201' });
for (const [path, body] of [['complaints', 'ComplaintInput'], ['membership-applications', 'MembershipInput'], ['contact-messages', 'ContactInput']] as const) {
  operation(`/api/${path}`, 'post', 'Persist validated form and email outbox atomically', received, { body, status: '201', description: 'Use the original ticket and UUID submissionKey for retries within the ticket lifetime. Same key with different data returns 409. Received confirms storage, not email delivery or approval. Membership requires an enabled policy.' });
}
operation('/api/admin/users', 'get', 'List up to 100 users; super_admin only', z.array(safeAdminUser), { security: [adminSecurity] });
operation('/api/admin/users', 'post', 'Create administrator; super_admin only', safeAdminUser, { body: 'UserCreateInput', status: '201', security: [{ ...csrfSecurity, ...adminSecurity }] });
operation('/api/admin/users/{id}', 'patch', 'Update current version; preserve last active super_admin', safeAdminUser, { body: 'UserUpdateInput', parameters: [parameter('id')], security: [{ ...csrfSecurity, ...adminSecurity }] });
const uploadResult = z.object({ assetId: z.string(), format: z.string(), bytes: z.number(), scanStatus: z.literal('clean') });
for (const [path, admin] of [['/api/form-uploads', false], ['/api/admin/assets', true]] as const) {
  operation(path, 'post', 'Scan and stage one restricted file; JPG/PNG/WebP 5 MB or PDF 10 MB', uploadResult, { status: '201', parameters: [parameter('purpose', admin ? ['content', 'certificate'] : ['complaint', 'membership'])], security: admin ? [{ ...csrfSecurity, ...adminSecurity }] : [{ formTicketHeader: [] }] });
  const value = paths[path]!.post as Record<string, unknown>;
  value.requestBody = { required: true, content: { 'multipart/form-data': { schema: { type: 'object', additionalProperties: false, required: ['file'], properties: { file: { type: 'string', format: 'binary' } } } } } };
}
operation('/api/admin/assets/{id}', 'delete', 'Queue deletion of your own unused staged asset', z.object({ status: z.literal('deletion_queued') }), { parameters: [parameter('id')], security: [{ ...csrfSecurity, ...adminSecurity }] });
operation('/api/admin/assets/{id}/content', 'get', 'Authorize and stream restricted file; no provider URL', z.unknown(), { parameters: [parameter('id')], security: [adminSecurity] });
const assetGet = paths['/api/admin/assets/{id}/content']!.get as Record<string, unknown>;
(assetGet.responses as Record<string, unknown>)['200'] = { description: 'Private no-store attachment, streamed after role authorization.', content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } } };
operation('/api/admin/audit', 'get', 'Read up to 100 redacted append-only audit records; admin/super_admin', z.array(z.object({ _id: z.string(), action: z.string(), entityType: z.string(), entityId: z.string().optional(), outcome: z.enum(['success', 'denied']), changedFields: z.array(z.string()).optional(), createdAt: z.string() })), { security: [adminSecurity] });
operation('/api/admin/outbox', 'get', 'Read up to 100 delivery statuses; excludes recipients and tokens; admin/super_admin', z.array(z.object({ _id: z.string(), template: z.string(), entityType: z.string(), entityId: z.string().optional(), status: z.string(), attempts: z.number(), nextAttemptAt: z.string(), errorCode: z.string().optional(), createdAt: z.string() })), { security: [adminSecurity] });
operation('/api/admin/outbox/{id}/retry', 'post', 'Retry a failed outbox record; admin/super_admin', z.object({ status: z.literal('retry_queued') }), { parameters: [parameter('id')], security: [{ ...csrfSecurity, ...adminSecurity }] });
const document = { openapi: '3.1.0', info: { title: 'HRPF M2 API', version: '0.2.0', description: 'Implemented backend foundations. Content reads and operational review/approval workflows are later milestones. Browser clients use the frontend same-origin /api rewrite and credentials. All mutating auth/admin requests require the exact configured Origin and X-CSRF-Token. Production cookies use Secure, HttpOnly, SameSite=Lax, Path=/, no Domain; development names omit __Host-.' }, paths, components: { schemas, securitySchemes: {
  accessCookie: { type: 'apiKey', in: 'cookie', name: '__Host-hrpf-access' }, refreshCookie: { type: 'apiKey', in: 'cookie', name: '__Host-hrpf-refresh' },
  csrfCookie: { type: 'apiKey', in: 'cookie', name: '__Host-hrpf-csrf' }, csrfHeader: { type: 'apiKey', in: 'header', name: 'X-CSRF-Token' },
  formTicketHeader: { type: 'apiKey', in: 'header', name: 'X-Form-Ticket' },
} } };
const file = new URL('../../openapi.json', import.meta.url);
const output = `${JSON.stringify(document, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (await readFile(file, 'utf8') !== output) throw new Error('OpenAPI contract is stale. Run npm run api:generate.');
  console.log('OpenAPI contract matches the implemented schemas.');
} else { await writeFile(file, output); console.log('OpenAPI contract generated.'); }
