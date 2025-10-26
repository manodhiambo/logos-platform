import axios from 'axios';
import { config } from '../../../config/env.config';
import { logger } from '../../../shared/utils/logger.util';

interface PoeMessage {
  role: 'user' | 'bot';
  content: string;
}

interface PoeResponse {
  text: string;
  id?: string;
}

class PoeApiService {
  private apiKey: string;
  private baseUrl: string;
  private botName: string;

  constructor() {
    this.apiKey = config.poeApi.apiKey;
    this.baseUrl = config.poeApi.baseUrl;
    this.botName = config.poeApi.botName;
  }

  /**
   * Send a message to POE API
   */
  async sendMessage(message: string, conversationHistory: PoeMessage[] = []): Promise<PoeResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('POE API key is not configured');
      }

      // Add user context for biblical guidance
      const systemContext = `You are LOGOS, a Christian AI assistant focused on providing biblical guidance, wisdom, and spiritual support. 
      Always base your responses on Scripture, provide relevant Bible verses, and maintain a loving, grace-filled tone.
      When mentioning Bible verses, format them as: Book Chapter:Verse (e.g., John 3:16).`;

      const messages = [
        { role: 'system', content: systemContext },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'bot' ? 'assistant' : 'user',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      logger.info(`Sending message to POE API: ${message.substring(0, 50)}...`);

      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          version: '1.0',
          type: 'query',
          query: messages,
          user_id: 'logos-platform',
          conversation_id: null,
          message_id: null,
          metadata: {},
          api_key: this.apiKey,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds
        }
      );

      logger.info('POE API response received');

      return {
        text: response.data.text || response.data.response || '',
        id: response.data.id,
      };
    } catch (error: any) {
      logger.error('POE API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Invalid POE API key. Please check your configuration.');
      }

      throw new Error('Failed to get response from AI assistant. Please try again.');
    }
  }

  /**
   * Extract Bible references from text
   */
  extractBibleReferences(text: string): any[] {
    const references: any[] = [];
    
    // Regex pattern for Bible references (e.g., John 3:16, Genesis 1:1-3)
    const pattern = /\b([1-3]?\s?[A-Z][a-z]+)\s+(\d+):(\d+)(?:-(\d+))?\b/g;
    
    let match;
    while ((match = pattern.exec(text)) !== null) {
      references.push({
        book: match[1].trim(),
        chapter: parseInt(match[2]),
        verseStart: parseInt(match[3]),
        verseEnd: match[4] ? parseInt(match[4]) : parseInt(match[3]),
        reference: match[0],
      });
    }

    return references;
  }

  /**
   * Generate conversation title from first message
   */
  generateTitle(message: string): string {
    const maxLength = 50;
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength - 3) + '...';
  }
}

export default new PoeApiService();
