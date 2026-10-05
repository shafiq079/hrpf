import { z } from 'zod';
export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string, readonly fields?: string[]) { super(message); }
}
export function validate<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new ApiError(400, 'VALIDATION_ERROR', 'Check the submitted fields.', [...new Set(result.error.issues.map(v => v.path.join('.')))]);
  return result.data;
}
export const unavailable = () => new ApiError(503, 'SERVICE_UNAVAILABLE', 'This service is temporarily unavailable.');
