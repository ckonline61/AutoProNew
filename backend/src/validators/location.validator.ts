import { z } from 'zod';
import { latitudeSchema, longitudeSchema, pincodeSchema } from './common';

export const geocodeQuerySchema = z.object({
  address: z.string().trim().min(2, 'Address is required').max(500),
});

export const reverseGeocodeQuerySchema = z.object({
  latitude: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(latitudeSchema),
  longitude: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(longitudeSchema),
});

export const autocompleteQuerySchema = z.object({
  input: z.string().trim().min(1, 'Search query is required').max(200),
});

export const distanceMatrixQuerySchema = z.object({
  originLat: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(latitudeSchema),
  originLng: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(longitudeSchema),
  destLat: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(latitudeSchema),
  destLng: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(longitudeSchema),
});

export const serviceabilitySchema = z.object({
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  pincode: pincodeSchema.optional(),
  city: z.string().trim().optional(),
});

export const createServiceAreaSchema = z.object({
  name: z.string().trim().min(2).max(200),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z.string().trim().optional(),
  boundaries: z
    .object({
      type: z.literal('Polygon').optional().default('Polygon'),
      coordinates: z.array(z.array(z.array(z.number()))),
    })
    .optional(),
});

export type GeocodeQueryInput = z.infer<typeof geocodeQuerySchema>;
export type ReverseGeocodeQueryInput = z.infer<typeof reverseGeocodeQuerySchema>;
export type AutocompleteQueryInput = z.infer<typeof autocompleteQuerySchema>;
export type DistanceMatrixQueryInput = z.infer<typeof distanceMatrixQuerySchema>;
export type ServiceabilityInput = z.infer<typeof serviceabilitySchema>;
export type CreateServiceAreaInput = z.infer<typeof createServiceAreaSchema>;
