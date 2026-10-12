import { z } from 'zod';
import { objectIdSchema } from './common';

export const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, 'Code must be at least 3 characters')
    .max(30, 'Code cannot exceed 30 characters')
    .toUpperCase(),
  description: z.string().trim().max(500).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive('Discount value must be positive'),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().positive().optional(),
  usageLimit: z.number().int().min(0).optional(),
  validFrom: z.string().or(z.date()),
  validTo: z.string().or(z.date()),
  applicableServices: z.array(objectIdSchema).optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, 'Coupon code is required'),
  orderAmount: z.number().min(0, 'Order amount cannot be negative'),
  serviceIds: z.array(objectIdSchema).optional(),
});
