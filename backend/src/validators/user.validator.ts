import { z } from 'zod';
import { passwordSchema, phoneSchema } from './common';

/**
 * Zod validation schema for updating user profile.
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().trim().optional(),
});

/**
 * Zod validation schema for changing user password.
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
