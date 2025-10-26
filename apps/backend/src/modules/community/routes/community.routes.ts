import { Router } from 'express';
import communityController from '../controllers/community.controller';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  createCommunityValidator,
  updateCommunityValidator,
  communityIdValidator,
  updateMemberRoleValidator,
  getCommunitiesValidator,
} from '../validators/community.validator';

const router = Router();

/**
 * @route   POST /api/v1/communities
 * @desc    Create a new community
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  createCommunityValidator,
  validate,
  communityController.createCommunity
);

/**
 * @route   GET /api/v1/communities
 * @desc    Get all communities (with filters and pagination)
 * @access  Public (Private for 'mycommunities')
 */
router.get(
  '/',
  getCommunitiesValidator,
  validate,
  communityController.getCommunities
);

/**
 * @route   GET /api/v1/communities/:communityId
 * @desc    Get community by ID
 * @access  Public
 */
router.get(
  '/:communityId',
  communityIdValidator,
  validate,
  communityController.getCommunityById
);

/**
 * @route   PUT /api/v1/communities/:communityId
 * @desc    Update community (admin only)
 * @access  Private
 */
router.put(
  '/:communityId',
  authenticate,
  updateCommunityValidator,
  validate,
  communityController.updateCommunity
);

/**
 * @route   DELETE /api/v1/communities/:communityId
 * @desc    Delete community (admin only)
 * @access  Private
 */
router.delete(
  '/:communityId',
  authenticate,
  communityIdValidator,
  validate,
  communityController.deleteCommunity
);

/**
 * @route   POST /api/v1/communities/:communityId/join
 * @desc    Join a community
 * @access  Private
 */
router.post(
  '/:communityId/join',
  authenticate,
  communityIdValidator,
  validate,
  communityController.joinCommunity
);

/**
 * @route   POST /api/v1/communities/:communityId/leave
 * @desc    Leave a community
 * @access  Private
 */
router.post(
  '/:communityId/leave',
  authenticate,
  communityIdValidator,
  validate,
  communityController.leaveCommunity
);

/**
 * @route   GET /api/v1/communities/:communityId/members
 * @desc    Get community members
 * @access  Public
 */
router.get(
  '/:communityId/members',
  communityIdValidator,
  validate,
  communityController.getCommunityMembers
);

/**
 * @route   PUT /api/v1/communities/:communityId/members/:memberId/role
 * @desc    Update member role (admin only)
 * @access  Private
 */
router.put(
  '/:communityId/members/:memberId/role',
  authenticate,
  updateMemberRoleValidator,
  validate,
  communityController.updateMemberRole
);

export default router;
