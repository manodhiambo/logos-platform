import { Router } from 'express';
import aiController from '../controllers/ai.controller';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  createConversationValidator,
  sendMessageValidator,
  conversationIdValidator,
  getConversationsValidator,
  quickAskValidator,
} from '../validators/ai.validator';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/ai/conversations
 * @desc    Create a new conversation
 * @access  Private
 */
router.post(
  '/conversations',
  createConversationValidator,
  validate,
  aiController.createConversation
);

/**
 * @route   GET /api/v1/ai/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get(
  '/conversations',
  getConversationsValidator,
  validate,
  aiController.getConversations
);

/**
 * @route   GET /api/v1/ai/conversations/:conversationId
 * @desc    Get conversation by ID
 * @access  Private
 */
router.get(
  '/conversations/:conversationId',
  conversationIdValidator,
  validate,
  aiController.getConversationById
);

/**
 * @route   POST /api/v1/ai/conversations/:conversationId/messages
 * @desc    Send message to conversation
 * @access  Private
 */
router.post(
  '/conversations/:conversationId/messages',
  sendMessageValidator,
  validate,
  aiController.sendMessage
);

/**
 * @route   GET /api/v1/ai/conversations/:conversationId/messages
 * @desc    Get conversation messages
 * @access  Private
 */
router.get(
  '/conversations/:conversationId/messages',
  conversationIdValidator,
  validate,
  aiController.getConversationMessages
);

/**
 * @route   PUT /api/v1/ai/conversations/:conversationId/archive
 * @desc    Archive conversation
 * @access  Private
 */
router.put(
  '/conversations/:conversationId/archive',
  conversationIdValidator,
  validate,
  aiController.archiveConversation
);

/**
 * @route   DELETE /api/v1/ai/conversations/:conversationId
 * @desc    Delete conversation
 * @access  Private
 */
router.delete(
  '/conversations/:conversationId',
  conversationIdValidator,
  validate,
  aiController.deleteConversation
);

/**
 * @route   POST /api/v1/ai/quick-ask
 * @desc    Quick ask (single question without conversation)
 * @access  Private
 */
router.post(
  '/quick-ask',
  quickAskValidator,
  validate,
  aiController.quickAsk
);

export default router;
