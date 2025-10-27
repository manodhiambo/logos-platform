import { query, param } from 'express-validator';

export const searchVersesValidator = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isString()
    .withMessage('Search query must be a string')
    .isLength({ min: 2, max: 200 })
    .withMessage('Search query must be between 2 and 200 characters'),
  query('translation')
    .optional()
    .isString()
    .withMessage('Translation must be a string')
    .isLength({ min: 2, max: 20 })
    .withMessage('Translation code must be between 2 and 20 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const getVerseValidator = [
  param('book')
    .notEmpty()
    .withMessage('Book name is required')
    .isString()
    .withMessage('Book name must be a string'),
  param('chapter')
    .notEmpty()
    .withMessage('Chapter is required')
    .isInt({ min: 1 })
    .withMessage('Chapter must be a positive integer'),
  param('verse')
    .notEmpty()
    .withMessage('Verse is required')
    .isInt({ min: 1 })
    .withMessage('Verse must be a positive integer'),
  query('translation')
    .optional()
    .isString()
    .withMessage('Translation must be a string'),
];

export const getPassageValidator = [
  param('book')
    .notEmpty()
    .withMessage('Book name is required')
    .isString()
    .withMessage('Book name must be a string'),
  param('chapter')
    .notEmpty()
    .withMessage('Chapter is required')
    .isInt({ min: 1 })
    .withMessage('Chapter must be a positive integer'),
  param('verseRange')
    .notEmpty()
    .withMessage('Verse range is required')
    .matches(/^\d+-\d+$/)
    .withMessage('Verse range must be in format: start-end (e.g., 1-6)'),
  query('translation')
    .optional()
    .isString()
    .withMessage('Translation must be a string'),
];

export const getDailyVerseValidator = [
  query('translation')
    .optional()
    .isString()
    .withMessage('Translation must be a string'),
];
