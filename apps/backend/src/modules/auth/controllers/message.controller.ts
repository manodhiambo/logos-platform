import { Request, Response } from 'express';
import MessageService from '../services/message.service';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = req.user?.id;
    const { receiverId, content, attachmentUrl, attachmentType } = req.body;

    if (!senderId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!content || !receiverId) {
      return res.status(400).json({ message: 'Content and receiverId are required' });
    }

    const message = await MessageService.sendMessage(
      senderId,
      receiverId,
      content,
      attachmentUrl,
      attachmentType
    );

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { otherUserId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await MessageService.getMessages(
      userId,
      otherUserId,
      page,
      limit
    );

    res.json({
      message: 'Messages retrieved successfully',
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await MessageService.getConversations(userId, page, limit);

    res.json({
      message: 'Conversations retrieved successfully',
      data: result.conversations,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { messageId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await MessageService.deleteMessage(messageId, userId);

    res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { senderId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await MessageService.markMessagesAsRead(userId, senderId);

    res.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const count = await MessageService.getUnreadCount(userId);

    res.json({
      message: 'Unread count retrieved',
      data: { count },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
