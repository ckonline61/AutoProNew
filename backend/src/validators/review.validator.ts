import { z } from 'zod';
import { objectIdSchema } from './common';

export const createReviewSchema = z.object({
  bookingId: objectIdSchema,
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().trim().max(1000, 'Comment cannot exceed 1000 characters').optional(),
  images: z.array(z.string().trim()).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().trim().max(1000).optional(),
  images: z.array(z.string().trim()).optional(),
});
