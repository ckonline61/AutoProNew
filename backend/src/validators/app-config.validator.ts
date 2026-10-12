import { z } from 'zod';

export const setConfigSchema = z.object({
  value: z.unknown(),
  type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON']),
  description: z.string().trim().max(500).optional(),
});

export const configKeyParamSchema = z.object({
  key: z.string().trim().min(1, 'Key is required').max(100),
});
