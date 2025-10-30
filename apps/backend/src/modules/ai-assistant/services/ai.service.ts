import axios from 'axios';
import AIConversation from '../models/AIConversation.model';
import AIMessage from '../models/AIMessage.model';

export class AIService {
  private poeApiKey: string;
  private poeApiUrl: string;

  constructor() {
    this.poeApiKey = process.env.POE_API_KEY || '';
    this.poeApiUrl = 'https://api.poe.com/v1';
  }

  async createConversation(userId: string, title: string, initialMessage: string) {
    try {
      // Create conversation in database
      const conversation = await AIConversation.create({
        userId: userId,
        title: title.substring(0, 100),
        conversationContext: {},
        poeConversationId: undefined,
        isArchived: false,
      });

      // Create user message
      const userMessage = await AIMessage.create({
        conversationId: conversation.id,
        role: 'user',
        content: initialMessage,
        bibleReferences: [],
        metadata: {},
      });

      // Get AI response
      let assistantMessage;
      try {
        const aiResponse = await this.callPOEAPI(initialMessage);
        assistantMessage = await AIMessage.create({
          conversationId: conversation.id,
          role: 'assistant',
          content: aiResponse.content,
          bibleReferences: aiResponse.bibleReferences || [],
          metadata: {},
        });
      } catch (aiError) {
        console.error('POE API error:', aiError);
        // Fallback response
        assistantMessage = await AIMessage.create({
          conversationId: conversation.id,
          role: 'assistant',
          content: "I'm here to help you explore God's Word and grow in your faith. The Bible teaches us that God loves us deeply and has a wonderful plan for our lives. How can I assist you in your spiritual journey today?",
          bibleReferences: [{
            book: 'John',
            chapter: 3,
            verses: [16],
            translation: 'NKJV',
            text: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.'
          }],
          metadata: { fallback: true },
        });
      }

      return {
        conversation: {
          id: conversation.id,
          userId: conversation.userId,
          title: conversation.title,
          createdAt: conversation.createdAt,
        },
        firstMessage: assistantMessage,
      };
    } catch (error) {
      console.error('Create conversation error:', error);
      throw new Error('Failed to create conversation');
    }
  }

  async sendMessage(conversationId: string, userId: string, content: string) {
    try {
      // Verify conversation belongs to user
      const conversation = await AIConversation.findOne({
        where: { id: conversationId, userId: userId }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Create user message
      const userMessage = await AIMessage.create({
        conversationId: conversationId,
        role: 'user',
        content,
        bibleReferences: [],
        metadata: {},
      });

      // Get AI response
      let assistantMessage;
      try {
        const aiResponse = await this.callPOEAPI(content);
        assistantMessage = await AIMessage.create({
          conversationId: conversationId,
          role: 'assistant',
          content: aiResponse.content,
          bibleReferences: aiResponse.bibleReferences || [],
          metadata: {},
        });
      } catch (aiError) {
        console.error('POE API error:', aiError);
        // Fallback response
        assistantMessage = await AIMessage.create({
          conversationId: conversationId,
          role: 'assistant',
          content: "I apologize, but I'm having trouble connecting right now. However, I'd love to help you explore the Bible. Could you share more about what you're seeking guidance on?",
          bibleReferences: [],
          metadata: { fallback: true },
        });
      }

      return {
        userMessage,
        assistantMessage,
      };
    } catch (error) {
      console.error('Send message error:', error);
      throw new Error('Failed to send message');
    }
  }

  async getUserConversations(userId: string, page: number, limit: number) {
    try {
      const offset = (page - 1) * limit;

      const { rows: conversations, count } = await AIConversation.findAndCountAll({
        where: { userId: userId, isArchived: false },
        order: [['updatedAt', 'DESC']],
        limit,
        offset,
      });

      return {
        conversations: await Promise.all(conversations.map(async (conv) => {
          const lastMessage = await AIMessage.findOne({
            where: { conversationId: conv.id },
            order: [['createdAt', 'DESC']],
          });

          const messageCount = await AIMessage.count({
            where: { conversationId: conv.id }
          });

          return {
            id: conv.id,
            title: conv.title,
            lastMessage: lastMessage ? {
              content: lastMessage.content.substring(0, 100),
              createdAt: lastMessage.createdAt,
            } : null,
            messageCount,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
          };
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalConversations: count,
          limit,
        },
      };
    } catch (error) {
      console.error('Get conversations error:', error);
      throw new Error('Failed to get conversations');
    }
  }

  async getConversationMessages(conversationId: string, userId: string, page: number, limit: number) {
    try {
      // Verify conversation belongs to user
      const conversation = await AIConversation.findOne({
        where: { id: conversationId, userId: userId }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const offset = (page - 1) * limit;

      const { rows: messages, count } = await AIMessage.findAndCountAll({
        where: { conversationId: conversationId },
        order: [['createdAt', 'ASC']],
        limit,
        offset,
      });

      return {
        messages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalMessages: count,
          limit,
        },
      };
    } catch (error) {
      console.error('Get messages error:', error);
      throw new Error('Failed to get messages');
    }
  }

  async deleteConversation(conversationId: string, userId: string) {
    try {
      const conversation = await AIConversation.findOne({
        where: { id: conversationId, userId: userId }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      await conversation.update({ isArchived: true });
    } catch (error) {
      console.error('Delete conversation error:', error);
      throw new Error('Failed to delete conversation');
    }
  }

  async quickAsk(question: string) {
    try {
      const aiResponse = await this.callPOEAPI(question);
      return {
        answer: aiResponse.content,
        bibleReferences: aiResponse.bibleReferences || [],
      };
    } catch (error) {
      console.error('Quick ask error:', error);
      return {
        answer: "The Bible is full of wisdom and guidance. While I'm having trouble connecting right now, I encourage you to explore God's Word directly. Consider starting with John 3:16 or Psalm 23.",
        bibleReferences: [],
      };
    }
  }

  private async callPOEAPI(message: string) {
    try {
      if (!this.poeApiKey) {
        throw new Error('POE API key not configured');
      }

      const response = await axios.post(
        `${this.poeApiUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are LOGOS, a helpful Christian AI assistant. Provide biblical guidance and wisdom. When relevant, reference Bible verses.'
            },
            {
              role: 'user',
              content: message
            }
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.poeApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return {
        content: response.data.choices[0].message.content,
        bibleReferences: this.extractBibleReferences(response.data.choices[0].message.content),
      };
    } catch (error: any) {
      console.error('POE API call error:', error.response?.data || error.message);
      throw error;
    }
  }

  private extractBibleReferences(text: string): any[] {
    // Simple regex to extract Bible references like "John 3:16"
    const regex = /(\d?\s?[A-Z][a-z]+)\s+(\d+):(\d+)/g;
    const references: any[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      references.push({
        book: match[1].trim(),
        chapter: parseInt(match[2]),
        verses: [parseInt(match[3])],
        translation: 'NKJV',
        text: '',
      });
    }

    return references;
  }
}
