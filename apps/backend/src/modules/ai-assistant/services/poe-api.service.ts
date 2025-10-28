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
  private botName: string;
  private baseURL: string;

  constructor() {
    this.apiKey = config.poeApi.apiKey;
    this.botName = config.poeApi.botName || 'AIGospelAssistant';
    this.baseURL = 'https://api.poe.com/v1';
  }

  /**
   * Send a message to POE API using OpenAI-compatible format
   */
  async sendMessage(message: string, conversationHistory: PoeMessage[] = []): Promise<PoeResponse> {
    try {
      if (!this.apiKey) {
        logger.warn('POE API key not configured');
        throw new Error('POE API key is not configured');
      }

      logger.info(`Sending message to POE bot (${this.botName}): ${message.substring(0, 50)}...`);

      // Convert conversation history to OpenAI format
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role === 'bot' ? 'assistant' : 'user',
          content: msg.content,
        })),
        {
          role: 'user',
          content: message,
        }
      ];

      // Use OpenAI-compatible chat completions endpoint
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.botName,
          messages: messages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 60000, // 60 seconds
        }
      );

      logger.info('POE API response received successfully');

      // Extract response from OpenAI-compatible format
      const responseText = response.data.choices?.[0]?.message?.content || '';

      if (!responseText) {
        throw new Error('Empty response from POE API');
      }

      return {
        text: responseText,
        id: response.data.id || `poe_${Date.now()}`,
      };

    } catch (error: any) {
      logger.error('POE API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      }
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Invalid POE API key. Please verify your API key.');
      }

      if (error.response?.status === 404) {
        throw new Error(`Bot "${this.botName}" not found. Please check the bot name.`);
      }

      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error?.message || 'Bad request';
        throw new Error(`POE API error: ${errorMsg}`);
      }

      // Re-throw the original error
      throw new Error(error.message || 'Failed to get response from AI assistant');
    }
  }

  /**
   * Alternative method - not needed now that we have correct format
   */
  async sendMessageAlternative(message: string): Promise<PoeResponse> {
    return this.sendMessage(message, []);
  }

  /**
   * Extract Bible references from text
   */
  extractBibleReferences(text: string): any[] {
    const references: any[] = [];
    
    // Regex pattern for Bible references (e.g., John 3:16, Genesis 1:1-3, 1 Corinthians 13:4)
    const pattern = /\b([1-3]?\s?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(\d+):(\d+)(?:-(\d+))?\b/g;
    
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
