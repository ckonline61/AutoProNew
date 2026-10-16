import { z } from 'zod';
import { pincodeSchema } from './common';
import { OrderStatus } from '../types';

export const placeOrderSchema = z.object({
  expectedTotal: z.number().min(0).optional(),
  shippingAddress: z.object({
    addressLine1: z.string().trim().min(3, 'Address line 1 is required'),
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().trim().min(2, 'State is required'),
    pincode: pincodeSchema,
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});
