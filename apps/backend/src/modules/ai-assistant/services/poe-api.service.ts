import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
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

// Correct Poe bot handles (case-sensitive, must match poe.com/<handle>)
const POE_BOTS = [
  'Claude-3-Haiku',
  'Claude-3-5-Haiku',
  'GPT-4o-Mini',
  'Claude-Instant',
  'GPT-3.5-Turbo',
];

class PoeApiService {
  private poeApiKey: string;
  private anthropicApiKey: string;
  private primaryBotName: string;

  constructor() {
    this.poeApiKey = config.poeApi.apiKey;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';
    // Always start with Claude-3-Haiku regardless of env var override
    this.primaryBotName = 'Claude-3-Haiku';
  }

  /** Try Anthropic SDK directly — most reliable */
  private async callAnthropic(message: string, history: PoeMessage[]): Promise<string> {
    if (!this.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not set');
    }

    const client = new Anthropic({ apiKey: this.anthropicApiKey });

    const historyMessages = history.map(msg => ({
      role: (msg.role === 'bot' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: msg.content,
    }));

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [...historyMessages, { role: 'user', content: message }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    if (!text) throw new Error('Empty Anthropic response');
    return text;
  }

  /** Try Poe OpenAI-compatible API */
  private async callPoeApi(botName: string, messages: any[]): Promise<string> {
    const response = await axios.post(
      'https://api.poe.com/v1/chat/completions',
      { model: botName, messages },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.poeApiKey}`,
        },
        timeout: 60000,
      }
    );

    const text = response.data.choices?.[0]?.message?.content || '';
    if (!text) throw new Error('Empty POE response');
    return text;
  }

  async sendMessage(message: string, conversationHistory: PoeMessage[] = []): Promise<PoeResponse> {
    // 1. Try Anthropic first if key is available (most reliable)
    if (this.anthropicApiKey) {
      try {
        logger.info('Using Anthropic API for AI response');
        const text = await this.callAnthropic(message, conversationHistory);
        return { text, id: `anthropic_${Date.now()}` };
      } catch (error: any) {
        logger.error('Anthropic API failed:', error.message);
        // Fall through to POE
      }
    }

    // 2. Try POE with multiple bot names
    if (this.poeApiKey) {
      const botsToTry = [this.primaryBotName, ...POE_BOTS.filter(b => b !== this.primaryBotName)];

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'bot' ? 'assistant' : 'user',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      for (const botName of botsToTry) {
        try {
          logger.info(`Trying POE bot: ${botName}`);
          const text = await this.callPoeApi(botName, messages);
          logger.info(`POE success with bot: ${botName}`);
          return { text, id: `poe_${Date.now()}` };
        } catch (error: any) {
          const status = error.response?.status;
          const errBody = error.response?.data;

          if (status === 401 || status === 403) {
            logger.error(`POE auth failed (${status}):`, errBody);
            break; // Auth errors — don't retry with other bots
          }
          if (status === 429) {
            logger.warn('POE rate limited');
            break;
          }
          logger.warn(`POE bot "${botName}" failed (${status}): ${error.message}`);
          // Continue to next bot for 404, 400, network errors
        }
      }
    }

    // 3. Both failed — throw helpful error
    const hasKeys = this.anthropicApiKey || this.poeApiKey;
    if (!hasKeys) {
      throw new Error('AI service is not configured. Set ANTHROPIC_API_KEY in environment variables.');
    }
    throw new Error('AI assistant is temporarily unavailable. Please try again later.');
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
    return message.length <= 50 ? message : message.substring(0, 47) + '...';
  }
}

export default new PoeApiService();
