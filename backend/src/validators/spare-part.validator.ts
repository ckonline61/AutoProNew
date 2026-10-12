import { z } from 'zod';

export const createSparePartSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(2000),
  brand: z.string().trim().min(1, 'Brand is required').max(100),
  partNumber: z.string().trim().max(100).optional(),
  categoryTag: z.string().trim().min(1, 'Category tag is required').max(50),
  price: z.number().positive('Price must be greater than 0'),
  discountedPrice: z.number().positive().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  images: z.array(z.string().trim()).optional(),
  compatibility: z.array(z.string().trim()).optional(),
});

export const updateSparePartSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().min(5).max(2000).optional(),
  brand: z.string().trim().min(1).max(100).optional(),
  partNumber: z.string().trim().max(100).optional(),
  categoryTag: z.string().trim().min(1).max(50).optional(),
  price: z.number().positive().optional(),
  discountedPrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string().trim()).optional(),
  compatibility: z.array(z.string().trim()).optional(),
  isActive: z.boolean().optional(),
});

export const sparePartQuerySchema = z.object({
  search: z.string().trim().optional(),
  categoryTag: z.string().trim().optional(),
  brand: z.string().trim().optional(),
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
