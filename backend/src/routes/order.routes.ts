import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import { placeOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post('/', validate(placeOrderSchema), orderController.placeOrder);
router.get('/', orderController.getOrders);
router.get('/:id', validate(idParamSchema, 'params'), orderController.getOrderById);
router.post('/:id/cancel', validate(idParamSchema, 'params'), orderController.cancelOrder);
router.put('/:id/status', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), validate(idParamSchema, 'params'), validate(updateOrderStatusSchema), orderController.updateStatus);

export default router;
