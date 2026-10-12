import { Router } from 'express';
import { inspectionController } from '../controllers/inspection.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import {
  createReportSchema,
  updateReportSchema,
  completeReportSchema,
} from '../validators/inspection.validator';
import { UserRole } from '../types';
import { z } from 'zod';
import { objectIdSchema } from '../validators/common';

const vehicleParamSchema = z.object({
  vehicleId: objectIdSchema,
});

const listingParamSchema = z.object({
  listingId: objectIdSchema,
});

const router = Router();

router.use(authenticate);

// Specific lookup routes before /:id
router.get('/vehicle/:vehicleId', validate(vehicleParamSchema, 'params'), inspectionController.getByVehicle);
router.get('/listing/:listingId', validate(listingParamSchema, 'params'), inspectionController.getByListing);

// Inspector-only creation
router.post(
  '/',
  authorize(UserRole.INSPECTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(createReportSchema),
  inspectionController.createReport
);

// Inspector-only completion
router.post(
  '/:id/complete',
  authorize(UserRole.INSPECTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(idParamSchema, 'params'),
  validate(completeReportSchema),
  inspectionController.completeReport
);

// Get report by ID
router.get('/:id', validate(idParamSchema, 'params'), inspectionController.getReport);

// Update report
router.put(
  '/:id',
  authorize(UserRole.INSPECTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(idParamSchema, 'params'),
  validate(updateReportSchema),
  inspectionController.updateReport
);

export default router;
