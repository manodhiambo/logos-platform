import apiClient from '@/lib/api-client';

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'answered' | 'closed';
  isPrivate: boolean;
  isAnonymous: boolean;
  userId: string;
  prayerCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface Prayer {
  id: string;
  requestId: string;
  userId: string;
  note?: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface CreatePrayerRequestData {
  title: string;
  description: string;
  category: string;
  isPrivate?: boolean;
  isAnonymous?: boolean;
}

export interface UpdatePrayerRequestData {
  title?: string;
  description?: string;
  category?: string;
  isPrivate?: boolean;
}

class PrayerService {
  async getPrayerRequests(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
  }) {
    const response = await apiClient.get('/prayers/requests', { params });
    return response.data.data;
  }

  async getMyPrayerRequests() {
    const response = await apiClient.get('/prayers/requests/me');
    return response.data.data;
  }

  async getPrayerRequest(requestId: string) {
    const response = await apiClient.get(`/prayers/requests/${requestId}`);
    return response.data.data;
  }

  async createPrayerRequest(data: CreatePrayerRequestData) {
    const response = await apiClient.post('/prayers/requests', data);
    return response.data.data;
  }

  async updatePrayerRequest(requestId: string, data: UpdatePrayerRequestData) {
    const response = await apiClient.put(`/prayers/requests/${requestId}`, data);
    return response.data.data;
  }

  async deletePrayerRequest(requestId: string) {
    const response = await apiClient.delete(`/prayers/requests/${requestId}`);
    return response.data;
  }

  async prayForRequest(requestId: string, note?: string) {
    const response = await apiClient.post(`/prayers/requests/${requestId}/pray`, { note });
    return response.data.data;
  }

  async getPrayers(requestId: string) {
    const response = await apiClient.get(`/prayers/requests/${requestId}/prayers`);
    return response.data.data;
  }

  async updateStatus(requestId: string, status: string) {
    const response = await apiClient.put(`/prayers/requests/${requestId}/status`, { status });
    return response.data.data;
  }

  // Alias for backwards compatibility
  async getUserPrayers() {
    return this.getMyPrayerRequests();
  }
}

export const prayerService = new PrayerService();
