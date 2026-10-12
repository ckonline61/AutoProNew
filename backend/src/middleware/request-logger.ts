import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Morgan-replacement structured request logger using Winston.
 * Logs method, URL, status, response time, and content length.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log after response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || '0',
      requestId: req.headers['x-request-id'],
      userAgent: req.get('user-agent'),
      ip: req.ip,
    };

    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};
