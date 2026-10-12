import { z } from 'zod';
import { objectIdSchema, paginationSchema, searchSchema } from './common';

export const serviceCategoryQuerySchema = searchSchema.extend({
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

export const serviceQuerySchema = paginationSchema.extend({
  categoryId: objectIdSchema.optional(),
  search: z.string().trim().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

export const createServiceCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  icon: z.string().trim().optional(),
  sortOrder: z.number().int().optional().default(0),
});

export const createServiceSchema = z.object({
  categoryId: objectIdSchema,
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().min(5).max(2000),
  shortDescription: z.string().trim().max(300).optional(),
  price: z.number().min(0, 'Price must be positive'),
  discountedPrice: z.number().min(0).optional(),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  image: z.string().trim().optional(),
  features: z.array(z.string().trim()).optional().default([]),
});

export const updateServiceSchema = createServiceSchema.partial();

export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
