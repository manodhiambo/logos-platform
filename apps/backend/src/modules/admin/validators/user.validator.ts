import { body, param } from 'express-validator';

export const deleteUserValidator = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID'),
  body('deleteType')
    .optional()
    .isIn(['soft', 'hard'])
    .withMessage('deleteType must be either soft or hard'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .withMessage('Reason must be a string'),
];

export const updateUserValidator = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['user', 'moderator', 'admin', 'super_admin'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];
