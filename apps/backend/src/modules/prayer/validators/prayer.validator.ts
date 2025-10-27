import { body, param, query } from 'express-validator';

export const createPrayerRequestValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['personal', 'family', 'health', 'guidance', 'thanksgiving', 'other'])
    .withMessage('Invalid category'),
  body('privacyLevel')
    .optional()
    .isIn(['public', 'community', 'private'])
    .withMessage('Invalid privacy level'),
];

export const updatePrayerRequestValidator = [
  param('requestId')
    .isUUID()
    .withMessage('Invalid request ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['personal', 'family', 'health', 'guidance', 'thanksgiving', 'other'])
    .withMessage('Invalid category'),
  body('privacyLevel')
    .optional()
    .isIn(['public', 'community', 'private'])
    .withMessage('Invalid privacy level'),
];

export const requestIdValidator = [
  param('requestId')
    .isUUID()
    .withMessage('Invalid request ID'),
];

export const getPrayerRequestsValidator = [
  query('category')
    .optional()
    .isIn(['personal', 'family', 'health', 'guidance', 'thanksgiving', 'other'])
    .withMessage('Invalid category'),
  query('status')
    .optional()
    .isIn(['active', 'answered', 'ongoing'])
    .withMessage('Invalid status'),
  query('userId')
    .optional()
    .isUUID()
    .withMessage('Invalid user ID'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const prayForRequestValidator = [
  param('requestId')
    .isUUID()
    .withMessage('Invalid request ID'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters'),
];

export const updateStatusValidator = [
  param('requestId')
    .isUUID()
    .withMessage('Invalid request ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'answered', 'ongoing'])
    .withMessage('Invalid status'),
  body('testimony')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Testimony must not exceed 2000 characters'),
];
