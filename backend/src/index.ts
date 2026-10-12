import http from 'http';
import app from './app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { realtimeService } from './services/realtime.service';
import { logger } from './utils/logger';

/**
 * Start the Auto Pro Backend server.
 * 1. Connect to MongoDB
 * 2. Start Express HTTP server with WebSocket
 * 3. Handle graceful shutdown
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Create HTTP server & initialize WebSocket
    const server = http.createServer(app);
    realtimeService.initialize(server);

    // Start HTTP server
    server.listen(config.port, () => {
      logger.info(`🚗 Auto Pro Backend started`, {
        environment: config.env,
        port: config.port,
        api: `/api/${config.apiVersion}`,
        health: `http://localhost:${config.port}/api/${config.apiVersion}/health`,
      });
    });

    // Graceful shutdown handlers
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await disconnectDatabase();
          logger.info('Graceful shutdown complete');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', { error });
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection', { reason });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to start server', { error: message });
    process.exit(1);
  }
};

startServer();
