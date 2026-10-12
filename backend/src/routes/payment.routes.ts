import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
} from '../validators/payment.validator';

const router = Router();

/**
 * Webhook route - unauthenticated (called directly by Razorpay servers)
 * POST /api/v1/payments/webhook
 */
router.post('/webhook', paymentController.handleWebhook);

/**
 * POST /api/v1/payments/orders
 * Create a new Razorpay payment order for a booking.
 */
router.post(
  '/orders',
  authenticate,
  validate(createPaymentOrderSchema),
  paymentController.createOrder
);

/**
 * POST /api/v1/payments/verify
 * Verify Razorpay payment signature after client payment completion.
 */
router.post(
  '/verify',
  authenticate,
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

/**
 * GET /api/v1/payments/booking/:bookingId
 * Get payment details for a specific booking.
 */
router.get('/booking/:bookingId', authenticate, paymentController.getPaymentByBooking);

/**
 * GET /api/v1/payments/history
 * Get customer payment history.
 */
router.get('/history', authenticate, paymentController.getPaymentHistory);

export default router;
