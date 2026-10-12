import { Router } from 'express';
import { invoiceController } from '../controllers/invoice.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { generateInvoiceSchema } from '../validators/invoice.validator';

const router = Router();

/**
 * POST /api/v1/invoices/generate
 * Generate invoice from a booking
 */
router.post(
  '/generate',
  authenticate,
  validate(generateInvoiceSchema),
  invoiceController.generate
);

/**
 * GET /api/v1/invoices
 * List current customer's invoices
 */
router.get('/', authenticate, invoiceController.list);

/**
 * GET /api/v1/invoices/:id
 * Get single invoice by ID
 */
router.get('/:id', authenticate, invoiceController.get);

/**
 * GET /api/v1/invoices/:id/pdf
 * Download invoice as PDF
 */
router.get('/:id/pdf', authenticate, invoiceController.downloadPdf);

export default router;
