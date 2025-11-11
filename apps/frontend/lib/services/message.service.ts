import apiClient from '../api-client';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  attachmentUrl?: string;
  attachmentType?: string;
  isDeleted: boolean;
  readAt?: string;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  receiver: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface Conversation {
  conversationId: string;
  otherUser: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    email: string;
  };
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

class MessageService {
  // Send a message
  async sendMessage(
    receiverId: string,
    content: string,
    attachmentUrl?: string,
    attachmentType?: string
  ) {
    const response = await apiClient.post('/messages/send', {
      receiverId,
      content,
      attachmentUrl,
      attachmentType,
    });
    return response.data;
  }

  // Get messages with a specific user
  async getMessages(otherUserId: string, page: number = 1, limit: number = 50) {
    const response = await apiClient.get(`/messages/conversation/${otherUserId}`, {
      params: { page, limit },
    });
    return response.data;
  }

  // Get all conversations
  async getConversations(page: number = 1, limit: number = 20) {
    const response = await apiClient.get('/messages/conversations', {
      params: { page, limit },
    });
    return response.data;
  }

  // Delete a message
  async deleteMessage(messageId: string) {
    const response = await apiClient.delete(`/messages/${messageId}`);
    return response.data;
  }

  // Mark messages as read
  async markAsRead(senderId: string) {
    const response = await apiClient.put(`/messages/read/${senderId}`);
    return response.data;
  }

  // Get unread message count
  async getUnreadCount() {
    const response = await apiClient.get('/messages/unread-count');
    return response.data;
  }
}

export default new MessageService();
