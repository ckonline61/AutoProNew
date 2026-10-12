import { z } from 'zod';
import { pincodeSchema, latitudeSchema, longitudeSchema } from './common';

/**
 * Zod validation schema for creating an address.
 */
export const createAddressSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Label is required')
    .max(50, 'Label cannot exceed 50 characters'),
  addressLine1: z
    .string()
    .trim()
    .min(1, 'Address line 1 is required')
    .max(200, 'Address line 1 cannot exceed 200 characters'),
  addressLine2: z
    .string()
    .trim()
    .max(200, 'Address line 2 cannot exceed 200 characters')
    .optional(),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(100, 'City cannot exceed 100 characters'),
  state: z
    .string()
    .trim()
    .min(1, 'State is required')
    .max(100, 'State cannot exceed 100 characters'),
  pincode: pincodeSchema,
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  isDefault: z.boolean().optional(),
});

/**
 * Zod validation schema for updating an address.
 */
export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
