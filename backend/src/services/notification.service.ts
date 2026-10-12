import { Types } from 'mongoose';
import { Notification, INotification } from '../models/notification.model';
import { NotificationType } from '../types';
import { realtimeService } from './realtime.service';
import { NotFoundError, ForbiddenError } from '../errors/app-error';
import { PaginationInfo } from '../utils/api-response';

export interface PaginatedNotifications {
  notifications: INotification[];
  pagination: PaginationInfo;
}

export class NotificationService {
  /**
   * Create notification and emit via WebSocket
   */
  async create(
    userId: string | Types.ObjectId,
    title: string,
    message: string,
    type: NotificationType,
    data?: Record<string, unknown>
  ): Promise<INotification> {
    const notification = await Notification.create({
      userId: new Types.ObjectId(userId),
      title,
      message,
      type,
      data,
      isRead: false,
    });

    try {
      if (realtimeService && typeof realtimeService.emitToUser === 'function') {
        realtimeService.emitToUser(userId.toString(), 'notification:new', notification);
      }
    } catch {
      // Non-blocking if socket emit fails
    }

    return notification;
  }

  /**
   * Get paginated notifications for a user
   */
  async getAll(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedNotifications> {
    const userObjectId = new Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ userId: userObjectId }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get count of unread notifications for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<INotification> {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to update this notification');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await Notification.updateMany(
      {
        userId: new Types.ObjectId(userId),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Delete a notification
   */
  async delete(userId: string, notificationId: string): Promise<{ deleted: boolean }> {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to delete this notification');
    }

    await Notification.findByIdAndDelete(notificationId);

    return { deleted: true };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
