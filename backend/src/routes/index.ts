import { Router } from 'express';
import { apiResponse } from '../utils/api-response';
import { getDatabaseStatus } from '../config/database';
import { config } from '../config';
import authRoutes from './auth.routes';

/**
 * API v1 Router
 * All /api/v1/ routes are registered here.
 * Individual module routes will be added in future phases.
 */
const router = Router();

/**
 * GET /api/v1/health
 * Health check endpoint with database status.
 */
router.get('/health', (_req, res) => {
  const dbStatus = getDatabaseStatus();

  res.json(apiResponse.success({
    status: 'healthy',
    service: 'auto-pro-backend',
    version: config.apiVersion,
    timestamp: new Date().toISOString(),
    environment: config.env,
    uptime: process.uptime(),
    database: dbStatus,
  }, 'Service is running'));
});

// Future phase routes will be added here:
router.use('/auth', authRoutes);

import userRoutes from './user.routes';
import vehicleRoutes from './vehicle.routes';
import addressRoutes from './address.routes';

router.use('/users/profile', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/addresses', addressRoutes);

// Device token endpoint (push notifications)
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
router.post('/users/device-token', authenticate, userController.saveDeviceToken);
// Phase 05: router.use('/users', userRoutes);
// Phase 05: router.use('/vehicles', vehicleRoutes);
// Phase 05: router.use('/addresses', addressRoutes);
import serviceRoutes from './service.routes';
import bookingRoutes from './booking.routes';

router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
// Phase 06: router.use('/services', serviceRoutes);
import mechanicRoutes from './mechanic.routes';

router.use('/mechanics', mechanicRoutes);
// Phase 07: router.use('/mechanics', mechanicRoutes);
import emergencyRoutes from './emergency.routes';

router.use('/emergency', emergencyRoutes);
// Phase 08: router.use('/emergency', emergencyRoutes);
import locationRoutes from './location.routes';

router.use('/location', locationRoutes);
// Phase 09: router.use('/location', locationRoutes);
import paymentRoutes from './payment.routes';
import invoiceRoutes from './invoice.routes';
import notificationRoutes from './notification.routes';

router.use('/payments', paymentRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/notifications', notificationRoutes);

// Phase 14: Reviews & Coupons
import reviewRoutes from './review.routes';
import couponRoutes from './coupon.routes';

router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);

// Phase 15: Spare Parts Marketplace
import sparePartRoutes from './spare-part.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';

router.use('/spare-parts', sparePartRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

// Phase 16: Used Cars & Car Inspection
import usedCarRoutes from './used-car.routes';
import inspectionRoutes from './inspection.routes';

router.use('/used-cars', usedCarRoutes);
router.use('/inspections', inspectionRoutes);

// Phase 17: Admin Dashboard & Feature Flags
import adminRoutes from './admin.routes';
import featureFlagRoutes from './feature-flag.routes';

router.use('/admin', adminRoutes);
router.use('/feature-flags', featureFlagRoutes);

// Phase 18: Support & Audit Logs
import supportRoutes from './support.routes';
import adminSupportRoutes from './admin-support.routes';
import adminAuditRoutes from './admin-audit.routes';

router.use('/support', supportRoutes);
router.use('/admin/support', adminSupportRoutes);
router.use('/admin/audit-logs', adminAuditRoutes);

// Phase 19: CMS & Remote Config
import cmsRoutes from './cms.routes';
import adminCmsRoutes from './admin-cms.routes';
import appConfigRoutes from './app-config.routes';
import adminConfigRoutes from './admin-config.routes';

router.use('/cms', cmsRoutes);
router.use('/admin/cms', adminCmsRoutes);
router.use('/config', appConfigRoutes);
router.use('/admin/config', adminConfigRoutes);

// Phase 20: AI Integration Layer & Final Polish
import aiRoutes from './ai.routes';

router.use('/ai', aiRoutes);

export default router;
