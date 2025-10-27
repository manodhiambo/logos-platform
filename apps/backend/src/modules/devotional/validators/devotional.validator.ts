import { param, body, query } from 'express-validator';

export const devotionalIdValidator = [
  param('devotionalId')
    .isUUID()
    .withMessage('Invalid devotional ID'),
];

export const addNotesValidator = [
  param('devotionalId')
    .isUUID()
    .withMessage('Invalid devotional ID'),
  body('notes')
    .trim()
    .notEmpty()
    .withMessage('Notes cannot be empty')
    .isLength({ max: 5000 })
    .withMessage('Notes must not exceed 5000 characters'),
];

export const getDevotionalsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
