import { readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { complaintInput, contactInput, membershipInput } from '../http/contracts.js';
import { credentials, newPassword } from '../security/auth.js';
import { purpose } from '../services/forms.js';
import { publicationInput } from '../http/publication.js';
import { publicSettingSchemas } from '../http/public-content.js';
import { blogDetailsInput } from '../http/blog-details.js';
import { projectDetailsInput } from '../http/project-details.js';
import { reportInput, certificateInput } from '../http/document-content.js';
import { galleryInput, interviewInput } from '../http/media-content.js';
import { projectInput, newsInput } from '../http/managed-content.js';
import { boardInput } from '../http/board-content.js';
import { roles } from '../domain/models.js';
const jsonSchema = (value: z.ZodType) => { const { $schema: _schema, ...schema } = z.toJSONSchema(value, { io: 'input', unrepresentable: 'any' }); return schema; };
const user = z.object({ id: z.string(), name: z.string(), email: z.email(), role: z.enum(roles) });
const safeAdminUser = user.extend({ active: z.boolean(), version: z.number().int() });
const schemas = {
  PublicationInput: jsonSchema(publicationInput),
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
operation('/api/admin/assets/{id}/content', 'get', 'Authorize and stream restricted file; optional inline preview; no provider URL', z.unknown(), { parameters: [parameter('id'), { name: 'preview', in: 'query', schema: { type: 'string', enum: ['1'] } }], security: [adminSecurity] });
const assetGet = paths['/api/admin/assets/{id}/content']!.get as Record<string, unknown>;
(assetGet.responses as Record<string, unknown>)['200'] = { description: 'Private no-store attachment, streamed after role authorization.', content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } } };
operation('/api/admin/audit', 'get', 'Read up to 100 redacted append-only audit records; admin/super_admin', z.array(z.object({ _id: z.string(), action: z.string(), entityType: z.string(), entityId: z.string().optional(), outcome: z.enum(['success', 'denied']), changedFields: z.array(z.string()).optional(), createdAt: z.string() })), { security: [adminSecurity] });
operation('/api/admin/outbox', 'get', 'Read up to 100 delivery statuses; excludes recipients and tokens; admin/super_admin', z.array(z.object({ _id: z.string(), template: z.string(), entityType: z.string(), entityId: z.string().optional(), status: z.string(), attempts: z.number(), nextAttemptAt: z.string(), errorCode: z.string().optional(), createdAt: z.string() })), { security: [adminSecurity] });
operation('/api/admin/outbox/{id}/retry', 'post', 'Retry a failed outbox record; admin/super_admin', z.object({ status: z.literal('retry_queued') }), { parameters: [parameter('id')], security: [{ ...csrfSecurity, ...adminSecurity }] });
const publicParameters = [
  { name: 'locale', in: 'query', schema: { type: 'string', enum: ['en', 'ur'], default: 'en' } },
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 1000, default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 48, default: 12 } },
  { name: 'q', in: 'query', schema: { type: 'string', maxLength: 80 } },
  { name: 'category', in: 'query', schema: { type: 'string', enum: ['media-coverage', 'in-action'] } },
];
const publicContent = z.object({ title: z.string(), blocks: z.array(z.object({ type: z.enum(['paragraph', 'heading', 'list']), text: z.string().optional(), items: z.array(z.string()).optional() })) });
operation('/api/settings/public', 'get', 'Read whitelisted public settings with field-level secret exclusion', z.object(Object.fromEntries(Object.entries(publicSettingSchemas).map(([key, schema]) => [key, schema.optional()]))));
operation('/api/blogs/{slug}', 'get', 'Read a reviewed published article; drafts and future releases return 404', publicContent.extend({ slug: z.string(), excerpt: z.string(), publishedAt: z.string() }), { parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', maxLength: 100 } }, ...publicParameters] });
const listSchemas = {
  board: z.object({ name: z.string(), slug: z.string(), designation: z.string(), rank: z.number(), bio: z.string(), photo: z.string().nullable(), photoAlt: z.string(), photoZoom: z.number(), showOnBoard: z.boolean(), showOnTeam: z.boolean() }),
  'blog-categories': z.object({ slug: z.string(), name: z.string() }),
  blogs: z.object({ title: z.string(), slug: z.string(), excerpt: z.string(), publishedAt: z.string() }),
  gallery: z.object({ id: z.string(), title: z.string(), file: z.string(), category: z.enum(['in-action', 'media-coverage']), alt: z.string(), caption: z.string(), treatment: z.enum(['ORIGINAL', 'AI_RESTORATION']), mediaType: z.enum(['newspaper','photo','graphic']), sourceName: z.string(), sourceUrl: z.string(), eventDate: z.string().optional(), width: z.number().optional(), height: z.number().optional() }),
  interviews: z.object({ id: z.string(), title: z.string(), description: z.string(), provider: z.enum(['youtube','vimeo']), watchUrl: z.string(), embedUrl: z.string(), thumbnail: z.string().nullable(), thumbnailAlt: z.string(), sourceName: z.string(), eventDate: z.string().optional() }),
  reports: z.object({ id: z.string(), title: z.string(), file: z.string(), slug: z.string(), year: z.number().optional(), summary: z.string(), pages: z.number().optional(), download: z.string(), view: z.string(), format: z.string(), bytes: z.number(), edition: z.enum(['complete','public-edition']), releaseNote: z.string(), coverageStart: z.string().optional(), coverageEnd: z.string().optional() }),
  certificates: z.object({ id: z.string(), title: z.string(), file: z.string(), issuer: z.string(), reference: z.string().optional(), issuedAt: z.string().optional(), validFrom: z.string().optional(), expiresAt: z.string().optional(), summary: z.string(), releaseNote: z.string(), view: z.string(), download: z.string(), format: z.string(), bytes: z.number() }),
};
for (const [path, schema] of Object.entries(listSchemas)) {
  operation(`/api/${path}`, 'get', 'Read explicitly projected published records; no provider URLs or private source fields', z.array(schema), { parameters: publicParameters });
  if (['blogs', 'gallery', 'interviews', 'reports', 'certificates'].includes(path)) {
    const op = paths[`/api/${path}`]!.get as { responses: Record<string, unknown> };
    op.responses['200'] = { description: 'Bounded page of reviewed public records', content: { 'application/json': { schema: jsonSchema(z.object({ data: z.array(schema), meta: z.object({ page: z.number(), limit: z.number(), total: z.number(), pages: z.number() }) })) } } };
  }
}
for (const path of ['/api/public-assets/{id}', '/api/reports/{id}/download']) {
  operation(path, 'get', 'Recheck released entity and clean bound file before streaming; never expose restricted originals', z.unknown(), { parameters: [parameter('id')] });
  const op = paths[path]!.get as { responses: Record<string, unknown> };
  op.responses['200'] = { description: 'No-store reviewed file; PDF attachment or inline raster image. Report downloads increment after successful GET, never HEAD.', content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } } };
}
for (const action of ['view', 'download']) {
  const path = `/api/documents/{kind}/{id}/${action}`;
  operation(path,'get',`Stream a currently reviewed report or certificate for ${action}`,z.unknown(),{parameters:[{name:'kind',in:'path',required:true,schema:{type:'string',enum:['reports','certificates']}},parameter('id')]});
  (paths[path]!.get as any).responses['200']={description:action === 'view' ? 'Inline reviewed PDF or raster image, with immediate withdrawal checks' : 'Attachment; only report download GETs increment the counter',content:{'application/octet-stream':{schema:{type:'string',format:'binary'}}}};
}
operation('/api/team','get','Read published profiles selected for Our Team',z.array(listSchemas.board),{parameters:publicParameters});
operation('/api/board/{slug}','get','Read the full published person profile; drafts return 404',listSchemas.board.extend({sections:z.array(z.object({heading:z.string(),body:z.string()}))}),{parameters:[{name:'slug',in:'path',required:true,schema:{type:'string',pattern:'^[a-z0-9]+(?:-[a-z0-9]+)*$',maxLength:100}},...publicParameters]});
for (const method of ['get','post','patch','delete'] as const) {
 const path='/api/admin/board'+(method==='patch'||method==='delete'? '/{id}':'');
 operation(path,method,'Manage Board and Team profiles; administrator role required',method==='get'? z.array(z.unknown()):z.object({id:z.string(),version:z.number(),status:z.string()}),{status:method==='post'?'201':'200',parameters:method==='patch'||method==='delete'?[parameter('id')]:[{name:'page',in:'query',schema:{type:'integer',minimum:1,maximum:1000,default:1}}],security:method==='get'?[adminSecurity]:[{...csrfSecurity,...adminSecurity}]});
 if(method!=='get') (paths[path]![method] as any).requestBody={required:true,content:{'application/json':{schema:jsonSchema(method==='delete'?z.object({version:z.number().int().nonnegative()}).strict():method==='patch'?boardInput.extend({version:z.number().int().nonnegative()}):boardInput)}}};
}
operation('/api/admin/board/{id}','get','Read the private profile editor record without provider metadata',z.unknown(),{parameters:[parameter('id')],security:[adminSecurity]});
for(const kind of ['board','team']) (paths['/api/'+kind]!.get as any).responses['200']={description:'Paginated published profiles',content:{'application/json':{schema:jsonSchema(z.object({data:z.array(listSchemas.board),meta:z.object({page:z.number(),limit:z.number(),total:z.number(),pages:z.number()})}))}}};
const kindParameter = { name: 'kind', in: 'path', required: true, schema: { type: 'string', enum: ['blog', 'project', 'board', 'gallery', 'interview', 'report', 'certificate', 'setting'] } };
operation('/api/admin/publication/{kind}', 'get', 'Read bounded publication review records with versions; requires entity permission', z.array(z.record(z.string(), z.unknown())), { parameters: [kindParameter, { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 1000, default: 1 } }], security: [adminSecurity] });
operation('/api/admin/publication/{kind}/{id}', 'post', 'Publish or withdraw a reviewed record atomically; version, CSRF, current role and audited release attestation required', z.object({ status: z.enum(['published', 'withdrawn']), version: z.number() }), { body: 'PublicationInput', parameters: [kindParameter, parameter('id')], security: [{ ...csrfSecurity, ...adminSecurity }] });
const publicNews = z.object({title:z.string(),slug:z.string(),excerpt:z.string(),publishedAt:z.string(),image:z.string().nullable(),imageAlt:z.string(),category:z.string(),authorName:z.string(),readingMinutes:z.number().int().min(1)});
const publicProject = z.object({title:z.string(),slug:z.string(),summary:z.string(),focusArea:z.string(),location:z.string(),status:z.enum(['Ongoing','Completed','Proposed','Emergency Response']),startYear:z.number().optional(),imageAlt:z.string(),image:z.string().nullable()});
for (const [kind, input, output] of [['projects',projectInput,publicProject],['blogs',newsInput,publicNews],['news',newsInput,publicNews]] as const) {
 operation(`/api/${kind}`,'get','Read published managed homepage records',z.array(output),{parameters:publicParameters});
 (paths[`/api/${kind}`]!.get as any).responses['200']={description:'Paginated public records',content:{'application/json':{schema:jsonSchema(z.object({data:z.array(output),meta:z.object({page:z.number(),limit:z.number(),total:z.number(),pages:z.number()})}))}}};
 operation(`/api/${kind}/{slug}`,'get','Read a published record with structured text blocks',kind === 'projects' ? output.extend({blocks:publicContent.shape.blocks,details:projectDetailsInput.partial(),gallery:z.array(z.object({image:z.string(),alt:z.string(),caption:z.string()})),documents:z.array(z.object({file:z.string(),label:z.string()}))}) : output.extend({blocks:publicContent.shape.blocks,details:blogDetailsInput.partial(),tags:z.array(z.string()),gallery:z.array(z.object({image:z.string(),alt:z.string(),caption:z.string()})),documents:z.array(z.object({file:z.string(),label:z.string()}))}),{parameters:[{name:'slug',in:'path',required:true,schema:{type:'string',maxLength:100}},...publicParameters]});
 operation(`/api/admin/${kind}`,'get','Read bounded managed records and optimistic versions; content role',z.array(z.unknown()),{security:[adminSecurity]});
 operation(`/api/admin/${kind}`,'post','Create a draft; content role and CSRF',z.object({id:z.string(),version:z.number(),status:z.literal('draft')}),{security:[{...csrfSecurity,...adminSecurity}]});
 const create=paths[`/api/admin/${kind}`]!.post as any;
 create.requestBody={required:true,content:{'application/json':{schema:jsonSchema(input)}}};
 operation(`/api/admin/${kind}/{id}`,'patch','Replace text and return record to draft; requires current version',z.object({id:z.string(),version:z.number(),status:z.literal('draft')}),{parameters:[parameter('id')],security:[{...csrfSecurity,...adminSecurity}]});
 const edit=paths[`/api/admin/${kind}/{id}`]!.patch as any;
 edit.requestBody={required:true,content:{'application/json':{schema:jsonSchema(input.extend({version:z.number().int().nonnegative()}))}}};
 operation(`/api/admin/${kind}/{id}`,'delete','Delete record and restrict its files; requires current version',z.object({id:z.string(),version:z.number(),status:z.literal('deleted')}),{parameters:[parameter('id')],security:[{...csrfSecurity,...adminSecurity}]});
 const remove=paths[`/api/admin/${kind}/{id}`]!.delete as any;
 remove.requestBody={required:true,content:{'application/json':{schema:jsonSchema(z.object({version:z.number().int().nonnegative()}).strict())}}};
}
for (const kind of ['projects', 'blogs', 'news']) operation(`/api/admin/${kind}/{id}`, 'get', 'Read a project editor record including bound file IDs; excludes private provider metadata', z.unknown(), { parameters: [parameter('id')], security: [adminSecurity] });
for (const [kind, input] of [['gallery',galleryInput],['interviews',interviewInput]] as const) {
 operation(`/api/admin/${kind}`,'get','List 20 media editor records with versions; content role',z.array(z.unknown()),{security:[adminSecurity]});
 operation(`/api/admin/${kind}/{id}`,'get','Read safe editor fields and bound image ID; no provider metadata',z.unknown(),{parameters:[parameter('id')],security:[adminSecurity]});
 for (const method of ['post','patch','delete'] as const) {
  const path = method === 'post' ? `/api/admin/${kind}` : `/api/admin/${kind}/{id}`;
  operation(path,method,method === 'delete' ? 'Delete current version and revoke images atomically' : 'Save private media draft; existing publication is withdrawn',z.object({id:z.string(),version:z.number(),status:z.enum(['draft','deleted'])}),{security:[{...csrfSecurity,...adminSecurity}],...(method === 'post' ? {status:'201'} : {parameters:[parameter('id')]})});
  (paths[path]![method] as any).requestBody={required:true,content:{'application/json':{schema:jsonSchema(method === 'post' ? input : method === 'patch' ? input.extend({version:z.number().int().nonnegative()}) : z.object({version:z.number().int().nonnegative()}).strict())}}};
 }
}
for (const [kind,input] of [['reports',reportInput],['certificates',certificateInput]] as const) {
 const permission=kind === 'reports' ? 'content administrators and editors' : 'administrators';
 operation(`/api/admin/${kind}`,'get',`List 20 document editor records with versions; ${permission}`,z.array(z.unknown()),{security:[adminSecurity],parameters:[{name:'page',in:'query',schema:{type:'integer',minimum:1,maximum:1000,default:1}}]});
 operation(`/api/admin/${kind}/{id}`,'get','Read safe document fields and public-copy asset ID; excludes original and provider metadata',z.unknown(),{parameters:[parameter('id')],security:[adminSecurity]});
 for (const method of ['post','patch','delete'] as const) {
  const path=method === 'post' ? `/api/admin/${kind}` : `/api/admin/${kind}/{id}`;
  operation(path,method,method === 'delete' ? `Delete version and revoke files atomically; ${permission}` : `Save a private document draft and withdraw any previous release; ${permission}`,z.object({id:z.string(),version:z.number(),status:z.enum(['draft','deleted'])}),{security:[{...csrfSecurity,...adminSecurity}],...(method === 'post' ? {status:'201'} : {parameters:[parameter('id')]})});
  (paths[path]![method] as any).requestBody={required:true,content:{'application/json':{schema:jsonSchema(method === 'post' ? input : method === 'patch' ? input.extend({version:z.number().int().nonnegative()}) : z.object({version:z.number().int().nonnegative()}).strict())}}};
 }
}
const document = { openapi: '3.1.0', info: { title: 'HRPF API', version: '0.4.0', description: 'Backend foundations, managed public content and atomic publication controls. Fixed NGO page copy is bundled in the frontend and needs no publication approval. Operational member/case review workflows remain later milestones. Public reads are no-store and withdrawals take effect immediately. Browser clients use the frontend same-origin /api rewrite and credentials. All mutating auth/admin requests require the exact configured Origin and X-CSRF-Token. Production cookies use Secure, HttpOnly, SameSite=Lax, Path=/, no Domain; development names omit __Host-.' }, paths, components: { schemas, securitySchemes: {
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
