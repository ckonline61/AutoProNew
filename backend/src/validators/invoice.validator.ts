import { z } from 'zod';
import { objectIdSchema } from './common';

export const generateInvoiceSchema = z.object({
  bookingId: objectIdSchema,
});

export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
