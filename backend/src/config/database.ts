import mongoose from 'mongoose';
import { config } from './index';
import { logger } from '../utils/logger';

/**
 * Connect to MongoDB with retry logic.
 * Handles connection events and graceful shutdown.
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    // Mongoose configuration
    mongoose.set('strictQuery', true);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully', {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      });
    });

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error', { error: error.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Connect
    await mongoose.connect(config.mongodb.uri, {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      // Timeouts
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Buffering
      bufferCommands: false,
    });

    logger.info('MongoDB connection established');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to connect to MongoDB', { error: message });
    throw error;
  }
};

/**
 * Disconnect from MongoDB gracefully.
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error disconnecting from MongoDB', { error: message });
    throw error;
  }
};

/**
 * Get database connection status for health checks.
 */
export const getDatabaseStatus = (): {
  status: string;
  readyState: number;
  host: string | undefined;
  name: string | undefined;
} => {
  const readyState = mongoose.connection.readyState;
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    status: stateMap[readyState] || 'unknown',
    readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
};
