import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import { auditQuerySchema } from '../validators/audit.validator';
import { objectIdSchema } from '../validators/common';
import { z } from 'zod';

const router = Router();

// Admin-only audit log routes
router.use(authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/', validate(auditQuerySchema, 'query'), auditController.getAll);
router.get(
  '/user/:userId',
  validate(z.object({ userId: objectIdSchema }), 'params'),
  auditController.getByUser
);
router.get('/resource/:resource', auditController.getByResource);

export default router;
