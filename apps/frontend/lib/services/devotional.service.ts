import apiClient from '@/lib/api-client';

export interface Devotional {
  id: string;
  title: string;
  content: string;
  bibleVerse: string;
  verseReference: string;
  author: string;
  date: string;
  createdAt: string;
  isCompleted?: boolean;
  userNotes?: string;
}

export interface DevotionalProgress {
  id: string;
  userId: string;
  devotionalId: string;
  completedAt: string;
  notes?: string;
  devotional?: Devotional;
}

export interface DevotionalStats {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  weeklyProgress: number[];
}

class DevotionalService {
  async getDevotionals(params?: { page?: number; limit?: number }) {
    const response = await apiClient.get('/devotionals', { params });
    return response.data.data;
  }

  async getTodaysDevotional() {
    const response = await apiClient.get('/devotionals/today');
    return response.data.data;
  }

  async getDevotional(devotionalId: string) {
    const response = await apiClient.get(`/devotionals/${devotionalId}`);
    return response.data.data;
  }

  async markAsComplete(devotionalId: string) {
    const response = await apiClient.post(`/devotionals/${devotionalId}/complete`);
    return response.data.data;
  }

  async addNotes(devotionalId: string, notes: string) {
    const response = await apiClient.post(`/devotionals/${devotionalId}/notes`, { notes });
    return response.data.data;
  }

  async getUserProgress() {
    const response = await apiClient.get('/devotionals/my-progress');
    return response.data.data;
  }

  async getUserStats() {
    const response = await apiClient.get('/devotionals/my-stats');
    return response.data.data;
  }
}

export const devotionalService = new DevotionalService();
