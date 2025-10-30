import { Router } from 'express';
import {
  createConversation,
  sendMessage,
  getConversations,
  getConversationMessages,
  deleteConversation,
  quickAsk,
} from '../controllers/ai.controller';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  createConversationValidator,
  sendMessageValidator,
  quickAskValidator,
} from '../validators/ai.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create new conversation
router.post('/conversations', createConversationValidator, validate, createConversation);

// Get user's conversations
router.get('/conversations', getConversations);

// Get conversation messages
router.get('/conversations/:conversationId/messages', getConversationMessages);

// Send message in conversation
router.post('/conversations/:conversationId/messages', sendMessageValidator, validate, sendMessage);

// Delete conversation
router.delete('/conversations/:conversationId', deleteConversation);

// Quick ask (single question without conversation)
router.post('/ask-quick', quickAskValidator, validate, quickAsk);

export default router;
