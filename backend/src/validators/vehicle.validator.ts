import { z } from 'zod';
import { FuelType } from '../types';

/**
 * Zod validation schema for creating a vehicle.
 */
export const createVehicleSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .min(4, 'Registration number must be at least 4 characters')
    .max(20, 'Registration number cannot exceed 20 characters')
    .toUpperCase(),
  brand: z
    .string()
    .trim()
    .min(1, 'Brand is required')
    .max(100, 'Brand cannot exceed 100 characters'),
  model: z
    .string()
    .trim()
    .min(1, 'Model is required')
    .max(100, 'Model cannot exceed 100 characters'),
  variant: z.string().trim().optional(),
  fuelType: z.nativeEnum(FuelType),
  year: z
    .number()
    .int('Year must be an integer')
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  mileage: z.number().min(0, 'Mileage cannot be negative').optional(),
  insuranceExpiry: z.string().datetime().optional(),
  pucExpiry: z.string().datetime().optional(),
});

/**
 * Zod validation schema for updating a vehicle.
 */
export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
