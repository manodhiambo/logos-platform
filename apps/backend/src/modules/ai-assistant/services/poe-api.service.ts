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

const SYSTEM_PROMPT = `You are LOGOS AI, a knowledgeable and compassionate biblical and theological assistant for the LOGOS Platform — a Christian faith community app.

Your role is to:
- Provide accurate, scripture-backed answers about the Bible, theology, and Christian living
- Share relevant Bible verses (e.g., John 3:16, Romans 8:28) to support your answers
- Offer spiritual encouragement grounded in the Word of God
- Help users grow in their faith, prayer life, and understanding of Scripture
- Maintain a warm, respectful, and Christ-centered tone

Always cite specific Bible references when relevant. If a question is outside your biblical/theological scope, gently redirect while remaining helpful.`;

// Fallback bot order - tries primary bot first, then these
const FALLBACK_BOTS = ['Claude-3-Haiku', 'GPT-3.5-Turbo', 'Claude-instant'];

class PoeApiService {
  private apiKey: string;
  private primaryBotName: string;
  private baseURL: string;

  constructor() {
    this.apiKey = config.poeApi.apiKey;
    this.primaryBotName = config.poeApi.botName || 'Claude-3-Haiku';
    this.baseURL = 'https://api.poe.com/v1';
  }

  private async callPoeApi(botName: string, messages: any[]): Promise<string> {
    const response = await axios.post(
      `${this.baseURL}/chat/completions`,
      {
        model: botName,
        messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 60000,
      }
    );

    const text = response.data.choices?.[0]?.message?.content || '';
    if (!text) {
      throw new Error('Empty response from POE API');
    }
    return text;
  }

  async sendMessage(message: string, conversationHistory: PoeMessage[] = []): Promise<PoeResponse> {
    if (!this.apiKey) {
      logger.warn('POE API key not configured');
      throw new Error('AI service is not configured. Please contact support.');
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Try primary bot first, then fallbacks
    const botsToTry = [this.primaryBotName, ...FALLBACK_BOTS.filter(b => b !== this.primaryBotName)];

    for (const botName of botsToTry) {
      try {
        logger.info(`Trying POE bot: ${botName}`);
        const text = await this.callPoeApi(botName, messages);
        logger.info(`POE response received from bot: ${botName}`);
        return { text, id: `poe_${Date.now()}` };
      } catch (error: any) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          // Auth error - no point trying other bots
          logger.error('POE API authentication failed');
          throw new Error('AI service authentication failed. Please contact support.');
        }

        if (status === 429) {
          throw new Error('AI service is busy. Please try again in a moment.');
        }

        if (status === 404 || status === 400) {
          // Bot not found - try next one
          logger.warn(`Bot "${botName}" not available, trying next...`);
          continue;
        }

        logger.error(`POE API error with bot ${botName}:`, error.message);
        // Try next bot on generic errors too
        continue;
      }
    }

    throw new Error('AI assistant is temporarily unavailable. Please try again later.');
  }

  async sendMessageAlternative(message: string): Promise<PoeResponse> {
    return this.sendMessage(message, []);
  }

  extractBibleReferences(text: string): any[] {
    const references: any[] = [];
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

  generateTitle(message: string): string {
    const maxLength = 50;
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength - 3) + '...';
  }
}

export default new PoeApiService();
