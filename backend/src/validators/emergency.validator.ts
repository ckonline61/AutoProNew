import { z } from 'zod';
import { latitudeSchema, longitudeSchema, objectIdSchema, paginationSchema } from './common';
import { EmergencyStatus, EmergencyType, Priority } from '../types';

export const createEmergencyRequestSchema = z.object({
  problemType: z.nativeEnum(EmergencyType),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  vehicleId: objectIdSchema.optional(),
  description: z.string().trim().max(1000).optional(),
  address: z.string().trim().max(500).optional(),
  priority: z.nativeEnum(Priority).optional().default(Priority.HIGH),
});

export const cancelEmergencyRequestSchema = z.object({
  reason: z.string().trim().min(3, 'Cancellation reason is required').max(500),
});

export const updateEmergencyStatusSchema = z.object({
  status: z.enum([EmergencyStatus.EN_ROUTE, EmergencyStatus.ARRIVED, EmergencyStatus.IN_PROGRESS, EmergencyStatus.COMPLETED, EmergencyStatus.FAILED]),
  notes: z.string().trim().max(1000).optional(),
});

export const emergencyQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(EmergencyStatus).optional(),
});

export type CreateEmergencyRequestInput = z.infer<typeof createEmergencyRequestSchema>;
export type CancelEmergencyRequestInput = z.infer<typeof cancelEmergencyRequestSchema>;
export type UpdateEmergencyStatusInput = z.infer<typeof updateEmergencyStatusSchema>;
export type EmergencyQueryInput = z.infer<typeof emergencyQuerySchema>;
