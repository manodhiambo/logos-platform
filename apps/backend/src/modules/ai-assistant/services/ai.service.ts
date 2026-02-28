import { AIConversation, AIMessage, User } from '../../../database/models';
import { MessageRole } from '../../../database/models/ai-message.model';
import poeApiService from './poe-api.service';
import bibleService from '../../bible/services/bible.service';

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

    // Call AI API (tries Anthropic → Groq → POE in order)
    let responseText: string;
    try {
      const poeResponse = await poeApiService.sendMessage(content, conversationHistory);
      responseText = poeResponse.text;
    } catch (aiError: any) {
      // AI APIs unavailable — try Bible search fallback
      const bibleText = await this.tryBibleSearchFallback(content);
      if (bibleText) {
        responseText = bibleText;
      } else {
        throw aiError;
      }
    }

    // Extract Bible references
    const bibleReferences = poeApiService.extractBibleReferences(responseText);

    // Save assistant message
    const assistantMessage = await AIMessage.create({
      conversationId,
      role: MessageRole.ASSISTANT,
      content: responseText,
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

  /**
   * Detect Bible verse search intent and return results from the Bible service.
   * Used as a fallback when external AI APIs are unavailable.
   */
  private async tryBibleSearchFallback(message: string): Promise<string | null> {
    const patterns = [
      /(?:search|find|show|get|look\s+up?)\s+(?:bible\s+)?verses?\s+(?:about|on|for|regarding)?\s*(.+)/i,
      /(?:bible\s+)?verses?\s+(?:about|on|for|regarding)\s+(.+)/i,
      /what\s+does\s+(?:the\s+)?bible\s+say\s+(?:about|on|regarding)\s+(.+)/i,
      /scriptures?\s+(?:about|on|for|regarding)\s+(.+)/i,
      /search\s+bible\s+(?:verse\s+)?(?:for\s+)?(.+)/i,
    ];

    let searchTerm: string | null = null;
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        searchTerm = match[1].trim().replace(/[?!.]+$/, '');
        break;
      }
    }

    if (!searchTerm) return null;

    try {
      const results = await bibleService.searchVerses(searchTerm, 'nkjv', 1, 5);

      if (results.results.length === 0) {
        return `I searched the Bible for "${searchTerm}" but couldn't find matching verses. Try keywords like "love", "faith", "hope", "peace", "strength", "prayer", "forgiveness", "grace", or "salvation".\n\n*(Note: Full AI guidance is temporarily unavailable. Only Bible search is active right now.)*`;
      }

      const verseList = results.results
        .map(v => `📖 **${v.reference}** (${v.translation})\n"${v.text}"`)
        .join('\n\n');

      return `Here are Bible verses about "${searchTerm}":\n\n${verseList}\n\n*(Note: Full AI guidance is temporarily unavailable. Bible search is working. For deeper insights, please try again later.)*`;
    } catch {
      return null;
    }
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
