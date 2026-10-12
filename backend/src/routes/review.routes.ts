import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import { createReviewSchema, updateReviewSchema } from '../validators/review.validator';
import { z } from 'zod';
import { objectIdSchema } from '../validators/common';

const bookingParamSchema = z.object({
  bookingId: objectIdSchema,
});

const mechanicParamSchema = z.object({
  mechanicId: objectIdSchema,
});

const router = Router();

// Public / open or authenticated mechanic reviews
router.get('/mechanic/:mechanicId', validate(mechanicParamSchema, 'params'), reviewController.getByMechanic);

// Authenticated routes
router.use(authenticate);

router.post('/', validate(createReviewSchema), reviewController.create);
router.get('/booking/:bookingId', validate(bookingParamSchema, 'params'), reviewController.getByBooking);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateReviewSchema), reviewController.update);
router.delete('/:id', validate(idParamSchema, 'params'), reviewController.delete);

export default router;
