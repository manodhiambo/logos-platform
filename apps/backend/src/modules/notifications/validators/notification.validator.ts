import { param, query, body } from 'express-validator';

export const notificationIdValidator = [
  param('notificationId')
    .isUUID()
    .withMessage('Invalid notification ID'),
];

export const getNotificationsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('unreadOnly')
    .optional()
    .isBoolean()
    .withMessage('unreadOnly must be a boolean'),
];

export const updatePreferencesValidator = [
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications must be a boolean'),
  body('pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('pushNotifications must be a boolean'),
  body('prayerReminders')
    .optional()
    .isBoolean()
    .withMessage('prayerReminders must be a boolean'),
  body('devotionalReminders')
    .optional()
    .isBoolean()
    .withMessage('devotionalReminders must be a boolean'),
  body('commentNotifications')
    .optional()
    .isBoolean()
    .withMessage('commentNotifications must be a boolean'),
  body('mentionNotifications')
    .optional()
    .isBoolean()
    .withMessage('mentionNotifications must be a boolean'),
  body('communityNotifications')
    .optional()
    .isBoolean()
    .withMessage('communityNotifications must be a boolean'),
];
