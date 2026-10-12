import { z } from 'zod';
import { FuelType, ListingStatus } from '../types';

export const createListingSchema = z.object({
  brand: z.string().trim().min(2, 'Brand is required').max(100),
  model: z.string().trim().min(1, 'Model is required').max(100),
  variant: z.string().trim().max(100).optional(),
  year: z.number().int().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  fuelType: z.nativeEnum(FuelType),
  mileage: z.number().min(0, 'Mileage cannot be negative'),
  price: z.number().positive('Price must be greater than 0'),
  negotiable: z.boolean().optional().default(true),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  images: z.array(z.string().trim()).optional(),
  location: z.object({
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().trim().min(2, 'State is required'),
  }),
});

export const updateListingSchema = z.object({
  brand: z.string().trim().min(2).max(100).optional(),
  model: z.string().trim().min(1).max(100).optional(),
  variant: z.string().trim().max(100).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  mileage: z.number().min(0).optional(),
  price: z.number().positive().optional(),
  negotiable: z.boolean().optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  images: z.array(z.string().trim()).optional(),
  location: z
    .object({
      city: z.string().trim().min(2),
      state: z.string().trim().min(2),
    })
    .optional(),
  status: z.nativeEnum(ListingStatus).optional(),
});

export const listUsedCarsQuerySchema = z.object({
  brand: z.string().trim().optional(),
  model: z.string().trim().optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  minYear: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  maxYear: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  city: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});
