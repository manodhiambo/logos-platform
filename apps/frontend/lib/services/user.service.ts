import apiClient from '@/lib/api-client';

export interface UpdateProfileData {
  fullName?: string;
  bio?: string;
  denomination?: string;
  country?: string;
  timezone?: string;
  spiritualJourneyStage?: string;
  preferredBibleTranslation?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  prayer: boolean;
  devotional: boolean;
  announcements: boolean;
}

export interface UpdateNotificationSettingsData {
  notificationSettings: NotificationSettings;
}

class UserService {
  async getProfile() {
    const response = await apiClient.get('/users/profile');
    return response.data.data;
  }

  async updateProfile(data: UpdateProfileData) {
    const response = await apiClient.put('/users/profile', data);
    return response.data.data;
  }

  async updateNotificationSettings(data: UpdateNotificationSettingsData) {
    const response = await apiClient.put('/users/notification-settings', data);
    return response.data.data;
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    const response = await apiClient.put('/users/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }
}

export const userService = new UserService();
