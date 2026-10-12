import { z } from 'zod';
import { AuditAction } from '../types';
import { objectIdSchema } from './common';

export const auditQuerySchema = z.object({
  action: z.nativeEnum(AuditAction).optional(),
  resource: z.string().trim().optional(),
  resourceId: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});
