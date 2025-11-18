import apiClient from './api';

export interface Prayer {
  id: string;
  title: string;
  description: string;
  category: string;
  prayerCount: number;
  hasPrayed?: boolean;
  isAnonymous: boolean;
  authorId: string;
  author?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

class PrayerService {
  async getPrayers(params?: { category?: string; status?: string }) {
    const response = await apiClient.get('/prayers/requests', { 
      params: { ...params, page: 1, limit: 20 } 
    });
    return response.data.data || response.data;
  }

  async getPrayer(id: string) {
    const response = await apiClient.get(`/prayers/requests/${id}`);
    return response.data.data || response.data;
  }

  async createPrayer(data: {
    title: string;
    description: string;
    category: string;
    isAnonymous?: boolean;
  }) {
    const response = await apiClient.post('/prayers/requests', data);
    return response.data.data || response.data;
  }

  async updatePrayer(id: string, data: Partial<Prayer>) {
    const response = await apiClient.put(`/prayers/requests/${id}`, data);
    return response.data.data || response.data;
  }

  async deletePrayer(id: string) {
    const response = await apiClient.delete(`/prayers/requests/${id}`);
    return response.data;
  }

  async prayForRequest(prayerId: string) {
    const response = await apiClient.post(`/prayers/requests/${prayerId}/pray`);
    return response.data;
  }

  async getMyPrayers() {
    const response = await apiClient.get('/prayers/requests/me');
    return response.data.data || response.data;
  }

  async updateStatus(prayerId: string, status: string) {
    const response = await apiClient.put(`/prayers/requests/${prayerId}/status`, { status });
    return response.data.data || response.data;
  }
}

export default new PrayerService();
