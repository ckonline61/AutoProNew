import { z } from 'zod';
import { objectIdSchema } from './common';

export const recommendMechanicSchema = z.object({
  bookingId: objectIdSchema,
});

export const estimatePriceSchema = z.object({
  serviceIds: z.array(objectIdSchema).min(1, 'At least one service ID is required'),
  vehicleId: objectIdSchema.optional(),
});

export const smartSearchSchema = z
  .object({
    query: z.string().trim().min(2, 'Query must be at least 2 characters').max(200, 'Query must not exceed 200 characters').optional(),
    q: z.string().trim().min(2, 'Query must be at least 2 characters').max(200, 'Query must not exceed 200 characters').optional(),
  })
  .refine((data) => Boolean(data.query || data.q), {
    message: 'Query must be between 2 and 200 characters',
    path: ['query'],
  });

export type RecommendMechanicInput = z.infer<typeof recommendMechanicSchema>;
export type EstimatePriceInput = z.infer<typeof estimatePriceSchema>;
export type SmartSearchInput = z.infer<typeof smartSearchSchema>;
