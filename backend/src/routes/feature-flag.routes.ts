import { Router } from 'express';
import { featureFlagController } from '../controllers/feature-flag.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import {
  createFlagSchema,
  updateFlagSchema,
  flagKeyParamSchema,
} from '../validators/feature-flag.validator';

const router = Router();

// Public endpoint for clients to check a feature flag status
router.get(
  '/check/:key',
  validate(flagKeyParamSchema, 'params'),
  featureFlagController.checkKey
);

// Admin-only management endpoints
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  featureFlagController.getAll
);

router.get(
  '/:key',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(flagKeyParamSchema, 'params'),
  featureFlagController.getByKey
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(createFlagSchema, 'body'),
  featureFlagController.create
);

router.put(
  '/:key',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(flagKeyParamSchema, 'params'),
  validate(updateFlagSchema, 'body'),
  featureFlagController.update
);

router.put(
  '/:key/toggle',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(flagKeyParamSchema, 'params'),
  featureFlagController.toggle
);

router.delete(
  '/:key',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(flagKeyParamSchema, 'params'),
  featureFlagController.delete
);

export default router;
