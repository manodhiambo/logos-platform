import { body } from 'express-validator';

export const createPrayerRequestValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['health', 'family', 'work', 'spiritual', 'financial', 'relationships', 'other'])
    .withMessage('Invalid category'),
  
  body('privacyLevel')
    .optional()
    .isIn(['public', 'private', 'friends_only'])
    .withMessage('Invalid privacy level'),
];

export const updatePrayerStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'answered', 'closed'])
    .withMessage('Invalid status'),
  
  body('testimony')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Testimony must not exceed 1000 characters'),
];
