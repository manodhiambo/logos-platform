import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import {
  createConversation,
  sendMessage,
  getUserConversations,
  getConversationMessages,
  deleteConversation,
  quickAsk,
} from '../controllers/ai.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Conversation management
router.post('/conversations', createConversation);
router.get('/conversations', getUserConversations);
router.get('/conversations/:conversationId/messages', getConversationMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.delete('/conversations/:conversationId', deleteConversation);

// Quick ask (single question without conversation)
router.post('/ask-quick', quickAsk);

export default router;
