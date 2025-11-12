import { body, param } from 'express-validator';

export const createAnnouncementValidator = [
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('content')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('type')
    .optional()
    .isIn(['info', 'warning', 'urgent', 'maintenance'])
    .withMessage('Invalid announcement type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiration date'),
];

export const updateAnnouncementValidator = [
  param('announcementId')
    .isUUID()
    .withMessage('Invalid announcement ID'),
  body('title')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('content')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  body('type')
    .optional()
    .isIn(['info', 'warning', 'urgent', 'maintenance'])
    .withMessage('Invalid announcement type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiration date'),
];

export const deleteAnnouncementValidator = [
  param('announcementId')
    .isUUID()
    .withMessage('Invalid announcement ID'),
];
