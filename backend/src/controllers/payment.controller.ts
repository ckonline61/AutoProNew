import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { paymentService } from '../services/payment.service';
import { UnauthorizedError, BadRequestError } from '../errors/app-error';

export const paymentController = {
  /**
   * POST /api/v1/payments/orders
   * Create Razorpay order for booking.
   */
  createOrder: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const { bookingId } = req.body;
    const result = await paymentService.createOrder(customerId, bookingId);

    res.status(200).json(apiResponse.success(result, 'Payment order created successfully'));
  }),

  /**
   * POST /api/v1/payments/verify
   * Verify Razorpay payment signature.
   */
  verifyPayment: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const result = await paymentService.verifyPayment(customerId, req.body);

    res.status(200).json(apiResponse.success(result, 'Payment verified successfully'));
  }),

  /**
   * GET /api/v1/payments/booking/:bookingId
   * Get payment details for a booking.
   */
  getPaymentByBooking: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const bookingId = req.params.bookingId as string;
    const payment = await paymentService.getPaymentByBooking(customerId, bookingId);

    res.status(200).json(apiResponse.success(payment, 'Payment retrieved successfully'));
  }),

  /**
   * GET /api/v1/payments/history
   * Get customer's payment history.
   */
  getPaymentHistory: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const payments = await paymentService.getPaymentHistory(customerId);

    res.status(200).json(apiResponse.success(payments, 'Payment history retrieved successfully'));
  }),

  /**
   * POST /api/v1/payments/webhook
   * Razorpay webhook callback (no auth).
   */
  handleWebhook: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    if (!signature) {
      throw new BadRequestError('Webhook signature header missing');
    }

    const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const result = await paymentService.handleWebhook(payload, signature);

    res.status(200).json(apiResponse.success(result, 'Webhook processed successfully'));
  }),
};

export default paymentController;
