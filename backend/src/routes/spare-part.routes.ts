import { Router } from 'express';
import { sparePartController } from '../controllers/spare-part.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import {
  createSparePartSchema,
  updateSparePartSchema,
  sparePartQuerySchema,
} from '../validators/spare-part.validator';
import { UserRole } from '../types';

const router = Router();

// Public routes for browsing spare parts
router.get('/', validate(sparePartQuerySchema, 'query'), sparePartController.getAll);
router.get('/:id', validate(idParamSchema, 'params'), sparePartController.getById);

// Admin-only management routes
router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.post('/', validate(createSparePartSchema), sparePartController.create);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateSparePartSchema), sparePartController.update);
router.delete('/:id', validate(idParamSchema, 'params'), sparePartController.deactivate);

export default router;
