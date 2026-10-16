import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuditAction, BookingStatus, UserRole } from '../types';
import { idParamSchema } from '../validators/common';
import { updateUserStatusSchema, dashboardQuerySchema } from '../validators/admin.validator';
import { adminResourceParams } from '../validators/admin-resources.validator';
import { paginationSchema } from '../validators/common';
import { adminResourcesService } from '../services/admin-resources.service';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { bookingService } from '../services/booking.service';
import { emergencyService } from '../services/emergency.service';
import { updateBookingStatusSchema } from '../validators/booking.validator';
import { objectIdSchema } from '../validators/common';
import { auditService } from '../services/audit.service';
import { z } from 'zod';
import { UnauthorizedError, BadRequestError } from '../errors/app-error';

const router = Router();

// All admin routes require ADMIN or SUPER_ADMIN role
router.use(authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));
router.put('/emergency/:id/assign', validate(idParamSchema, 'params'), validate(z.object({ providerId: objectIdSchema })), asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const actor = { id: req.user._id.toString(), role: req.user.role };
  const emergency = await emergencyService.assignProvider(req.params.id as string, req.body.providerId, actor);
  await auditService.log(actor.id, AuditAction.UPDATE, 'EmergencyRequest', emergency._id.toString(), { assignedProviderId: req.body.providerId });
  res.json(apiResponse.success(emergency, 'Emergency provider assigned'));
}));
router.put('/bookings/:id/status', validate(idParamSchema,'params'), validate(updateBookingStatusSchema.extend({ status: z.enum([BookingStatus.CONFIRMED,BookingStatus.CANCELLED,BookingStatus.REJECTED]) })), asyncHandler(async (req,res) => {
  const actor = req.user?._id?.toString(); if (!actor) throw new UnauthorizedError();
  const booking = await bookingService.updateStatus(req.params.id as string,req.body.status,actor,req.body.reason);
  await auditService.log(actor,AuditAction.UPDATE,'Booking',booking._id.toString(),{ status: booking.status });
  res.json(apiResponse.success(booking,'Booking status updated'));
}));
router.put('/bookings/:id/assign', validate(idParamSchema,'params'), validate(z.object({ mechanicId: objectIdSchema })), asyncHandler(async (req,res) => {
  const actor = req.user?._id?.toString(); if (!actor) throw new UnauthorizedError();
  const booking = await bookingService.assignMechanic(req.params.id as string,req.body.mechanicId,actor);
  await auditService.log(actor,AuditAction.UPDATE,'Booking',booking._id.toString(),{ mechanicId: req.body.mechanicId });
  res.json(apiResponse.success(booking,'Mechanic assigned'));
}));
router.get('/resources/:resource', validate(adminResourceParams,'params'), validate(paginationSchema,'query'), asyncHandler(async (req,res) => {
  const result = await adminResourcesService.list(req.params.resource as string, Number(req.query.page), Number(req.query.limit));
  res.json(apiResponse.success(result.items,'Records retrieved successfully',result.pagination));
}));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/bookings/recent', validate(dashboardQuerySchema, 'query'), adminController.getRecentBookings);
router.get('/users/recent', validate(dashboardQuerySchema, 'query'), adminController.getRecentUsers);
router.get('/users/:id', validate(idParamSchema, 'params'), adminController.getUserById);
router.put(
  '/users/:id/status',
  validate(idParamSchema, 'params'),
  validate(updateUserStatusSchema, 'body'),
  (req,_res,next) => {
    if (req.user?._id?.toString() === req.params.id && req.body.isActive === false) throw new BadRequestError('You cannot deactivate your own administrator account');
    next();
  },
  adminController.updateUserStatus
);
router.get('/health', adminController.getSystemHealth);

export default router;
