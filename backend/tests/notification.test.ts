import request from 'supertest';
import app from '../src/app';
import { notificationService } from '../src/services/notification.service';
import { User } from '../src/models/user.model';
import { UserRole, NotificationType } from '../src/types';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';
import { NotFoundError, ForbiddenError } from '../src/errors/app-error';

jest.mock('../src/services/notification.service');
jest.mock('../src/models/user.model');

describe('Notification Routes Integration Tests', () => {
  const userId = '507f1f77bcf86cd799439011';
  const mockUser = {
    _id: userId,
    name: 'Notification Tester',
    email: 'tester@example.com',
    role: UserRole.CUSTOMER,
    isActive: true,
  };

  const authToken = jwt.sign(
    { userId, role: UserRole.CUSTOMER, email: 'tester@example.com' },
    config.jwt.secret || 'test-jwt-secret-for-testing'
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/v1/notifications', () => {
    it('should return paginated notifications for authenticated user', async () => {
      const mockResult = {
        notifications: [
          {
            _id: '507f1f77bcf86cd799439044',
            userId,
            title: 'Booking Confirmed',
            message: 'Your booking has been confirmed.',
            type: NotificationType.BOOKING,
            isRead: false,
            createdAt: new Date(),
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      (notificationService.getAll as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/v1/notifications?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.total).toBe(1);
      expect(notificationService.getAll).toHaveBeenCalledWith(userId, 1, 20);
    });

    it('should return 401 Unauthorized without token', async () => {
      const response = await request(app).get('/api/v1/notifications');
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/notifications/unread-count', () => {
    it('should return unread count', async () => {
      (notificationService.getUnreadCount as jest.Mock).mockResolvedValue(3);

      const response = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(3);
    });
  });

  describe('PUT /api/v1/notifications/:id/read', () => {
    const notificationId = '507f1f77bcf86cd799439044';

    it('should mark single notification as read', async () => {
      const mockUpdated = {
        _id: notificationId,
        userId,
        title: 'Booking Confirmed',
        message: 'Your booking has been confirmed.',
        type: NotificationType.BOOKING,
        isRead: true,
        readAt: new Date(),
      };

      (notificationService.markAsRead as jest.Mock).mockResolvedValue(mockUpdated);

      const response = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isRead).toBe(true);
      expect(notificationService.markAsRead).toHaveBeenCalledWith(userId, notificationId);
    });

    it('should return 404 when notification does not exist', async () => {
      (notificationService.markAsRead as jest.Mock).mockRejectedValue(
        new NotFoundError('Notification not found')
      );

      const response = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 when notification does not belong to user', async () => {
      (notificationService.markAsRead as jest.Mock).mockRejectedValue(
        new ForbiddenError('You do not have permission to update this notification')
      );

      const response = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      (notificationService.markAllAsRead as jest.Mock).mockResolvedValue({ modifiedCount: 5 });

      const response = await request(app)
        .put('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.modifiedCount).toBe(5);
      expect(notificationService.markAllAsRead).toHaveBeenCalledWith(userId);
    });
  });

  describe('DELETE /api/v1/notifications/:id', () => {
    const notificationId = '507f1f77bcf86cd799439044';

    it('should delete notification successfully', async () => {
      (notificationService.delete as jest.Mock).mockResolvedValue({ deleted: true });

      const response = await request(app)
        .delete(`/api/v1/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toBe(true);
      expect(notificationService.delete).toHaveBeenCalledWith(userId, notificationId);
    });
  });
});
