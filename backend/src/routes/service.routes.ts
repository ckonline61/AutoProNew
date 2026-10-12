import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import { serviceQuerySchema } from '../validators/service.validator';

const router = Router();

/**
 * GET /api/v1/services/categories
 * List all active service categories.
 */
router.get('/categories', serviceController.getCategories);

/**
 * GET /api/v1/services/categories/:id
 * Get single service category.
 */
router.get(
  '/categories/:id',
  validate(idParamSchema, 'params'),
  serviceController.getCategoryById
);

/**
 * GET /api/v1/services
 * List services with filtering and pagination.
 */
router.get('/', validate(serviceQuerySchema, 'query'), serviceController.getServices);

/**
 * GET /api/v1/services/:id
 * Get single service by ID.
 */
router.get('/:id', validate(idParamSchema, 'params'), serviceController.getServiceById);

export default router;
