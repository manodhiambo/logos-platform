import apiClient from '@/lib/api-client';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  metadata?: any;
  createdAt: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  prayerUpdates: boolean;
  devotionalReminders: boolean;
  communityActivity: boolean;
  postInteractions: boolean;
  announcements: boolean;
}

class NotificationService {
  async getNotifications(params?: { page?: number; limit?: number; unread?: boolean }) {
    const response = await apiClient.get('/notifications', { params });
    return response.data.data;
  }

  async getUnreadCount() {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.data;
  }

  async markAsRead(notificationId: string) {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data.data;
  }

  async markAllAsRead() {
    const response = await apiClient.put('/notifications/mark-all-read');
    return response.data;
  }

  async deleteNotification(notificationId: string) {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  async getPreferences() {
    const response = await apiClient.get('/notifications/preferences');
    return response.data.data;
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>) {
    const response = await apiClient.put('/notifications/preferences', preferences);
    return response.data.data;
  }
}

export const notificationService = new NotificationService();
