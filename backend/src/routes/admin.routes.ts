import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import { idParamSchema } from '../validators/common';
import { updateUserStatusSchema, dashboardQuerySchema } from '../validators/admin.validator';

const router = Router();

// All admin routes require ADMIN or SUPER_ADMIN role
router.use(authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/bookings/recent', validate(dashboardQuerySchema, 'query'), adminController.getRecentBookings);
router.get('/users/recent', validate(dashboardQuerySchema, 'query'), adminController.getRecentUsers);
router.get('/users/:id', validate(idParamSchema, 'params'), adminController.getUserById);
router.put(
  '/users/:id/status',
  validate(idParamSchema, 'params'),
  validate(updateUserStatusSchema, 'body'),
  adminController.updateUserStatus
);
router.get('/health', adminController.getSystemHealth);

export default router;
