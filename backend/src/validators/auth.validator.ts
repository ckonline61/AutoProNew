import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema } from './common';
import { UserRole } from '../types';

/**
 * Zod validation schema for user registration.
 */
export const registerSchema = z.object({
  role: z.enum([UserRole.CUSTOMER,UserRole.MECHANIC]).optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

/**
 * Zod validation schema for user login.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Zod validation schema for refresh token requests.
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
