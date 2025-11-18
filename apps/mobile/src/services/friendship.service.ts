import apiClient from './api';

export interface Friend {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  friendshipId: string;
  friendsSince: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  sender?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  receiver?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  status: string;
  createdAt: string;
}

class FriendshipService {
  async sendFriendRequest(receiverId: string) {
    const response = await apiClient.post('/auth/friend-request', { receiverId });
    return response.data.data || response.data;
  }

  async acceptFriendRequest(friendshipId: string) {
    const response = await apiClient.put(`/auth/friend-request/${friendshipId}/accept`);
    return response.data.data || response.data;
  }

  async rejectFriendRequest(friendshipId: string) {
    const response = await apiClient.put(`/auth/friend-request/${friendshipId}/reject`);
    return response.data.data || response.data;
  }

  async removeFriend(friendshipId: string) {
    const response = await apiClient.delete(`/auth/friend/${friendshipId}`);
    return response.data;
  }

  async getFriends() {
    const response = await apiClient.get('/auth/friends');
    return response.data.data || response.data;
  }

  async getPendingRequests() {
    const response = await apiClient.get('/auth/friend-requests/pending');
    return response.data.data || response.data;
  }

  async getSentRequests() {
    const response = await apiClient.get('/auth/friend-requests/sent');
    return response.data.data || response.data;
  }

  async checkFriendshipStatus(otherUserId: string) {
    const response = await apiClient.get(`/auth/friendship-status/${otherUserId}`);
    return response.data.data || response.data;
  }

  async searchUsers(query: string) {
    const response = await apiClient.get('/friendship/users/search', {
      params: { query, page: 1, limit: 20 }
    });
    return response.data.data || response.data;
  }
}

export default new FriendshipService();
