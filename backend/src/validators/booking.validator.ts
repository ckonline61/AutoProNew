import { z } from 'zod';
import { objectIdSchema, paginationSchema } from './common';
import { BookingStatus } from '../types';

export const createBookingSchema = z
  .object({
    vehicleId: objectIdSchema,
    serviceIds: z.array(objectIdSchema).min(1, 'At least one service must be selected'),
    serviceType: z.enum(['DOORSTEP', 'WORKSHOP']).optional().default('DOORSTEP'),
    addressId: objectIdSchema.optional(),
    scheduledDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    scheduledTime: z.string().trim().min(1, 'Scheduled time slot is required'),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine(
    (data) => {
      if (data.serviceType === 'DOORSTEP' && !data.addressId) {
        return false;
      }
      return true;
    },
    {
      message: 'addressId is required for DOORSTEP service',
      path: ['addressId'],
    }
  );

export const cancelBookingSchema = z.object({
  reason: z.string().trim().min(3, 'Cancellation reason must be at least 3 characters').max(500),
});

export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  reason: z.string().trim().max(500).optional(),
});

export const bookingQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(BookingStatus).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type BookingQueryInput = z.infer<typeof bookingQuerySchema>;
