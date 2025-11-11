import apiClient from '../api-client';

export interface FriendshipStatus {
  status: 'none' | 'pending' | 'accepted' | 'rejected' | 'blocked';
  friendshipId: string | null;
  isRequester?: boolean;
}

export interface Friend {
  friendshipId: string;
  friend: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
  };
  friendsSince: string;
}

export interface FriendRequest {
  id: string;
  requester: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
  };
  status: string;
  createdAt: string;
}

export interface UserSearchResult {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
}

class FriendshipService {
  // Send friend request
  async sendFriendRequest(addresseeId: string) {
    const response = await apiClient.post('/friendship/friend-request', {
      addresseeId,
    });
    return response.data;
  }

  // Accept friend request
  async acceptFriendRequest(friendshipId: string) {
    const response = await apiClient.put(
      `/friendship/friend-request/${friendshipId}/accept`
    );
    return response.data;
  }

  // Reject friend request
  async rejectFriendRequest(friendshipId: string) {
    const response = await apiClient.put(
      `/friendship/friend-request/${friendshipId}/reject`
    );
    return response.data;
  }

  // Remove friend
  async removeFriend(friendshipId: string) {
    const response = await apiClient.delete(`/friendship/friend/${friendshipId}`);
    return response.data;
  }

  // Get all friends
  async getFriends(page: number = 1, limit: number = 20) {
    const response = await apiClient.get('/friendship/friends', {
      params: { page, limit },
    });
    return response.data;
  }

  // Get pending friend requests (received)
  async getPendingRequests(page: number = 1, limit: number = 20) {
    const response = await apiClient.get('/friendship/friend-requests/pending', {
      params: { page, limit },
    });
    return response.data;
  }

  // Get sent friend requests
  async getSentRequests(page: number = 1, limit: number = 20) {
    const response = await apiClient.get('/friendship/friend-requests/sent', {
      params: { page, limit },
    });
    return response.data;
  }

  // Check friendship status
  async checkFriendshipStatus(otherUserId: string): Promise<FriendshipStatus> {
    const response = await apiClient.get(
      `/friendship/friendship-status/${otherUserId}`
    );
    return response.data.data;
  }

  // Follow user
  async followUser(userId: string) {
    const response = await apiClient.post('/friendship/follow', { userId });
    return response.data;
  }

  // Unfollow user
  async unfollowUser(userId: string) {
    const response = await apiClient.delete(`/friendship/follow/${userId}`);
    return response.data;
  }

  // Get followers
  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const response = await apiClient.get(`/friendship/followers/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  }

  // Get following
  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const response = await apiClient.get(`/friendship/following/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  }

  // Check if following
  async isFollowing(userId: string) {
    const response = await apiClient.get(`/friendship/is-following/${userId}`);
    return response.data.data.isFollowing;
  }

  // Search users
  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    const response = await apiClient.get('/friendship/users/search', {
      params: { query, page, limit },
    });
    return response.data;
  }
}

export default new FriendshipService();
