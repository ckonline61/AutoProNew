import { z } from 'zod';

/**
 * Common Zod schemas for reusable validation patterns.
 * These are building blocks for endpoint-specific schemas.
 */

/**
 * MongoDB ObjectId string validation.
 */
export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format');

/**
 * Pagination query parameters.
 */
export const paginationSchema = z.object({
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
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * ID parameter validation.
 */
export const idParamSchema = z.object({
  id: objectIdSchema,
});

/**
 * Date range query parameters.
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Search query parameter.
 */
export const searchSchema = z.object({
  search: z.string().trim().min(1).max(200).optional(),
});

/**
 * Phone number validation (Indian format).
 */
export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid phone number. Must be 10 digits starting with 6-9');

/**
 * Email validation.
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

/**
 * Password validation.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters');

/**
 * Pincode validation (Indian format).
 */
export const pincodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'Invalid pincode. Must be 6 digits');

/**
 * Latitude validation.
 */
export const latitudeSchema = z.number().min(-90).max(90);

/**
 * Longitude validation.
 */
export const longitudeSchema = z.number().min(-180).max(180);
