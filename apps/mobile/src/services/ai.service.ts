import apiClient from './api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

class AIService {
  async createConversation(message: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    const response = await apiClient.post('/ai-assistant/conversations', { message });
    const data = response.data.data;
    const conversation = data.conversation;
    const messages: Message[] = [];
    if (data.messages?.userMessage) messages.push(data.messages.userMessage);
    if (data.messages?.assistantMessage) messages.push(data.messages.assistantMessage);
    return { conversation, messages };
  }

  async sendMessage(conversationId: string, message: string): Promise<Message[]> {
    const response = await apiClient.post(`/ai-assistant/conversations/${conversationId}/messages`, { message });
    const data = response.data.data;
    const messages: Message[] = [];
    if (data.userMessage) messages.push(data.userMessage);
    if (data.assistantMessage) messages.push(data.assistantMessage);
    return messages;
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get('/ai-assistant/conversations');
    return response.data.data?.conversations || [];
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiClient.get(`/ai-assistant/conversations/${conversationId}/messages`);
    return response.data.data?.messages || [];
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/ai-assistant/conversations/${conversationId}`);
  }
}

export default new AIService();
