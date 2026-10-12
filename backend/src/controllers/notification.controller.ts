import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { notificationService } from '../services/notification.service';
import { UnauthorizedError } from '../errors/app-error';

export const notificationController = {
  /**
   * GET /api/v1/notifications
   * List paginated notifications for current user
   */
  getAll: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const result = await notificationService.getAll(userId, page, limit);

    res.status(200).json(
      apiResponse.success(
        result.notifications,
        'Notifications retrieved successfully',
        result.pagination
      )
    );
  }),

  /**
   * GET /api/v1/notifications/unread-count
   * Get unread notification count
   */
  getUnreadCount: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json(apiResponse.success({ count }, 'Unread count retrieved successfully'));
  }),

  /**
   * PUT /api/v1/notifications/:id/read
   * Mark a single notification as read
   */
  markAsRead: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const notificationId = req.params.id as string;
    const notification = await notificationService.markAsRead(userId, notificationId);

    res.status(200).json(apiResponse.success(notification, 'Notification marked as read'));
  }),

  /**
   * PUT /api/v1/notifications/read-all
   * Mark all notifications as read
   */
  markAllAsRead: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json(apiResponse.success(result, 'All notifications marked as read'));
  }),

  /**
   * DELETE /api/v1/notifications/:id
   * Delete a notification
   */
  delete: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const notificationId = req.params.id as string;
    const result = await notificationService.delete(userId, notificationId);

    res.status(200).json(apiResponse.success(result, 'Notification deleted successfully'));
  }),
};

export default notificationController;
