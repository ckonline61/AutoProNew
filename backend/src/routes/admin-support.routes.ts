import { Router } from 'express';
import { supportController } from '../controllers/support.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import { idParamSchema } from '../validators/common';
import {
  supportQuerySchema,
  updateTicketStatusSchema,
  assignTicketSchema,
} from '../validators/support.validator';

const router = Router();

// Admin-only support management routes
router.use(authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/', validate(supportQuerySchema, 'query'), supportController.getAllTicketsAdmin);
router.put(
  '/:id/status',
  validate(idParamSchema, 'params'),
  validate(updateTicketStatusSchema, 'body'),
  supportController.updateTicketStatus
);
router.put(
  '/:id/assign',
  validate(idParamSchema, 'params'),
  validate(assignTicketSchema, 'body'),
  supportController.assignTicket
);

export default router;
