import { Router } from 'express';
import * as communityController from '../controllers/community.controller';
import { authenticate } from '../../../shared/middlewares/auth.middleware';

const router = Router();

// Community routes
router.post('/', authenticate, communityController.createCommunity);
router.get('/', communityController.getCommunities);
router.get('/my-communities', authenticate, communityController.getMyCommunities);
router.get('/:communityId', communityController.getCommunityById);
router.put('/:communityId', authenticate, communityController.updateCommunity);
router.delete('/:communityId', authenticate, communityController.deleteCommunity);

// Member routes
router.post('/:communityId/join', authenticate, communityController.joinCommunity);
router.delete('/:communityId/leave', authenticate, communityController.leaveCommunity);
router.get('/:communityId/members', communityController.getCommunityMembers);

export default router;
