import { Router } from 'express';
import { supportController } from '../controllers/support.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import {
  createTicketSchema,
  addMessageSchema,
  supportQuerySchema,
} from '../validators/support.validator';

const router = Router();

// Customer support routes (all authenticated)
router.use(authenticate);

router.post('/', validate(createTicketSchema, 'body'), supportController.createTicket);
router.get('/', validate(supportQuerySchema, 'query'), supportController.getMyTickets);
router.get('/:id', validate(idParamSchema, 'params'), supportController.getTicketById);
router.post(
  '/:id/messages',
  validate(idParamSchema, 'params'),
  validate(addMessageSchema, 'body'),
  supportController.addMessage
);

export default router;
