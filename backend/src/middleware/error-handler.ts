import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { apiResponse } from '../utils/api-response';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * Central error handler middleware.
 * Must be registered LAST in the middleware chain.
 *
 * Handles:
 * - AppError (operational errors with known status codes)
 * - Mongoose validation errors
 * - Mongoose cast errors (invalid ObjectId)
 * - Mongoose duplicate key errors
 * - JSON parse errors
 * - Unknown/unexpected errors
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    requestId: req.headers['x-request-id'],
    ip: req.ip,
  };

  // Known operational errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { ...requestInfo, code: err.code, stack: err.stack });
    } else {
      logger.warn(err.message, { ...requestInfo, code: err.code });
    }

    res.status(err.statusCode).json(
      apiResponse.error(err.message, err.statusCode, err.code)
    );
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const mongooseErr = err as Error & { errors?: Record<string, { message: string }> };
    const details = mongooseErr.errors
      ? Object.entries(mongooseErr.errors).map(([field, e]) => ({
          field,
          message: e.message,
        }))
      : undefined;

    logger.warn('Mongoose validation error', { ...requestInfo, details });

    res.status(422).json(
      apiResponse.error('Validation failed', 422, 'VALIDATION_ERROR', details)
    );
    return;
  }

  // Mongoose CastError (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    const castErr = err as Error & { path?: string; value?: unknown };
    logger.warn('Invalid ID format', { ...requestInfo, path: castErr.path, value: castErr.value });

    res.status(400).json(
      apiResponse.error('Invalid ID format', 400, 'INVALID_ID')
    );
    return;
  }

  // Mongoose duplicate key error (code 11000)
  if ('code' in err && (err as Error & { code: number }).code === 11000) {
    const dupErr = err as Error & { keyPattern?: Record<string, number> };
    const field = dupErr.keyPattern ? Object.keys(dupErr.keyPattern)[0] : 'unknown';
    logger.warn('Duplicate key error', { ...requestInfo, field });

    res.status(409).json(
      apiResponse.error(`${field} already exists`, 409, 'DUPLICATE_KEY')
    );
    return;
  }

  // JSON syntax error (malformed request body)
  if (err instanceof SyntaxError && 'body' in err) {
    logger.warn('Malformed JSON in request body', requestInfo);

    res.status(400).json(
      apiResponse.error('Malformed JSON in request body', 400, 'INVALID_JSON')
    );
    return;
  }

  // Unexpected errors
  logger.error('Unexpected error', {
    ...requestInfo,
    error: err.message,
    stack: err.stack,
    name: err.name,
  });

  const message = config.env === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(500).json(
    apiResponse.error(message, 500, 'INTERNAL_ERROR')
  );
};
