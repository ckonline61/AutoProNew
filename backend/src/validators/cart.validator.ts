import { z } from 'zod';
import { objectIdSchema } from './common';

export const addToCartSchema = z.object({
  sparePartId: objectIdSchema,
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});
