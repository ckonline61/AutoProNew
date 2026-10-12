import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import {
  createVehicleSchema,
  updateVehicleSchema,
} from '../validators/vehicle.validator';

const router = Router();

/**
 * All vehicle routes require authentication.
 */
router.use(authenticate);

/**
 * POST /api/v1/vehicles
 * Create a new vehicle.
 */
router.post('/', validate(createVehicleSchema), vehicleController.create);

/**
 * GET /api/v1/vehicles
 * List all active vehicles for authenticated user.
 */
router.get('/', vehicleController.getAll);

/**
 * GET /api/v1/vehicles/:id
 * Get single vehicle by ID.
 */
router.get('/:id', validate(idParamSchema, 'params'), vehicleController.getById);

/**
 * PUT /api/v1/vehicles/:id
 * Update vehicle by ID.
 */
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateVehicleSchema),
  vehicleController.update
);

/**
 * DELETE /api/v1/vehicles/:id
 * Soft delete vehicle by ID.
 */
router.delete('/:id', validate(idParamSchema, 'params'), vehicleController.remove);

export default router;
