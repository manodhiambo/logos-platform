import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import * as groupChatController from '../controllers/group-chat.controller';

const router = Router();

// Group routes
router.post('/', authenticate, groupChatController.createGroup);
router.get('/', authenticate, groupChatController.getUserGroups);
router.get('/:groupId', authenticate, groupChatController.getGroupById);
router.post('/:groupId/members', authenticate, groupChatController.addMember);
router.delete('/:groupId/members/:memberId', authenticate, groupChatController.removeMember);
router.get('/:groupId/members', authenticate, groupChatController.getGroupMembers);
router.get('/:groupId/messages', authenticate, groupChatController.getGroupMessages);
router.put('/:groupId', authenticate, groupChatController.updateGroup);
router.delete('/:groupId', authenticate, groupChatController.deleteGroup);

export default router;
