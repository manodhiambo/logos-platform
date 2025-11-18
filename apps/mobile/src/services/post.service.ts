import apiClient from './api';

export interface Post {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  communityId?: string;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  postType?: string;
  mediaUrls?: string[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  postId: string;
  createdAt: string;
}

class PostService {
  async getPosts(communityId?: string) {
    const params: any = { page: 1, limit: 20 };
    if (communityId) {
      params.communityId = communityId;
    }
    const response = await apiClient.get('/posts', { params });
    return response.data.data || response.data;
  }

  async getPost(postId: string) {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data.data || response.data;
  }

  async createPost(data: { content: string; communityId?: string }) {
    const response = await apiClient.post('/posts', data);
    return response.data.data || response.data;
  }

  async updatePost(postId: string, data: { content: string }) {
    const response = await apiClient.put(`/posts/${postId}`, data);
    return response.data.data || response.data;
  }

  async deletePost(postId: string) {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  }

  async toggleLike(postId: string) {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data;
  }

  async getComments(postId: string) {
    const response = await apiClient.get(`/posts/${postId}/comments`);
    return response.data.data || response.data;
  }

  async addComment(postId: string, content: string) {
    const response = await apiClient.post(`/posts/${postId}/comments`, { content });
    return response.data.data || response.data;
  }

  async deleteComment(postId: string, commentId: string) {
    const response = await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  }
}

export default new PostService();
