import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rate-limiter';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new customer.
 */
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

/**
 * POST /api/v1/auth/login
 * Log in with email and password.
 */
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token.
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken
);

/**
 * POST /api/v1/auth/logout
 * Log out user and revoke refresh token.
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);

/**
 * GET /api/v1/auth/me
 * Get current authenticated user profile.
 */
router.get(
  '/me',
  authenticate,
  authController.getMe
);

/**
 * POST /api/v1/auth/google
 * Sign in / register with Google ID token.
 */
router.post('/google', authRateLimiter, authController.googleSignIn);

export default router;
