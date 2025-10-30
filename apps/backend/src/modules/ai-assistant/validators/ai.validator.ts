import { body, param } from 'express-validator';

export const createConversationValidator = [
  body('title').optional().isString().withMessage('Title must be a string'),
  body('initialMessage').notEmpty().isString().withMessage('Initial message is required'),
];

export const sendMessageValidator = [
  param('conversationId').isUUID().withMessage('Invalid conversation ID'),
  body('content').notEmpty().isString().withMessage('Message content is required'),
];

export const quickAskValidator = [
  body('question').notEmpty().isString().withMessage('Question is required'),
];
