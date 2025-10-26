import { Request, Response, NextFunction } from 'express';
import aiConversationService from '../services/ai-conversation.service';
import { successResponse, errorResponse } from '../../../shared/utils/response.util';

class AIController {
  /**
   * Create a new conversation
   */
  async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { initialMessage } = req.body;

      const conversation = await aiConversationService.createConversation(userId, initialMessage);

      // If there's an initial message, send it and get response
      if (initialMessage) {
        const result = await aiConversationService.sendMessage(
          conversation.id,
          userId,
          initialMessage
        );

        return successResponse(
          res,
          'Conversation created successfully',
          {
            conversation: result.conversation,
            userMessage: result.userMessage,
            assistantMessage: result.assistantMessage,
          },
          201
        );
      }

      return successResponse(res, 'Conversation created successfully', { conversation }, 201);
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

      return successResponse(res, 'Message sent successfully', result);
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

      const conversation = await aiConversationService.getConversationById(conversationId, userId);

      return successResponse(res, 'Conversation retrieved successfully', { conversation });
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
      const { page = 1, limit = 50 } = req.query;

      const result = await aiConversationService.getConversationMessages(
        conversationId,
        userId,
        Number(page),
        Number(limit)
      );

      return successResponse(res, 'Messages retrieved successfully', result);
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

      return successResponse(res, 'Conversation archived successfully', { conversation });
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

      const result = await aiConversationService.deleteConversation(conversationId, userId);

      return successResponse(res, result.message);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Quick ask (single question)
   */
  async quickAsk(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { question } = req.body;

      const result = await aiConversationService.quickAsk(userId, question);

      return successResponse(res, 'Answer generated successfully', result);
    } catch (error: any) {
      next(error);
    }
  }
}

export default new AIController();
