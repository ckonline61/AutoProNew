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
// Phase 11: router.use('/payments', paymentRoutes);
// Phase 12: router.use('/invoices', invoiceRoutes);
// Phase 13: router.use('/notifications', notificationRoutes);
// Phase 14: router.use('/admin', adminRoutes);
// Phase 15: router.use('/config', configRoutes);
// Phase 16: router.use('/cms', cmsRoutes);
// Phase 17: router.use('/products', productRoutes);
// Phase 17: router.use('/cart', cartRoutes);
// Phase 17: router.use('/orders', orderRoutes);
// Phase 18: router.use('/cars', carRoutes);
// Phase 18: router.use('/inspections', inspectionRoutes);

export default router;
