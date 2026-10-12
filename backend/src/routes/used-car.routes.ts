import { Router } from 'express';
import { usedCarController } from '../controllers/used-car.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import {
  createListingSchema,
  updateListingSchema,
  listUsedCarsQuerySchema,
} from '../validators/used-car.validator';

const router = Router();

// Public routes
router.get('/', validate(listUsedCarsQuerySchema, 'query'), usedCarController.getListings);

// Authenticated routes
router.get('/my-listings', authenticate, usedCarController.getUserListings);
router.get('/:id', validate(idParamSchema, 'params'), usedCarController.getListingById);

router.post('/', authenticate, validate(createListingSchema), usedCarController.createListing);
router.put('/:id', authenticate, validate(idParamSchema, 'params'), validate(updateListingSchema), usedCarController.updateListing);
router.delete('/:id', authenticate, validate(idParamSchema, 'params'), usedCarController.removeListing);

export default router;
