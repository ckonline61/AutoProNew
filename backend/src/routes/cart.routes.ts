import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validator';
import { z } from 'zod';
import { objectIdSchema } from '../validators/common';

const sparePartIdParamSchema = z.object({
  sparePartId: objectIdSchema,
});

const router = Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', validate(addToCartSchema), cartController.addItem);
router.put('/items/:sparePartId', validate(sparePartIdParamSchema, 'params'), validate(updateCartItemSchema), cartController.updateItemQuantity);
router.delete('/items/:sparePartId', validate(sparePartIdParamSchema, 'params'), cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
