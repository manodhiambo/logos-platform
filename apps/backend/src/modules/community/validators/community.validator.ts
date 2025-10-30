import { body, param, query } from 'express-validator';

export const createCommunityValidator = [
  body('name').notEmpty().isString().withMessage('Name is required'),
  body('description').optional().isString(),
  body('category').notEmpty().isString().withMessage('Category is required'),
  body('privacyLevel').optional().isIn(['public', 'private']).withMessage('Invalid privacy level'),
  body('avatarUrl').optional().isURL().withMessage('Invalid avatar URL'),
  body('avatar_url').optional().isURL().withMessage('Invalid avatar URL'),
  body('coverImageUrl').optional().isURL().withMessage('Invalid cover image URL'),
  body('cover_image_url').optional().isURL().withMessage('Invalid cover image URL'),
];

export const updateCommunityValidator = [
  param('communityId').isUUID().withMessage('Invalid community ID'),
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('category').optional().isString(),
  body('privacyLevel').optional().isIn(['public', 'private']),
];

export const communityIdValidator = [
  param('communityId').isUUID().withMessage('Invalid community ID'),
];

export const updateMemberRoleValidator = [
  param('communityId').isUUID().withMessage('Invalid community ID'),
  param('memberId').isUUID().withMessage('Invalid member ID'),
  body('role').isIn(['admin', 'moderator', 'member']).withMessage('Invalid role'),
];

export const getCommunitiesValidator = [
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];
