import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class RealtimeService {
  private io: Server | null = null;

  /**
   * Initialize Socket.IO server with JWT authentication handshake.
   */
  initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.cors.origin,
        credentials: true,
      },
      pingTimeout: 30000,
      pingInterval: 10000,
    });

    // JWT authentication middleware
    this.io.use((socket: Socket, next: (err?: Error) => void) => {
      const auth = socket.handshake.auth as Record<string, unknown> | undefined;
      const query = socket.handshake.query as Record<string, unknown> | undefined;
      const token = (auth?.token || query?.token) as string | undefined;

      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication token required'));
      }
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as unknown as { userId: string; role: string };
        const authSocket = socket as AuthenticatedSocket;
        authSocket.userId = decoded.userId;
        authSocket.userRole = decoded.role;
        next();
      } catch {
        next(new Error('Invalid or expired token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      const userId = authSocket.userId;
      logger.info(`WebSocket connected: ${userId} (${socket.id})`);

      // Auto-join user's personal room
      if (userId) {
        socket.join(`user:${userId}`);
      }

      // Join booking room
      socket.on('join:booking', (bookingId: string) => {
        socket.join(`booking:${bookingId}`);
        logger.info(`User ${userId} joined booking room: ${bookingId}`);
      });

      // Leave booking room
      socket.on('leave:booking', (bookingId: string) => {
        socket.leave(`booking:${bookingId}`);
      });

      // Join emergency room
      socket.on('join:emergency', (emergencyId: string) => {
        socket.join(`emergency:${emergencyId}`);
        logger.info(`User ${userId} joined emergency room: ${emergencyId}`);
      });

      // Leave emergency room
      socket.on('leave:emergency', (emergencyId: string) => {
        socket.leave(`emergency:${emergencyId}`);
      });

      // Provider location update (mechanic publishes location)
      socket.on('location:update', (data: { latitude: number; longitude: number; bookingId?: string; emergencyId?: string }) => {
        const { latitude, longitude, bookingId, emergencyId } = data;

        if (bookingId) {
          this.io?.to(`booking:${bookingId}`).emit('location:updated', {
            userId,
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
          });
        }

        if (emergencyId) {
          this.io?.to(`emergency:${emergencyId}`).emit('location:updated', {
            userId,
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
          });
        }
      });

      socket.on('disconnect', (reason: string) => {
        logger.info(`WebSocket disconnected: ${userId} (${reason})`);
      });
    });

    logger.info('WebSocket server initialized');
  }

  /**
   * Emit event to a specific booking room.
   */
  emitToBooking(bookingId: string, event: string, data: unknown): void {
    this.io?.to(`booking:${bookingId}`).emit(event, data);
  }

  /**
   * Emit event to a specific emergency room.
   */
  emitToEmergency(emergencyId: string, event: string, data: unknown): void {
    this.io?.to(`emergency:${emergencyId}`).emit(event, data);
  }

  /**
   * Emit event to a specific user.
   */
  emitToUser(userId: string, event: string, data: unknown): void {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Broadcast to all connected clients.
   */
  broadcast(event: string, data: unknown): void {
    this.io?.emit(event, data);
  }

  /**
   * Get the Socket.IO server instance.
   */
  getIO(): Server | null {
    return this.io;
  }
}

export const realtimeService = new RealtimeService();
