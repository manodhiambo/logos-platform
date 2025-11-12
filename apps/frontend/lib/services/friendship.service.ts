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
    try {
      const response = await apiClient.get('/friendship/friends', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      console.error('getFriends error:', error.response?.data);
      return { data: [], pagination: { total: 0, page: 1, limit: 20 } };
    }
  }

  // Get pending friend requests (received)
  async getPendingRequests(page: number = 1, limit: number = 20) {
    try {
      const response = await apiClient.get('/friendship/friend-requests/pending', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      console.error('getPendingRequests error:', error.response?.data);
      return { data: [], pagination: { total: 0, page: 1, limit: 20 } };
    }
  }

  // Get sent friend requests
  async getSentRequests(page: number = 1, limit: number = 20) {
    try {
      const response = await apiClient.get('/friendship/friend-requests/sent', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      console.error('getSentRequests error:', error.response?.data);
      return { data: [], pagination: { total: 0, page: 1, limit: 20 } };
    }
  }

  // Check friendship status
  async checkFriendshipStatus(otherUserId: string): Promise<FriendshipStatus> {
    try {
      const response = await apiClient.get(
        `/friendship/friendship-status/${otherUserId}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('checkFriendshipStatus error:', error.response?.data);
      return { status: 'none', friendshipId: null };
    }
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
    try {
      const response = await apiClient.get(`/friendship/followers/${userId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      console.error('getFollowers error:', error.response?.data);
      return { data: [], pagination: { total: 0, page: 1, limit: 20 } };
    }
  }

  // Get following
  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    try {
      const response = await apiClient.get(`/friendship/following/${userId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      console.error('getFollowing error:', error.response?.data);
      return { data: [], pagination: { total: 0, page: 1, limit: 20 } };
    }
  }

  // Check if following
  async isFollowing(userId: string) {
    try {
      const response = await apiClient.get(`/friendship/is-following/${userId}`);
      return response.data.data.isFollowing;
    } catch (error: any) {
      console.error('isFollowing error:', error.response?.data);
      return false;
    }
  }

  // Search users - Use admin endpoint as fallback since it works
  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    try {
      // Try the friendship search first
      const response = await apiClient.get('/friendship/users/search', {
        params: { query: query || 'a', page, limit },
      });
      return response.data;
    } catch (error: any) {
      console.error('searchUsers error:', error.response?.data);
      
      // Fallback: Try to get users from admin endpoint if user is admin
      try {
        const adminResponse = await apiClient.get('/admin/users', {
          params: { page, limit, search: query },
        });
        // Transform admin response to match expected format
        return {
          data: adminResponse.data.data || [],
          pagination: adminResponse.data.pagination || { total: 0, page: 1, limit: 20 }
        };
      } catch (adminError) {
        console.error('Admin users fallback also failed:', adminError);
        return { data: [], pagination: { total: 0, page: 1, limit: 20 } };
      }
    }
  }
}

export default new FriendshipService();

export const friendshipService = new FriendshipService();
