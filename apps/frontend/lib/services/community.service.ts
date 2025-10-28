import apiClient from '@/lib/api-client';

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  isPrivate: boolean;
  memberCount?: number;
  createdBy: string;
  createdAt: string;
  isMember?: boolean;
}

export interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  user?: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface CreateCommunityData {
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
}

class CommunityService {
  async getCommunities(params?: { search?: string; category?: string }) {
    const response = await apiClient.get('/communities', { params });
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

  async updateMemberRole(communityId: string, memberId: string, role: string) {
    const response = await apiClient.put(
      `/communities/${communityId}/members/${memberId}/role`,
      { role }
    );
    return response.data.data;
  }
}

export const communityService = new CommunityService();
