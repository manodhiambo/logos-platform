import { body, param, query } from 'express-validator';

export const createCallValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['one_on_one', 'group']).withMessage('Invalid call type'),
  body('purpose')
    .isIn(['prayer', 'bible_study', 'counseling', 'community', 'mentorship', 'general'])
    .withMessage('Invalid call purpose'),
  body('maxParticipants').optional().isInt({ min: 2 }).withMessage('Max participants must be at least 2'),
];

export const callIdValidator = [
  param('callId').isUUID().withMessage('Invalid call ID'),
];

export const updateParticipantValidator = [
  param('callId').isUUID().withMessage('Invalid call ID'),
  body('isMuted').optional().isBoolean().withMessage('isMuted must be boolean'),
  body('isVideoOff').optional().isBoolean().withMessage('isVideoOff must be boolean'),
];
