import { query, param } from 'express-validator';

export const searchBibleValidator = [
  query('q').optional().isString().withMessage('Search query must be a string'),
  query('query').optional().isString().withMessage('Search query must be a string'),
  query('translation').optional().isString().withMessage('Translation must be a string'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const getVerseValidator = [
  param('book').notEmpty().withMessage('Book is required'),
  param('chapter').isInt({ min: 1 }).withMessage('Chapter must be a positive integer'),
  param('verse').isInt({ min: 1 }).withMessage('Verse must be a positive integer'),
  query('translation').optional().isString(),
];

export const getDailyVerseValidator = [
  query('translation').optional().isString(),
  query('date').optional().isISO8601().withMessage('Date must be in ISO format'),
];
