import { AIConversation, AIMessage, User } from '../../../database/models';
import { MessageRole } from '../../../database/models/ai-message.model';
import poeApiService from './poe-api.service';

export class AIService {
  async createConversation(userId: string, title: string, initialMessage: string) {
    const conversation = await AIConversation.create({
      userId,
      title: title || poeApiService.generateTitle(initialMessage),
      isArchived: false,
    });

    const messages = await this.sendMessage(conversation.id, userId, initialMessage);

    return {
      conversation,
      messages,
    };
  }

  async sendMessage(conversationId: string, userId: string, content: string) {
    const conversation = await AIConversation.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const userMessage = await AIMessage.create({
      conversationId,
      role: MessageRole.USER,
      content,
    });

    // Get conversation history
    const history = await AIMessage.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
      limit: 20,
    });

    // Format history for Poe
    const conversationHistory = history
      .filter(msg => msg.id !== userMessage.id)
      .map(msg => ({
        role: msg.role === MessageRole.USER ? 'user' as const : 'bot' as const,
        content: msg.content,
      }));

    // Call Poe API
    const poeResponse = await poeApiService.sendMessage(content, conversationHistory);

    // Extract Bible references
    const bibleReferences = poeApiService.extractBibleReferences(poeResponse.text);

    // Save assistant message
    const assistantMessage = await AIMessage.create({
      conversationId,
      role: MessageRole.ASSISTANT,
      content: poeResponse.text,
      bibleReferences: bibleReferences.length > 0 ? bibleReferences : null,
    });

    return {
      userMessage,
      assistantMessage,
    };
  }

  async getUserConversations(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: conversations, count: total } = await AIConversation.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
    });

    return {
      conversations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getConversationMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
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
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await AIConversation.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await AIMessage.destroy({
      where: { conversationId },
    });

    await conversation.destroy();
  }

  async quickAsk(question: string) {
    const poeResponse = await poeApiService.sendMessage(question, []);

    return {
      question,
      answer: poeResponse.text,
      bibleReferences: poeApiService.extractBibleReferences(poeResponse.text),
    };
  }
}
