import { Router } from 'express';
import notificationController from '../controllers/notification.controller';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  notificationIdValidator,
  getNotificationsValidator,
  updatePreferencesValidator,
} from '../validators/notification.validator';

const router = Router();

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  getNotificationsValidator,
  validate,
  notificationController.getNotifications
);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notifications count
 * @access  Private
 */
router.get(
  '/unread-count',
  authenticate,
  notificationController.getUnreadCount
);

/**
 * @route   GET /api/v1/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get(
  '/preferences',
  authenticate,
  notificationController.getPreferences
);

/**
 * @route   PUT /api/v1/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put(
  '/preferences',
  authenticate,
  updatePreferencesValidator,
  validate,
  notificationController.updatePreferences
);

/**
 * @route   PUT /api/v1/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put(
  '/:notificationId/read',
  authenticate,
  notificationIdValidator,
  validate,
  notificationController.markAsRead
);

/**
 * @route   PUT /api/v1/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put(
  '/mark-all-read',
  authenticate,
  notificationController.markAllAsRead
);

/**
 * @route   DELETE /api/v1/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
router.delete(
  '/:notificationId',
  authenticate,
  notificationIdValidator,
  validate,
  notificationController.deleteNotification
);

export default router;
