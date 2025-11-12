import apiClient from '@/lib/api-client';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsersToday: number;
  totalCommunities: number;
  totalPrayers: number;
  totalPosts: number;
  pendingModeration: number;
  newUsersToday: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  status: string;
  isGlobal: boolean;
  isActive?: boolean;  // Added this
  createdBy: string;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

class AdminService {
  async getAllUsers(params?: { page?: number; limit?: number; role?: string; status?: string }) {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
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

  async updateUserStatus(userId: string, status: string, reason?: string) {
    const response = await apiClient.put(`/admin/users/${userId}/status`, { status, reason });
    return response.data.data;
  }

  async deleteUser(userId: string, deleteType?: string, reason?: string) {
    const response = await apiClient.delete(`/admin/users/${userId}`, {
      data: { deleteType, reason }
    });
    return response.data;
  }

  async getSystemStats() {
    const response = await apiClient.get('/admin/stats');
    return response.data.data;
  }

  // Announcements
  async getAllAnnouncements(params?: { page?: number; limit?: number }) {
    const response = await apiClient.get('/admin/announcements', { params });
    return response.data;
  }

  async createAnnouncement(data: {
    title: string;
    content: string;
    type?: string;
    priority?: string;
    status?: string;
    isGlobal?: boolean;
    expiresAt?: string;
  }) {
    const response = await apiClient.post('/admin/announcements', data);
    return response.data.data;
  }

  async updateAnnouncement(announcementId: string, data: any) {
    const response = await apiClient.put(`/admin/announcements/${announcementId}`, data);
    return response.data.data;
  }

  async deleteAnnouncement(announcementId: string) {
    const response = await apiClient.delete(`/admin/announcements/${announcementId}`);
    return response.data;
  }
}

export const adminService = new AdminService();
