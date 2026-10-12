import { z } from 'zod';
import { objectIdSchema } from './common';

export const inspectionCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name is required'),
  score: z.number().min(0, 'Score cannot be negative').max(100, 'Score cannot exceed 100'),
  notes: z.string().trim().optional(),
});

export const createReportSchema = z.object({
  vehicleId: objectIdSchema.optional(),
  listingId: objectIdSchema.optional(),
  overallScore: z.number().min(0).max(100),
  categories: z.array(inspectionCategorySchema),
  summary: z.string().trim().min(5, 'Summary is required'),
  recommendations: z.array(z.string().trim()).optional(),
  images: z.array(z.string().trim()).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

export const updateReportSchema = z.object({
  overallScore: z.number().min(0).max(100).optional(),
  categories: z.array(inspectionCategorySchema).optional(),
  summary: z.string().trim().min(5).optional(),
  recommendations: z.array(z.string().trim()).optional(),
  images: z.array(z.string().trim()).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

export const completeReportSchema = z.object({
  overallScore: z.number().min(0).max(100).optional(),
  categories: z.array(inspectionCategorySchema).optional(),
  summary: z.string().trim().min(5).optional(),
  recommendations: z.array(z.string().trim()).optional(),
  images: z.array(z.string().trim()).optional(),
});
