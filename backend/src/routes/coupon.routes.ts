import { Router } from 'express';
import { couponController } from '../controllers/coupon.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import { createCouponSchema, validateCouponSchema } from '../validators/coupon.validator';
import { UserRole } from '../types';

const router = Router();

// Public endpoint — active coupons visible in app without login
router.get('/public', couponController.getPublicActive);

router.use(authenticate);

// Authenticated customer/any user can validate a coupon
router.post('/validate', validate(validateCouponSchema), couponController.validate);

// Admin-only endpoints
router.post('/', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), validate(createCouponSchema), couponController.create);
router.get('/', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), couponController.getAll);
router.put('/:id/deactivate', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), validate(idParamSchema, 'params'), couponController.deactivate);

export default router;
