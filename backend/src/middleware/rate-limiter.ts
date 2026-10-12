import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { apiResponse } from '../utils/api-response';
import { config } from '../config';

/**
 * Passthrough middleware for test environment (no rate limiting).
 */
const noopMiddleware = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

/**
 * Rate limiter for authentication endpoints (login, register).
 * Limit: 5 requests per 1 minute window.
 * Disabled in test environment.
 */
export const authRateLimiter = config.env === 'test'
  ? noopMiddleware
  : rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: apiResponse.error(
        'Too many authentication attempts, please try again after a minute',
        429,
        'TOO_MANY_REQUESTS'
      ),
    });

/**
 * Rate limiter for general API endpoints.
 * Limit: 100 requests per 1 minute window.
 * Disabled in test environment.
 */
export const apiRateLimiter = config.env === 'test'
  ? noopMiddleware
  : rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: apiResponse.error(
        'Too many requests, please try again later',
        429,
        'TOO_MANY_REQUESTS'
      ),
    });
