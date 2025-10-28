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
        role: (msg.role === 'assistant' ? 'bot' : 'user') as 'user' | 'bot',
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
      let aiResponse;
      try {
        aiResponse = await poeApiService.sendMessage(content, conversationHistory);
      } catch (primaryError) {
        // Try alternative endpoint
        console.log('Primary endpoint failed, trying alternative...');
        aiResponse = await poeApiService.sendMessageAlternative(content);
      }

      // Extract Bible references
      const bibleReferences = poeApiService.extractBibleReferences(aiResponse.text);

      // Save AI response with role 'assistant'
      const botMessage = await AIMessage.create({
        conversationId,
        role: 'assistant',
        content: aiResponse.text,
        bibleReferences: bibleReferences.length > 0 ? bibleReferences : [],
        metadata: {},
      });

      // Update conversation title if this is the first message
      if (!conversation.title || conversation.title === 'New Conversation') {
        await conversation.update({
          title: poeApiService.generateTitle(content),
        });
      }

      // Return all messages
      const allMessages = await AIMessage.findAll({
        where: { conversationId },
        order: [['createdAt', 'ASC']],
      });

      return {
        conversation,
        messages: allMessages,
      };
    } catch (error: any) {
      // Delete the user message if AI response failed
      await userMessage.destroy();
      throw error;
    }
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(userId: string, page = 1, limit = 20, archived = false) {
    const offset = (page - 1) * limit;

    const { rows: conversations, count } = await AIConversation.findAndCountAll({
      where: { userId, isArchived: archived },
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
    });

    return {
      conversations,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
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

    const messages = await AIMessage.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
    });

    return {
      conversation,
      messages,
    };
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

    // Delete all messages
    await AIMessage.destroy({
      where: { conversationId },
    });

    // Delete conversation
    await conversation.destroy();

    return { message: 'Conversation deleted successfully' };
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
}

export default new AIConversationService();
