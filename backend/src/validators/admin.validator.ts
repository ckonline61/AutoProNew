import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const dashboardQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(100)),
});
