import apiClient from '@/lib/api-client';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: AIMessage[];
}

export interface SendMessageData {
  content: string;
}

class AIAssistantService {
  async getConversations() {
    const response = await apiClient.get('/ai/conversations');
    return response.data.data;
  }

  async getConversation(conversationId: string) {
    const response = await apiClient.get(`/ai/conversations/${conversationId}`);
    return response.data.data;
  }

  async createConversation(initialMessage?: string) {
    const response = await apiClient.post('/ai/conversations', {
      initialMessage,
    });
    return response.data.data;
  }

  async sendMessage(conversationId: string, content: string) {
    const response = await apiClient.post(
      `/ai/conversations/${conversationId}/messages`,
      { content }
    );
    return response.data.data;
  }

  async deleteConversation(conversationId: string) {
    const response = await apiClient.delete(`/ai/conversations/${conversationId}`);
    return response.data;
  }

  async quickAsk(question: string) {
    const response = await apiClient.post('/ai/quick-ask', { question });
    return response.data.data;
  }
}

export const aiAssistantService = new AIAssistantService();
