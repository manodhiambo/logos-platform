import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { sendSuccess, sendError } from '../../../shared/utils/response.util';

const aiService = new AIService();

export const createConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { title, initialMessage } = req.body;

    if (!initialMessage) {
      return sendError(res, 'Initial message is required', 400);
    }

    const conversation = await aiService.createConversation(userId, title || 'New Conversation', initialMessage);
    sendSuccess(res, conversation, 'Conversation created successfully', 201);
  } catch (error: any) {
    console.error('Create conversation error:', error);
    sendError(res, error.message || 'Failed to create conversation', 500);
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content) {
      return sendError(res, 'Message content is required', 400);
    }

    const messages = await aiService.sendMessage(conversationId, userId, content);
    sendSuccess(res, messages, 'Message sent successfully', 201);
  } catch (error: any) {
    console.error('Send message error:', error);
    sendError(res, error.message || 'Failed to send message', 500);
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const conversations = await aiService.getUserConversations(userId, page, limit);
    sendSuccess(res, conversations, 'Conversations retrieved successfully');
  } catch (error: any) {
    console.error('Get conversations error:', error);
    sendError(res, error.message || 'Failed to get conversations', 500);
  }
};

export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const messages = await aiService.getConversationMessages(conversationId, userId, page, limit);
    sendSuccess(res, messages, 'Messages retrieved successfully');
  } catch (error: any) {
    console.error('Get messages error:', error);
    sendError(res, error.message || 'Failed to get messages', 500);
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { conversationId } = req.params;

    await aiService.deleteConversation(conversationId, userId);
    sendSuccess(res, null, 'Conversation deleted successfully');
  } catch (error: any) {
    console.error('Delete conversation error:', error);
    sendError(res, error.message || 'Failed to delete conversation', 500);
  }
};

export const quickAsk = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    if (!question) {
      return sendError(res, 'Question is required', 400);
    }

    const answer = await aiService.quickAsk(question);
    sendSuccess(res, answer, 'Answer retrieved successfully');
  } catch (error: any) {
    console.error('Quick ask error:', error);
    sendError(res, error.message || 'Failed to get answer', 500);
  }
};
