import { z } from 'zod';
import { Priority } from '../types';
import { objectIdSchema } from './common';

const ticketCategories = [
  'GENERAL',
  'BOOKING',
  'PAYMENT',
  'MECHANIC',
  'TECHNICAL',
  'OTHER',
] as const;

const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

export const createTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, 'Subject is required')
    .max(200, 'Subject must not exceed 200 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(2000, 'Description must not exceed 2000 characters'),
  category: z.enum(ticketCategories, {
    message: 'Invalid category',
  }),
  priority: z.nativeEnum(Priority).optional().default(Priority.MEDIUM),
  relatedBookingId: objectIdSchema.optional(),
});

export const addMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(2000, 'Message must not exceed 2000 characters'),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(ticketStatuses, {
    message: 'Invalid ticket status',
  }),
});

export const assignTicketSchema = z.object({
  assignedTo: objectIdSchema,
});

export const supportQuerySchema = z.object({
  status: z.enum(ticketStatuses).optional(),
  category: z.enum(ticketCategories).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assignedTo: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
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
