import apiClient from './api';

export interface Devotional {
  id: string;
  title: string;
  content: string;
  scripture: string;
  author: string;
  category: string;
  date: string;
  createdAt: string;
  isCompleted?: boolean;
  userNotes?: string;
}

class DevotionalService {
  async getDevotionals(params?: { category?: string; page?: number; limit?: number }) {
    const response = await apiClient.get('/devotionals', {
      params: { page: 1, limit: 20, ...params }
    });
    return response.data.data || response.data;
  }

  async getTodayDevotional() {
    const response = await apiClient.get('/devotionals/today');
    return response.data.data || response.data;
  }

  async getDevotional(id: string) {
    const response = await apiClient.get(`/devotionals/${id}`);
    return response.data.data || response.data;
  }

  async markAsComplete(id: string) {
    const response = await apiClient.post(`/devotionals/${id}/complete`);
    return response.data.data || response.data;
  }

  async addNotes(id: string, notes: string) {
    const response = await apiClient.post(`/devotionals/${id}/notes`, { notes });
    return response.data.data || response.data;
  }

  async getUserProgress() {
    const response = await apiClient.get('/devotionals/my-progress');
    return response.data.data || response.data;
  }

  async getUserStats() {
    const response = await apiClient.get('/devotionals/my-stats');
    return response.data.data || response.data;
  }
}

export default new DevotionalService();
