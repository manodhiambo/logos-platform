import { Router } from 'express';
import postController from '../controllers/post.controller';
import commentController from '../controllers/comment.controller';
import { authenticate, optionalAuth } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  createPostValidator,
  updatePostValidator,
  postIdValidator,
  getPostsValidator,
  addCommentValidator,
  commentIdValidator,
  updateCommentValidator,
} from '../validators/post.validator';

const router = Router();

/**
 * @route   POST /api/v1/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  createPostValidator,
  validate,
  postController.createPost
);

/**
 * @route   GET /api/v1/posts
 * @desc    Get posts feed
 * @access  Public (but can be filtered by auth user)
 */
router.get(
  '/',
  optionalAuth,
  getPostsValidator,
  validate,
  postController.getPosts
);

/**
 * @route   GET /api/v1/posts/:postId
 * @desc    Get post by ID
 * @access  Public
 */
router.get(
  '/:postId',
  optionalAuth,
  postIdValidator,
  validate,
  postController.getPostById
);

/**
 * @route   PUT /api/v1/posts/:postId
 * @desc    Update post
 * @access  Private (author only)
 */
router.put(
  '/:postId',
  authenticate,
  updatePostValidator,
  validate,
  postController.updatePost
);

/**
 * @route   DELETE /api/v1/posts/:postId
 * @desc    Delete post
 * @access  Private (author only)
 */
router.delete(
  '/:postId',
  authenticate,
  postIdValidator,
  validate,
  postController.deletePost
);

/**
 * @route   POST /api/v1/posts/:postId/like
 * @desc    Toggle like on post
 * @access  Private
 */
router.post(
  '/:postId/like',
  authenticate,
  postIdValidator,
  validate,
  postController.toggleLike
);

/**
 * @route   POST /api/v1/posts/:postId/pin
 * @desc    Pin/Unpin post (admin/moderator)
 * @access  Private
 */
router.post(
  '/:postId/pin',
  authenticate,
  postIdValidator,
  validate,
  postController.togglePin
);

/**
 * @route   GET /api/v1/posts/:postId/comments
 * @desc    Get comments for a post
 * @access  Public
 */
router.get(
  '/:postId/comments',
  optionalAuth,
  postIdValidator,
  validate,
  postController.getComments
);

/**
 * @route   POST /api/v1/posts/:postId/comments
 * @desc    Add comment to post
 * @access  Private
 */
router.post(
  '/:postId/comments',
  authenticate,
  addCommentValidator,
  validate,
  postController.addComment
);

/**
 * @route   PUT /api/v1/comments/:commentId
 * @desc    Update comment
 * @access  Private (author only)
 */
router.put(
  '/comments/:commentId',
  authenticate,
  updateCommentValidator,
  validate,
  commentController.updateComment
);

/**
 * @route   DELETE /api/v1/comments/:commentId
 * @desc    Delete comment
 * @access  Private (author only)
 */
router.delete(
  '/comments/:commentId',
  authenticate,
  commentIdValidator,
  validate,
  commentController.deleteComment
);

/**
 * @route   POST /api/v1/comments/:commentId/like
 * @desc    Toggle like on comment
 * @access  Private
 */
router.post(
  '/comments/:commentId/like',
  authenticate,
  commentIdValidator,
  validate,
  commentController.toggleLike
);

export default router;
