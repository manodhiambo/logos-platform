import { body, param, query } from 'express-validator';

export const createCommunityValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Community name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Community name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['bible_study', 'prayer_group', 'discipleship', 'youth', 'general'])
    .withMessage('Invalid category'),
  body('privacyLevel')
    .optional()
    .isIn(['public', 'private', 'invite_only'])
    .withMessage('Invalid privacy level'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
  body('coverImageUrl')
    .optional()
    .isURL()
    .withMessage('Cover image URL must be a valid URL'),
];

export const updateCommunityValidator = [
  param('communityId')
    .isUUID()
    .withMessage('Invalid community ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Community name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['bible_study', 'prayer_group', 'discipleship', 'youth', 'general'])
    .withMessage('Invalid category'),
  body('privacyLevel')
    .optional()
    .isIn(['public', 'private', 'invite_only'])
    .withMessage('Invalid privacy level'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
  body('coverImageUrl')
    .optional()
    .isURL()
    .withMessage('Cover image URL must be a valid URL'),
];

export const communityIdValidator = [
  param('communityId')
    .isUUID()
    .withMessage('Invalid community ID'),
];

export const updateMemberRoleValidator = [
  param('communityId')
    .isUUID()
    .withMessage('Invalid community ID'),
  param('memberId')
    .isUUID()
    .withMessage('Invalid member ID'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'moderator', 'member'])
    .withMessage('Invalid role'),
];

export const getCommunitiesValidator = [
  query('category')
    .optional()
    .isIn(['bible_study', 'prayer_group', 'discipleship', 'youth', 'general'])
    .withMessage('Invalid category'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
