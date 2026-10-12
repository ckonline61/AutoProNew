import { Router } from 'express';
import { appConfigController } from '../controllers/app-config.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import {
  setConfigSchema,
  configKeyParamSchema,
} from '../validators/app-config.validator';

const router = Router();

// Admin-only remote configuration routes
router.use(authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/', appConfigController.getAll);
router.get(
  '/:key',
  validate(configKeyParamSchema, 'params'),
  appConfigController.getByKey
);
router.put(
  '/:key',
  validate(configKeyParamSchema, 'params'),
  validate(setConfigSchema, 'body'),
  appConfigController.setKey
);
router.delete(
  '/:key',
  validate(configKeyParamSchema, 'params'),
  appConfigController.deleteKey
);

export default router;
