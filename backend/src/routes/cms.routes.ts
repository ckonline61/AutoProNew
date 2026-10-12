import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller';
import { validate } from '../middleware/validate';
import { cmsQuerySchema, slugParamSchema } from '../validators/cms.validator';

const router = Router();

// Public CMS routes
router.get('/pages', validate(cmsQuerySchema, 'query'), cmsController.getAllPages);
router.get('/pages/:slug', validate(slugParamSchema, 'params'), cmsController.getPageBySlug);

export default router;
