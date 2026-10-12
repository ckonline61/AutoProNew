import { z } from 'zod';
import { latitudeSchema, longitudeSchema, objectIdSchema } from './common';
import { BookingStatus, MechanicApprovalStatus } from '../types';

export const onboardMechanicSchema = z.object({
  specializations: z.array(z.string().trim().min(2)).min(1, 'At least one specialization is required'),
  experience: z.number().min(0, 'Experience must be non-negative').optional().default(0),
  documents: z
    .object({
      aadhaar: z.string().trim().optional(),
      pan: z.string().trim().optional(),
      license: z.string().trim().optional(),
      certifications: z.array(z.string().trim()).optional(),
    })
    .optional()
    .default({}),
  serviceAreaIds: z.array(objectIdSchema).optional().default([]),
});

export const updateAvailabilitySchema = z.object({
  isOnline: z.boolean(),
  isAvailable: z.boolean().optional(),
});

export const updateLocationSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
});

export const verifyMechanicSchema = z.object({
  approvalStatus: z.nativeEnum(MechanicApprovalStatus),
});

export const updateJobExecutionStatusSchema = z.object({
  status: z.enum([
    BookingStatus.EN_ROUTE,
    BookingStatus.ARRIVED,
    BookingStatus.IN_PROGRESS,
    BookingStatus.COMPLETED,
  ]),
  notes: z.string().trim().max(1000).optional(),
});

export type OnboardMechanicInput = z.infer<typeof onboardMechanicSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type VerifyMechanicInput = z.infer<typeof verifyMechanicSchema>;
export type UpdateJobExecutionStatusInput = z.infer<typeof updateJobExecutionStatusSchema>;
