import { Router } from 'express';
import { addressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import {
  createAddressSchema,
  updateAddressSchema,
} from '../validators/address.validator';

const router = Router();

/**
 * All address routes require authentication.
 */
router.use(authenticate);

/**
 * POST /api/v1/addresses
 * Create a new address.
 */
router.post('/', validate(createAddressSchema), addressController.create);

/**
 * GET /api/v1/addresses
 * List all active addresses for authenticated user.
 */
router.get('/', addressController.getAll);

/**
 * GET /api/v1/addresses/:id
 * Get single address by ID.
 */
router.get('/:id', validate(idParamSchema, 'params'), addressController.getById);

/**
 * PUT /api/v1/addresses/:id
 * Update address by ID.
 */
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateAddressSchema),
  addressController.update
);

/**
 * DELETE /api/v1/addresses/:id
 * Soft delete address by ID.
 */
router.delete('/:id', validate(idParamSchema, 'params'), addressController.remove);

export default router;
