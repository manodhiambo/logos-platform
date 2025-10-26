import { body, param, query } from 'express-validator';

export const createConversationValidator = [
  body('initialMessage')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Initial message must be between 1 and 2000 characters'),
];

export const sendMessageValidator = [
  param('conversationId')
    .isUUID()
    .withMessage('Invalid conversation ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
];

export const conversationIdValidator = [
  param('conversationId')
    .isUUID()
    .withMessage('Invalid conversation ID'),
];

export const getConversationsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('archived')
    .optional()
    .isBoolean()
    .withMessage('Archived must be a boolean'),
];

export const quickAskValidator = [
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Question must be between 1 and 1000 characters'),
];
