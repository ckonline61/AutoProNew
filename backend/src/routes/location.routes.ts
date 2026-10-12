import { Router } from 'express';
import { locationController } from '../controllers/location.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import { UserRole } from '../types';
import {
  geocodeQuerySchema,
  reverseGeocodeQuerySchema,
  autocompleteQuerySchema,
  distanceMatrixQuerySchema,
  serviceabilitySchema,
  createServiceAreaSchema,
} from '../validators/location.validator';

const router = Router();

/**
 * GET /api/v1/location/geocode
 * Forward geocode address text.
 */
router.get('/geocode', validate(geocodeQuerySchema, 'query'), locationController.geocode);

/**
 * GET /api/v1/location/reverse-geocode
 * Reverse geocode latitude and longitude.
 */
router.get(
  '/reverse-geocode',
  validate(reverseGeocodeQuerySchema, 'query'),
  locationController.reverseGeocode
);

/**
 * GET /api/v1/location/autocomplete
 * Places autocomplete search.
 */
router.get(
  '/autocomplete',
  validate(autocompleteQuerySchema, 'query'),
  locationController.autocomplete
);

/**
 * GET /api/v1/location/distance
 * Calculate route distance & driving duration.
 */
router.get(
  '/distance',
  validate(distanceMatrixQuerySchema, 'query'),
  locationController.calculateDistance
);

/**
 * POST /api/v1/location/serviceable
 * Check if coordinate / pincode / city is within serviceable bounds.
 */
router.post(
  '/serviceable',
  validate(serviceabilitySchema),
  locationController.checkServiceability
);

/**
 * GET /api/v1/location/service-areas
 * List all active service areas.
 */
router.get('/service-areas', locationController.getServiceAreas);

/**
 * GET /api/v1/location/service-areas/:id
 * Get single service area by ID.
 */
router.get(
  '/service-areas/:id',
  validate(idParamSchema, 'params'),
  locationController.getServiceAreaById
);

/**
 * POST /api/v1/location/service-areas
 * Admin: Create a new service area boundary.
 */
router.post(
  '/service-areas',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(createServiceAreaSchema),
  locationController.createServiceArea
);

export default router;
