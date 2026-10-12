import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import { idParamSchema } from '../validators/common';
import {
  createPageSchema,
  updatePageSchema,
  cmsQuerySchema,
} from '../validators/cms.validator';

const router = Router();

// Admin-only CMS routes
router.use(authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/pages', validate(cmsQuerySchema, 'query'), cmsController.getAllPagesAdmin);
router.post('/pages', validate(createPageSchema, 'body'), cmsController.createPage);
router.put(
  '/pages/:id',
  validate(idParamSchema, 'params'),
  validate(updatePageSchema, 'body'),
  cmsController.updatePage
);
router.put(
  '/pages/:id/publish',
  validate(idParamSchema, 'params'),
  cmsController.publishPage
);
router.put(
  '/pages/:id/unpublish',
  validate(idParamSchema, 'params'),
  cmsController.unpublishPage
);
router.delete(
  '/pages/:id',
  validate(idParamSchema, 'params'),
  cmsController.deletePage
);

export default router;
