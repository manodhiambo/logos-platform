import apiClient from './api';

export interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    fullName: string;
    avatarUrl?: string;
  }>;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

class MessageService {
  async getConversations() {
    const response = await apiClient.get('/messages/conversations', {
      params: { page: 1, limit: 50 }
    });
    return response.data.data || response.data;
  }

  async getConversation(conversationId: string) {
    const response = await apiClient.get(`/messages/conversations/${conversationId}`);
    return response.data.data || response.data;
  }

  async getMessages(conversationId: string) {
    const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`, {
      params: { page: 1, limit: 50 }
    });
    return response.data.data || response.data;
  }

  async sendMessage(conversationId: string, content: string) {
    const response = await apiClient.post(`/messages/conversations/${conversationId}/messages`, {
      content
    });
    return response.data.data || response.data;
  }

  async createConversation(participantIds: string[]) {
    const response = await apiClient.post('/messages/conversations', {
      participantIds
    });
    return response.data.data || response.data;
  }

  async markAsRead(conversationId: string) {
    const response = await apiClient.put(`/messages/conversations/${conversationId}/read`);
    return response.data;
  }

  async getUnreadCount() {
    const response = await apiClient.get('/messages/unread-count');
    return response.data.data || response.data;
  }

  async deleteMessage(conversationId: string, messageId: string) {
    const response = await apiClient.delete(`/messages/conversations/${conversationId}/messages/${messageId}`);
    return response.data;
  }
}

export default new MessageService();
