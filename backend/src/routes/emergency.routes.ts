import { Router } from 'express';
import { emergencyController } from '../controllers/emergency.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import {
  createEmergencyRequestSchema,
  cancelEmergencyRequestSchema,
  updateEmergencyStatusSchema,
  emergencyQuerySchema,
} from '../validators/emergency.validator';

const router = Router();

/**
 * All emergency roadside assistance routes require authentication.
 */
router.use(authenticate);

/**
 * POST /api/v1/emergency
 * Create rapid SOS roadside assistance request.
 */
router.post('/', authorize(UserRole.CUSTOMER), validate(createEmergencyRequestSchema), emergencyController.createSOS);

/**
 * GET /api/v1/emergency
 * Get customer's emergency assistance requests.
 */
router.get('/', validate(emergencyQuerySchema, 'query'), emergencyController.getCustomerRequests);

/**
 * GET /api/v1/emergency/assigned
 * Get emergency requests dispatched to provider.
 */
router.get('/assigned', authorize(UserRole.MECHANIC), emergencyController.getProviderRequests);

/**
 * GET /api/v1/emergency/:id
 * Get single emergency request details.
 */
router.get('/:id', validate(idParamSchema, 'params'), emergencyController.getById);

/**
 * POST /api/v1/emergency/:id/accept
 * Provider accepts emergency request.
 */
router.post('/:id/accept', authorize(UserRole.MECHANIC), validate(idParamSchema, 'params'), emergencyController.acceptRequest);

/**
 * PUT /api/v1/emergency/:id/status
 * Update emergency request status.
 */
router.put(
  '/:id/status',
  authorize(UserRole.MECHANIC, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(idParamSchema, 'params'),
  validate(updateEmergencyStatusSchema),
  emergencyController.updateStatus
);

/**
 * POST /api/v1/emergency/:id/cancel
 * Cancel emergency request.
 */
router.post(
  '/:id/cancel',
  validate(idParamSchema, 'params'),
  validate(cancelEmergencyRequestSchema),
  emergencyController.cancel
);

export default router;
