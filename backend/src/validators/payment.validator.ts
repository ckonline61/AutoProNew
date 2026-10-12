import { z } from 'zod';
import { objectIdSchema } from './common';

export const createPaymentOrderSchema = z.object({
  bookingId: objectIdSchema,
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().trim().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().trim().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().trim().min(1, 'Razorpay signature is required'),
});

export const refundPaymentSchema = z.object({
  paymentId: objectIdSchema,
  amount: z.number().min(1, 'Refund amount must be at least 1').optional(),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
