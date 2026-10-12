import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /api/v1/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

/**
 * PUT /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', authenticate, notificationController.markAllAsRead);

/**
 * GET /api/v1/notifications
 * List paginated notifications
 */
router.get('/', authenticate, notificationController.getAll);

/**
 * PUT /api/v1/notifications/:id/read
 * Mark single notification as read
 */
router.put('/:id/read', authenticate, notificationController.markAsRead);

/**
 * DELETE /api/v1/notifications/:id
 * Delete a notification
 */
router.delete('/:id', authenticate, notificationController.delete);

export default router;
