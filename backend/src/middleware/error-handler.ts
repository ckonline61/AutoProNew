import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { apiResponse } from '../utils/api-response';
import { config } from '../config';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      apiResponse.error(err.message, err.statusCode, err.code)
    );
    return;
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  const statusCode = 500;
  const message = config.env === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json(
    apiResponse.error(message, statusCode, 'INTERNAL_ERROR')
  );
};
