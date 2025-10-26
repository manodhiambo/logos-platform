import AIConversation from '../models/AIConversation.model';
import AIMessage from '../models/AIMessage.model';
import User from '../../../database/models/user.model';
import poeApiService from './poe-api.service';
import { Op } from 'sequelize';

class AIConversationService {
  /**
   * Create a new conversation
   */
  async createConversation(userId: string, initialMessage?: string) {
    const title = initialMessage 
      ? poeApiService.generateTitle(initialMessage)
      : 'New Conversation';

    const conversation = await AIConversation.create({
      userId,
      title,
      conversationContext: {
        userSpirit: 'seeking',
        topics: [],
      },
    });

    return conversation;
  }

  /**
   * Send message and get AI response
   */
  async sendMessage(conversationId: string, userId: string, content: string) {
    // Find conversation
    const conversation = await AIConversation.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get conversation history (last 10 messages for context)
    const previousMessages = await AIMessage.findAll({
      where: { conversationId },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    const conversationHistory = previousMessages
      .reverse()
      .map(msg => ({
        role: msg.role === 'user' ? ('user' as const) : ('bot' as const),
        content: msg.content,
      }));

    // Save user message
    const userMessage = await AIMessage.create({
      conversationId,
      role: 'user',
      content,
      bibleReferences: [],
      metadata: {},
    });

    try {
      // Get AI response from POE
      const aiResponse = await poeApiService.sendMessage(content, conversationHistory);

      // Extract Bible references from response
      const bibleReferences = poeApiService.extractBibleReferences(aiResponse.text);

      // Save assistant message
      const assistantMessage = await AIMessage.create({
        conversationId,
        role: 'assistant',
        content: aiResponse.text,
        bibleReferences,
        metadata: {
          poeResponseId: aiResponse.id,
        },
      });

      // Update conversation title if it's the first message
      if (!conversation.title || conversation.title === 'New Conversation') {
        await conversation.update({
          title: poeApiService.generateTitle(content),
        });
      }

      // Update conversation timestamp
      await conversation.update({ updatedAt: new Date() });

      return {
        userMessage,
        assistantMessage,
        conversation,
      };
    } catch (error: any) {
      // Delete user message if AI response fails
      await userMessage.destroy();
      throw error;
    }
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(userId: string, page: number = 1, limit: number = 20, archived: boolean = false) {
    const offset = (page - 1) * limit;

    const { rows: conversations, count: total } = await AIConversation.findAndCountAll({
      where: {
        userId,
        isArchived: archived,
      },
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: AIMessage,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          attributes: ['content', 'createdAt'],
        },
      ],
    });

    // Get message count for each conversation
    const conversationsWithCount = await Promise.all(
      conversations.map(async (conv) => {
        const messageCount = await AIMessage.count({
          where: { conversationId: conv.id },
        });

        return {
          ...conv.toJSON(),
          messageCount,
          lastMessage: (conv as any).messages?.[0] || null,
        };
      })
    );

    return {
      conversations: conversationsWithCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalConversations: total,
        limit,
      },
    };
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
    // Verify conversation belongs to user
    const conversation = await AIConversation.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const offset = (page - 1) * limit;

    const { rows: messages, count: total } = await AIMessage.findAndCountAll({
      where: { conversationId },
      limit,
      offset,
      order: [['createdAt', 'ASC']],
    });

    return {
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        limit,
      },
    };
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(conversationId: string, userId: string) {
    const conversation = await AIConversation.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId: string, userId: string) {
    const conversation = await AIConversation.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await conversation.update({ isArchived: true });

    return conversation;
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await AIConversation.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await conversation.destroy();

    return { message: 'Conversation deleted successfully' };
  }

  /**
   * Quick ask (single question without conversation)
   */
  async quickAsk(userId: string, question: string) {
    const aiResponse = await poeApiService.sendMessage(question, []);
    const bibleReferences = poeApiService.extractBibleReferences(aiResponse.text);

    return {
      question,
      answer: aiResponse.text,
      bibleReferences,
    };
  }
}

export default new AIConversationService();
