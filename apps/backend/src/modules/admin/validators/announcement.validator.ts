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
    .isIn(['general', 'maintenance', 'feature', 'event', 'urgent'])
    .withMessage('Invalid announcement type'),

  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),

  body('priority')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Priority must be between 1 and 5'),

  body('isGlobal')
    .optional()
    .isBoolean()
    .withMessage('isGlobal must be a boolean'),

  body('targetCommunityId')
    .optional()
    .isUUID()
    .withMessage('Invalid community ID'),

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
    .isIn(['general', 'maintenance', 'feature', 'event', 'urgent'])
    .withMessage('Invalid announcement type'),

  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),

  body('priority')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Priority must be between 1 and 5'),

  body('isGlobal')
    .optional()
    .isBoolean()
    .withMessage('isGlobal must be a boolean'),

  body('targetCommunityId')
    .optional()
    .isUUID()
    .withMessage('Invalid community ID'),

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
