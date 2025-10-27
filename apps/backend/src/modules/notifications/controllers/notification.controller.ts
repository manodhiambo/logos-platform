import { Request, Response, NextFunction } from 'express';
import notificationService from '../services/notification.service';
import { successResponse } from '../../../shared/utils/response.util';

class NotificationController {
  /**
   * Get user's notifications
   */
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const result = await notificationService.getNotifications(
        userId,
        Number(page),
        Number(limit),
        unreadOnly === 'true'
      );

      return successResponse(res, 'Notifications retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const userId = req.user!.id;

      const notification = await notificationService.markAsRead(notificationId, userId);

      return successResponse(res, 'Notification marked as read', { notification });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const result = await notificationService.markAllAsRead(userId);

      return successResponse(res, result.message);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const userId = req.user!.id;

      const result = await notificationService.deleteNotification(notificationId, userId);

      return successResponse(res, result.message);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const result = await notificationService.getUnreadCount(userId);

      return successResponse(res, 'Unread count retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const preferences = await notificationService.getPreferences(userId);

      return successResponse(res, 'Preferences retrieved successfully', { preferences });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const preferences = await notificationService.updatePreferences(userId, req.body);

      return successResponse(res, 'Preferences updated successfully', { preferences });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new NotificationController();
