import type { RequestHandler } from 'express';
import type { Role } from '../domain/models.js';
import { ApiError } from '../http/errors.js';
const sa: Role[] = ['super_admin', 'admin'];
const sac: Role[] = [...sa, 'case_manager'];
const sae: Role[] = [...sa, 'editor'];
export const permissionRoles = {
  users: ['super_admin'], members: sac, memberExport: sa, membershipReview: sac,
  membershipRegistrations: sa, board: sa, team: sa, complaints: sac, content: sae, certificates: sa, contacts: sa, settings: sa,
  restrictedAssets: sac, audit: sa, outbox: sa,
} satisfies Record<string, readonly Role[]>;
export type Permission = keyof typeof permissionRoles;
export function can(role: Role, permission: Permission) { return (permissionRoles[permission] as readonly Role[]).includes(role); }
export function permit(permission: Permission): RequestHandler {
  return (_req, res, next) => {
    const principal = res.locals.principal as { role: Role } | undefined;
    if (!principal) return next(new ApiError(401, 'AUTH_REQUIRED', 'Sign in to continue.'));
    if (!can(principal.role, permission)) return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission for this action.'));
    next();
  };
}
