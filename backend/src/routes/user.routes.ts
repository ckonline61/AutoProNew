import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/user.validator';

const router = Router();

/**
 * All user profile routes require authentication.
 */
router.use(authenticate);

/**
 * GET /api/v1/users/profile
 * Get authenticated user profile.
 */
router.get('/', userController.getProfile);

/**
 * PUT /api/v1/users/profile
 * Update authenticated user profile.
 */
router.put('/', validate(updateProfileSchema), userController.updateProfile);

/**
 * PUT /api/v1/users/profile/password
 * Change authenticated user password.
 */
router.put(
  '/password',
  validate(changePasswordSchema),
  userController.changePassword
);

export default router;
