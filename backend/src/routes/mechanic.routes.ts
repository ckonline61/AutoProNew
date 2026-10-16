import { Router } from 'express';
import { mechanicController } from '../controllers/mechanic.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import { UserRole } from '../types';
import {
  onboardMechanicSchema,
  updateAvailabilitySchema,
  updateLocationSchema,
  verifyMechanicSchema,
  updateJobExecutionStatusSchema,
  rejectJobSchema,
} from '../validators/mechanic.validator';

const router = Router();

/**
 * All mechanic routes require authentication.
 */
router.use(authenticate);

/**
 * POST /api/v1/mechanics/onboard
 * Submit mechanic onboarding details.
 */
router.post('/onboard', authorize(UserRole.MECHANIC), validate(onboardMechanicSchema), mechanicController.onboard);

/**
 * GET /api/v1/mechanics/profile
 * Get mechanic profile.
 */
router.get('/profile', authorize(UserRole.MECHANIC), mechanicController.getProfile);

/**
 * PUT /api/v1/mechanics/availability
 * Toggle availability / online status.
 */
router.put(
  '/availability',
  authorize(UserRole.MECHANIC),
  validate(updateAvailabilitySchema),
  mechanicController.updateAvailability
);

/**
 * PUT /api/v1/mechanics/location
 * Update mechanic real-time coordinates.
 */
router.put(
  '/location',
  authorize(UserRole.MECHANIC),
  validate(updateLocationSchema),
  mechanicController.updateLocation
);

/**
 * GET /api/v1/mechanics/jobs
 * List jobs assigned to this mechanic.
 */
router.get('/jobs', authorize(UserRole.MECHANIC), mechanicController.getAssignedJobs);

/**
 * GET /api/v1/mechanics/jobs/active
 * Get current active in-progress job.
 */
router.get('/jobs/active', authorize(UserRole.MECHANIC), mechanicController.getActiveJob);

/**
 * POST /api/v1/mechanics/jobs/:id/accept
 * Accept an assigned job.
 */
router.post(
  '/jobs/:id/accept',
  authorize(UserRole.MECHANIC),
  validate(idParamSchema, 'params'),
  mechanicController.acceptJob
);

/**
 * POST /api/v1/mechanics/jobs/:id/reject
 * Reject an assigned job.
 */
router.post(
  '/jobs/:id/reject',
  authorize(UserRole.MECHANIC),
  validate(idParamSchema, 'params'),
  validate(rejectJobSchema),
  mechanicController.rejectJob
);

/**
 * PUT /api/v1/mechanics/jobs/:id/status
 * Advance job execution status.
 */
router.put(
  '/jobs/:id/status',
  authorize(UserRole.MECHANIC),
  validate(idParamSchema, 'params'),
  validate(updateJobExecutionStatusSchema),
  mechanicController.updateJobStatus
);

/**
 * PUT /api/v1/mechanics/:id/verify
 * Admin-only: Verify mechanic approval status.
 */
router.put(
  '/:id/verify',
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(idParamSchema, 'params'),
  validate(verifyMechanicSchema),
  mechanicController.verify
);

export default router;
