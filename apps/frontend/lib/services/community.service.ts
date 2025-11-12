import apiClient from '../api-client';

export interface Community {
  id: string;
  name: string;
  description: string;
  category?: string;
  privacyLevel?: string;
  avatarUrl?: string;
  memberCount?: number;
  postCount?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCommunityData {
  name: string;
  description: string;
  category?: string;
  privacyLevel?: 'public' | 'private';
}

class CommunityService {
  async getCommunities(params?: { search?: string; category?: string }) {
    const response = await apiClient.get('/communities', { params });
    // Backend returns { message, data: communities[], pagination }
    return response.data.data;
  }

  async getMyCommunities() {
    const response = await apiClient.get('/communities', {
      params: { mycommunities: 'true' }
    });
    return response.data.data;
  }

  async getCommunity(communityId: string) {
    const response = await apiClient.get(`/communities/${communityId}`);
    return response.data.data;
  }

  async createCommunity(data: CreateCommunityData) {
    const response = await apiClient.post('/communities', data);
    return response.data.data;
  }

  async updateCommunity(communityId: string, data: Partial<CreateCommunityData>) {
    const response = await apiClient.put(`/communities/${communityId}`, data);
    return response.data.data;
  }

  async deleteCommunity(communityId: string) {
    const response = await apiClient.delete(`/communities/${communityId}`);
    return response.data;
  }

  async joinCommunity(communityId: string) {
    const response = await apiClient.post(`/communities/${communityId}/join`);
    return response.data.data;
  }

  async leaveCommunity(communityId: string) {
    const response = await apiClient.post(`/communities/${communityId}/leave`);
    return response.data;
  }

  async getCommunityMembers(communityId: string) {
    const response = await apiClient.get(`/communities/${communityId}/members`);
    return response.data.data;
  }
}

export default new CommunityService();
