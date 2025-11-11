import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import * as friendshipController from '../controllers/friendship.controller';

const router = Router();

// Friendship routes
router.post('/friend-request', authenticate, friendshipController.sendFriendRequest);
router.put('/friend-request/:friendshipId/accept', authenticate, friendshipController.acceptFriendRequest);
router.put('/friend-request/:friendshipId/reject', authenticate, friendshipController.rejectFriendRequest);
router.delete('/friend/:friendshipId', authenticate, friendshipController.removeFriend);
router.get('/friends', authenticate, friendshipController.getFriends);
router.get('/friend-requests/pending', authenticate, friendshipController.getPendingRequests);
router.get('/friend-requests/sent', authenticate, friendshipController.getSentRequests);
router.get('/friendship-status/:otherUserId', authenticate, friendshipController.checkFriendshipStatus);

// Follow routes
router.post('/follow', authenticate, friendshipController.followUser);
router.delete('/follow/:userId', authenticate, friendshipController.unfollowUser);
router.get('/followers/:userId', authenticate, friendshipController.getFollowers);
router.get('/following/:userId', authenticate, friendshipController.getFollowing);
router.get('/is-following/:userId', authenticate, friendshipController.isFollowing);

// User search
router.get('/users/search', authenticate, friendshipController.searchUsers);

export default router;
