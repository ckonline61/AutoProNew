import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

/**
 * Custom format for development console output.
 */
const devFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level}] ${message}${metaStr}`;
});

/**
 * Create Winston logger instance.
 * - Development: colorized console output
 * - Production: JSON structured logs
 * - Test: silent
 */
export const logger = winston.createLogger({
  level: config.logging.level,
  defaultMeta: { service: 'auto-pro-backend' },
  transports: [],
});

// Production: JSON format for log aggregation
if (config.env === 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
      ),
    })
  );
} else if (config.env === 'test') {
  // Test: silent by default
  logger.silent = true;
} else {
  // Development: readable colored output
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        devFormat
      ),
    })
  );
}

/**
 * Create a child logger with additional context.
 */
export const createLogger = (context: string) => {
  return logger.child({ context });
};
