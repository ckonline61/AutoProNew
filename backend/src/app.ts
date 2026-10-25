import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import { requestId } from './middleware/request-id';
import { apiResponse } from './utils/api-response';
import apiRoutes from './routes';

const app = express();

// CORS must come BEFORE helmet
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    const allowed = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim());
    // If CORS_ORIGIN not set or origin is in allowed list, allow it
    if (allowed.length === 0 || allowed.includes(origin) || allowed.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  optionsSuccessStatus: 200,
}));
// Security middleware (after CORS)
app.use(helmet({ crossOriginResourcePolicy: false }));

// Rate limiting (disabled in test environment)
if (config.env !== 'test') {
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: apiResponse.error('Too many requests, please try again later', 429),
  });
  app.use(limiter);
}

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging (use morgan for HTTP request logging in non-test environments)
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Request ID
app.use(requestId);

// API routes (versioned)
app.use(`/api/${config.apiVersion}`, apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
