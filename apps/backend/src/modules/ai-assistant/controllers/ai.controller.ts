import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';

const aiService = new AIService();

export const createConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { title, initialMessage } = req.body;

    if (!initialMessage) {
      return res.status(400).json({
        success: false,
        error: { message: 'Initial message is required' }
      });
    }

    const conversation = await aiService.createConversation(userId, title || 'New Conversation', initialMessage);
    
    return res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: conversation
    });
  } catch (error: any) {
    console.error('Create conversation error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to create conversation' }
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message content is required' }
      });
    }

    const messages = await aiService.sendMessage(conversationId, userId, content);
    
    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: messages
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to send message' }
    });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const conversations = await aiService.getUserConversations(userId, page, limit);
    
    return res.status(200).json({
      success: true,
      message: 'Conversations retrieved successfully',
      data: conversations
    });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get conversations' }
    });
  }
};

export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const messages = await aiService.getConversationMessages(conversationId, userId, page, limit);
    
    return res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: messages
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get messages' }
    });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { conversationId } = req.params;

    await aiService.deleteConversation(conversationId, userId);
    
    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully',
      data: null
    });
  } catch (error: any) {
    console.error('Delete conversation error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to delete conversation' }
    });
  }
};

export const quickAsk = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: { message: 'Question is required' }
      });
    }

    const answer = await aiService.quickAsk(question);
    
    return res.status(200).json({
      success: true,
      message: 'Answer retrieved successfully',
      data: answer
    });
  } catch (error: any) {
    console.error('Quick ask error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get answer' }
    });
  }
};
