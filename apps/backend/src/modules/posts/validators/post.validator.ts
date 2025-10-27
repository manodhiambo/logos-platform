import { body, param, query } from 'express-validator';

export const createPostValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Post content must be between 1 and 5000 characters'),
  body('communityId')
    .optional()
    .isUUID()
    .withMessage('Invalid community ID'),
  body('postType')
    .optional()
    .isIn(['discussion', 'prayer_request', 'testimony', 'question'])
    .withMessage('Invalid post type'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
];

export const updatePostValidator = [
  param('postId')
    .isUUID()
    .withMessage('Invalid post ID'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Post content must be between 1 and 5000 characters'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
];

export const postIdValidator = [
  param('postId')
    .isUUID()
    .withMessage('Invalid post ID'),
];

export const getPostsValidator = [
  query('communityId')
    .optional()
    .isUUID()
    .withMessage('Invalid community ID'),
  query('postType')
    .optional()
    .isIn(['discussion', 'prayer_request', 'testimony', 'question'])
    .withMessage('Invalid post type'),
  query('authorId')
    .optional()
    .isUUID()
    .withMessage('Invalid author ID'),
  query('sort')
    .optional()
    .isIn(['recent', 'popular'])
    .withMessage('Sort must be either recent or popular'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const addCommentValidator = [
  param('postId')
    .isUUID()
    .withMessage('Invalid post ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters'),
  body('parentCommentId')
    .optional()
    .isUUID()
    .withMessage('Invalid parent comment ID'),
];

export const commentIdValidator = [
  param('commentId')
    .isUUID()
    .withMessage('Invalid comment ID'),
];

export const updateCommentValidator = [
  param('commentId')
    .isUUID()
    .withMessage('Invalid comment ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters'),
];
