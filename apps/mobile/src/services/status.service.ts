import apiClient from './api';

export interface Status {
  id: string;
  userId: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  backgroundColor: string;
  textColor: string;
  viewsCount: number;
  expiresAt: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface StatusGroup {
  user: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
  statuses: Status[];
  count: number;
}

class StatusService {
  async getFeedStatuses(): Promise<Status[]> {
    const response = await apiClient.get('/status/feed');
    return response.data.data?.statuses || [];
  }

  async getGroupedStatuses(): Promise<StatusGroup[]> {
    const response = await apiClient.get('/status/grouped');
    return response.data.data?.groups || [];
  }

  async getMyStatuses(): Promise<Status[]> {
    const response = await apiClient.get('/status/my');
    return response.data.data?.statuses || [];
  }

  async getUserStatuses(userId: string): Promise<Status[]> {
    const response = await apiClient.get(`/status/user/${userId}`);
    return response.data.data?.statuses || [];
  }

  async createStatus(data: {
    content?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    backgroundColor?: string;
    textColor?: string;
  }): Promise<Status> {
    const response = await apiClient.post('/status', data);
    return response.data.data?.status;
  }

  async viewStatus(statusId: string): Promise<void> {
    await apiClient.post(`/status/${statusId}/view`);
  }

  async deleteStatus(statusId: string): Promise<void> {
    await apiClient.delete(`/status/${statusId}`);
  }
}

export default new StatusService();
