import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import {
  createBookingSchema,
  cancelBookingSchema,
  bookingQuerySchema,
} from '../validators/booking.validator';

const router = Router();

/**
 * All booking routes require customer authentication.
 */
router.use(authenticate);

/**
 * POST /api/v1/bookings
 * Create a new service booking.
 */
router.post('/', validate(createBookingSchema), bookingController.create);

/**
 * GET /api/v1/bookings
 * Get all customer bookings with optional status filter.
 */
router.get('/', validate(bookingQuerySchema, 'query'), bookingController.getAll);

/**
 * GET /api/v1/bookings/:id
 * Get single booking by ID.
 */
router.get('/:id', validate(idParamSchema, 'params'), bookingController.getById);

/**
 * POST /api/v1/bookings/:id/cancel
 * Cancel a booking with policy enforcement.
 */
router.post(
  '/:id/cancel',
  validate(idParamSchema, 'params'),
  validate(cancelBookingSchema),
  bookingController.cancel
);

export default router;
