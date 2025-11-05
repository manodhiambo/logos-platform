import { AIConversation, AIMessage, User } from '../../../database/models';
import { MessageRole } from '../../../database/models/ai-message.model';
import Anthropic from '@anthropic-ai/sdk';

export class AIService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async createConversation(userId: string, title: string, initialMessage: string) {
    const conversation = await AIConversation.create({
      userId,
      title,
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

    const history = await AIMessage.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
      limit: 20,
    });

    const messages = history
      .filter(msg => msg.id !== userMessage.id)
      .map(msg => ({
        role: msg.role === MessageRole.USER ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

    messages.push({
      role: 'user' as const,
      content,
    });

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages,
      system: 'You are a helpful Christian AI assistant for the LOGOS platform. Provide biblical wisdom, prayer support, and spiritual guidance while being respectful and compassionate.',
    });

    const assistantContent = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, but I encountered an error generating a response.';

    const assistantMessage = await AIMessage.create({
      conversationId,
      role: MessageRole.ASSISTANT,
      content: assistantContent,
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
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
      system: 'You are a helpful Christian AI assistant for the LOGOS platform. Provide biblical wisdom, prayer support, and spiritual guidance while being respectful and compassionate.',
    });

    const answer = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, but I encountered an error generating a response.';

    return {
      question,
      answer,
    };
  }
}
