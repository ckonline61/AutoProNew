import { z } from 'zod';

const cmsCategories = ['PAGE', 'FAQ', 'TERMS', 'PRIVACY', 'ABOUT', 'HELP'] as const;

export const createPageSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  content: z.string().min(1, 'Content is required'),
  category: z.enum(cmsCategories).optional().default('PAGE'),
  isPublished: z.boolean().optional().default(false),
  metaTitle: z.string().trim().max(200).optional(),
  metaDescription: z.string().trim().max(500).optional(),
  sortOrder: z.number().int().optional().default(0),
});

export const updatePageSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
    .optional(),
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(cmsCategories).optional(),
  isPublished: z.boolean().optional(),
  metaTitle: z.string().trim().max(200).optional(),
  metaDescription: z.string().trim().max(500).optional(),
  sortOrder: z.number().int().optional(),
});

export const cmsQuerySchema = z.object({
  category: z.enum(cmsCategories).optional(),
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

export const slugParamSchema = z.object({
  slug: z.string().trim().min(1, 'Slug is required'),
});
