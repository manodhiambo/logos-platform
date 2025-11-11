import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import * as messageController from '../controllers/message.controller';

const router = Router();

// Message routes
router.post('/send', authenticate, messageController.sendMessage);
router.get('/conversations', authenticate, messageController.getConversations);
router.get('/conversation/:otherUserId', authenticate, messageController.getMessages);
router.delete('/:messageId', authenticate, messageController.deleteMessage);
router.put('/read/:senderId', authenticate, messageController.markAsRead);
router.get('/unread-count', authenticate, messageController.getUnreadCount);

export default router;
