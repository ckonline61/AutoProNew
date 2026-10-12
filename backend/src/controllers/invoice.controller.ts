import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { invoiceService } from '../services/invoice.service';
import { UnauthorizedError } from '../errors/app-error';

export const invoiceController = {
  /**
   * POST /api/v1/invoices/generate
   * Generate invoice from booking
   */
  generate: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const { bookingId } = req.body;
    const invoice = await invoiceService.generateInvoice(bookingId);

    res.status(201).json(apiResponse.success(invoice, 'Invoice generated successfully'));
  }),

  /**
   * GET /api/v1/invoices
   * List customer's invoices
   */
  list: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const invoices = await invoiceService.getInvoicesByCustomer(customerId);

    res.status(200).json(apiResponse.success(invoices, 'Invoices retrieved successfully'));
  }),

  /**
   * GET /api/v1/invoices/:id
   * Get single invoice by ID
   */
  get: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const invoiceId = req.params.id as string;
    const invoice = await invoiceService.getInvoice(customerId, invoiceId);

    res.status(200).json(apiResponse.success(invoice, 'Invoice retrieved successfully'));
  }),

  /**
   * GET /api/v1/invoices/:id/pdf
   * Download or stream invoice PDF
   */
  downloadPdf: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const invoiceId = req.params.id as string;
    const pdfBuffer = await invoiceService.downloadInvoicePDF(customerId, invoiceId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${invoiceId}.pdf"`);
    res.status(200).send(pdfBuffer);
  }),
};

export default invoiceController;
