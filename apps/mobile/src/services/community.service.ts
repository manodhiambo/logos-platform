import apiClient from './api';

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  avatarUrl?: string;
  isMember?: boolean;
  userRole?: string;
  createdBy: string;
  privacyLevel: string;
  createdAt: string;
  updatedAt: string;
}

class CommunityService {
  async getCommunities(params?: { search?: string; category?: string }) {
    const response = await apiClient.get('/communities', { params });
    // Backend returns: { message, data: communities, pagination }
    return response.data.data || response.data;
  }

  async getCommunity(id: string) {
    const response = await apiClient.get(`/communities/${id}`);
    return response.data.data || response.data;
  }

  async joinCommunity(id: string) {
    const response = await apiClient.post(`/communities/${id}/join`);
    return response.data.data || response.data;
  }

  async leaveCommunity(id: string) {
    const response = await apiClient.delete(`/communities/${id}/leave`);
    return response.data;
  }

  async getMyCommunities() {
    const response = await apiClient.get('/communities/my-communities');
    return response.data.data || response.data;
  }

  async getCommunityMembers(id: string) {
    const response = await apiClient.get(`/communities/${id}/members`);
    return response.data.data || response.data;
  }
}

export default new CommunityService();
