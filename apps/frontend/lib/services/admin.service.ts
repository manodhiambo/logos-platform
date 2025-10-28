import apiClient from '@/lib/api-client';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalCommunities: number;
  totalPosts: number;
  totalPrayers: number;
  totalDevotionals: number;
  newUsersThisMonth: number;
  activeUsersThisWeek: number;
}

export interface CreateUserData {
  email: string;
  username: string;
  fullName: string;
  password: string;
  role: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
  expiresAt?: string;
}

class AdminService {
  // User Management
  async getAllUsers(params?: { page?: number; limit?: number; role?: string; status?: string }) {
    const response = await apiClient.get('/admin/users', { params });
    return response.data.data;
  }

  async getUserById(userId: string) {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data.data;
  }

  async createUser(data: CreateUserData) {
    const response = await apiClient.post('/admin/users', data);
    return response.data.data;
  }

  async updateUserRole(userId: string, role: string) {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data.data;
  }

  async updateUserStatus(userId: string, status: string) {
    const response = await apiClient.put(`/admin/users/${userId}/status`, { status });
    return response.data.data;
  }

  async deleteUser(userId: string) {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  }

  // Announcements
  async getAllAnnouncements() {
    const response = await apiClient.get('/admin/announcements');
    return response.data.data;
  }

  async createAnnouncement(data: CreateAnnouncementData) {
    const response = await apiClient.post('/admin/announcements', data);
    return response.data.data;
  }

  async updateAnnouncement(announcementId: string, data: Partial<CreateAnnouncementData>) {
    const response = await apiClient.put(`/admin/announcements/${announcementId}`, data);
    return response.data.data;
  }

  async deleteAnnouncement(announcementId: string) {
    const response = await apiClient.delete(`/admin/announcements/${announcementId}`);
    return response.data;
  }

  // System Stats
  async getSystemStats() {
    const response = await apiClient.get('/admin/stats');
    return response.data.data;
  }
}

export const adminService = new AdminService();
