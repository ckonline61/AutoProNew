import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { User } from '../models/user.model';
import { assertTrackingAccess } from './tracking-access';
import { updateLocationSchema } from '../validators/mechanic.validator';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  expiresAt?: number;
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
    this.io.use(async (socket: Socket, next: (err?: Error) => void) => {
      const auth = socket.handshake.auth as Record<string, unknown> | undefined;
      const query = socket.handshake.query as Record<string, unknown> | undefined;
      const token = (auth?.token || query?.token) as string | undefined;

      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication token required'));
      }
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as unknown as { userId: string; role: string; exp: number };
        const user = await User.findById(decoded.userId);
        if (!user?.isActive || !decoded.exp) return next(new Error('Account unavailable'));
        const authSocket = socket as AuthenticatedSocket;
        authSocket.userId = decoded.userId;
        authSocket.userRole = user.role;
        authSocket.expiresAt = decoded.exp * 1000;
        next();
      } catch {
        next(new Error('Invalid or expired token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      const userId = authSocket.userId;
      const sessionValid = () => !!userId && !!authSocket.expiresAt && Date.now() < authSocket.expiresAt;
      logger.info(`WebSocket connected: ${userId} (${socket.id})`);

      // Auto-join user's personal room
      if (userId) {
        socket.join(`user:${userId}`);
      }

      // Join booking room
      socket.on('join:booking', async (bookingId: string) => {
        try {
          if (!sessionValid()) throw new Error('Session expired');
          await assertTrackingAccess(userId!, 'booking', bookingId);
          await socket.join(`booking:${bookingId}`);
        } catch { socket.emit('tracking:error', { message: 'Unable to access this booking' }); }
      });

      // Leave booking room
      socket.on('leave:booking', (bookingId: string) => {
        socket.leave(`booking:${bookingId}`);
      });

      // Join emergency room
      socket.on('join:emergency', async (emergencyId: string) => {
        try {
          if (!sessionValid()) throw new Error('Session expired');
          await assertTrackingAccess(userId!, 'emergency', emergencyId);
          await socket.join(`emergency:${emergencyId}`);
        } catch { socket.emit('tracking:error', { message: 'Unable to access this emergency' }); }
      });

      // Leave emergency room
      socket.on('leave:emergency', (emergencyId: string) => {
        socket.leave(`emergency:${emergencyId}`);
      });

      // Provider location update (mechanic publishes location)
      socket.on('location:update', async (data: { latitude: number; longitude: number; bookingId?: string; emergencyId?: string } | null) => {
        try {
          if (!sessionValid() || !data || Boolean(data.bookingId) === Boolean(data.emergencyId)) throw new Error('Invalid location update');
          const location = updateLocationSchema.parse({ ...data, jobId: data.bookingId || data.emergencyId, jobType: data.bookingId ? 'booking' : 'emergency' });
          await assertTrackingAccess(userId!, location.jobType, location.jobId, true);
          const room = `${location.jobType}:${location.jobId}`;
          // Recheck each recipient: a previously assigned provider must lose access after reassignment.
          const recipients = await this.io?.in(room).fetchSockets() || [];
          await Promise.all(recipients.map(async recipient => {
            const local = this.io?.sockets.sockets.get(recipient.id) as AuthenticatedSocket | undefined;
            try {
              if (!local?.userId || !local.expiresAt || local.expiresAt <= Date.now()) throw new Error('Session expired');
              await assertTrackingAccess(local.userId, location.jobType, location.jobId);
              recipient.emit('location:updated', { userId, latitude: location.latitude, longitude: location.longitude, timestamp: new Date().toISOString() });
            } catch { await recipient.leave(room); }
          }));
        } catch { socket.emit('tracking:error', { message: 'Location requires an assigned active journey' }); }
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
