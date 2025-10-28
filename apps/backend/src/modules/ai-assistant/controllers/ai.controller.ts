import { Request, Response, NextFunction } from 'express';
import aiConversationService from '../services/ai-conversation.service';
import { successResponse } from '../../../shared/utils/response.util';

class AIController {
  /**
   * Create a new conversation
   */
  async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { initialMessage } = req.body;

      const conversation = await aiConversationService.createConversation(userId, initialMessage);

      return successResponse(res, 'Conversation created successfully', {
        conversation,
      }, 201);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Send message to conversation
   */
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;
      const { content } = req.body;

      const result = await aiConversationService.sendMessage(conversationId, userId, content);

      return successResponse(res, 'Message sent successfully', {
        conversation: result.conversation,
        messages: result.messages,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get user's conversations
   */
  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20, archived = false } = req.query;

      const result = await aiConversationService.getUserConversations(
        userId,
        Number(page),
        Number(limit),
        archived === 'true'
      );

      return successResponse(res, 'Conversations retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      const result = await aiConversationService.getConversationById(conversationId, userId);

      return successResponse(res, 'Conversation retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      const result = await aiConversationService.getConversationById(conversationId, userId);

      return successResponse(res, 'Messages retrieved successfully', {
        messages: result.messages,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Archive conversation
   */
  async archiveConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      const conversation = await aiConversationService.archiveConversation(conversationId, userId);

      return successResponse(res, 'Conversation archived successfully', {
        conversation,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      await aiConversationService.deleteConversation(conversationId, userId);

      return successResponse(res, 'Conversation deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Quick ask - single question without creating a conversation
   */
  async quickAsk(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { question } = req.body;

      // Create a temporary conversation for quick ask
      const conversation = await aiConversationService.createConversation(userId, question);
      const result = await aiConversationService.sendMessage(conversation.id, userId, question);

      return successResponse(res, 'Response received successfully', {
        answer: result.messages[result.messages.length - 1]?.content || '',
        messages: result.messages,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new AIController();
