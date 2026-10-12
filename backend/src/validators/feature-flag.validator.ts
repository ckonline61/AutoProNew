import { z } from 'zod';

export const createFlagSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, 'Key is required')
    .max(100, 'Key must not exceed 100 characters'),
  enabled: z.boolean().optional().default(true),
  description: z.string().trim().max(500).optional(),
  userMessage: z.string().trim().max(500).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateFlagSchema = z.object({
  enabled: z.boolean().optional(),
  description: z.string().trim().max(500).optional(),
  userMessage: z.string().trim().max(500).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const flagKeyParamSchema = z.object({
  key: z.string().trim().min(1, 'Key is required'),
});
