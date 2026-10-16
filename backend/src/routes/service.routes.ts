import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import { serviceQuerySchema, createServiceSchema, updateServiceSchema, createServiceCategorySchema } from '../validators/service.validator';
import { authenticate, authorize } from '../middleware/auth';
import { AuditAction, UserRole } from '../types';
import { catalogAdminService } from '../services/catalog-admin.service';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { auditService } from '../services/audit.service';
import { UnauthorizedError } from '../errors/app-error';
import { z } from 'zod';

const router = Router();
const requireAdmin = [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)];
router.post('/categories', ...requireAdmin, validate(createServiceCategorySchema.extend({ isActive: z.boolean().optional() })), asyncHandler(async (req,res) => {
  const actor = req.user?._id?.toString(); if (!actor) throw new UnauthorizedError();
  const category = await catalogAdminService.createCategory(req.body);
  await auditService.log(actor,AuditAction.CREATE,'ServiceCategory',category._id.toString(),{ name: category.name });
  res.status(201).json(apiResponse.success(category,'Category created successfully'));
}));
router.put('/categories/:id', ...requireAdmin, validate(idParamSchema,'params'), validate(createServiceCategorySchema.partial().extend({ isActive: z.boolean().optional() })), asyncHandler(async (req,res) => {
  const actor = req.user?._id?.toString(); if (!actor) throw new UnauthorizedError();
  const category = await catalogAdminService.updateCategory(req.params.id as string,req.body);
  await auditService.log(actor,AuditAction.UPDATE,'ServiceCategory',category._id.toString(),{ name: category.name, isActive: category.isActive });
  res.json(apiResponse.success(category,'Category updated successfully'));
}));
router.post('/', ...requireAdmin, validate(createServiceSchema.extend({ isActive: z.boolean().optional() })), asyncHandler(async (req,res) => {
  const actor = req.user?._id?.toString(); if (!actor) throw new UnauthorizedError();
  const service = await catalogAdminService.create(req.body);
  await auditService.log(actor,AuditAction.CREATE,'Service',service._id.toString(),{ name: service.name });
  res.status(201).json(apiResponse.success(service,'Service created successfully'));
}));
router.put('/:id', ...requireAdmin, validate(idParamSchema,'params'), validate(updateServiceSchema.extend({ isActive: z.boolean().optional() })), asyncHandler(async (req,res) => {
  const actor = req.user?._id?.toString(); if (!actor) throw new UnauthorizedError();
  const service = await catalogAdminService.update(req.params.id as string,req.body);
  await auditService.log(actor,AuditAction.UPDATE,'Service',service._id.toString(),{ name: service.name, isActive: service.isActive, price: service.price });
  res.json(apiResponse.success(service,'Service updated successfully'));
}));

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
