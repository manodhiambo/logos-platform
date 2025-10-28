import apiClient from '@/lib/api-client';

export interface Post {
  id: string;
  content: string;
  authorId: string;
  communityId?: string;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
  community?: {
    id: string;
    name: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  likeCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface CreatePostData {
  content: string;
  communityId?: string;
}

export interface UpdatePostData {
  content: string;
}

class PostService {
  async getPosts(params?: { 
    page?: number; 
    limit?: number; 
    communityId?: string;
    authorId?: string;
  }) {
    const response = await apiClient.get('/posts', { params });
    return response.data.data;
  }

  async getPost(postId: string) {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data.data;
  }

  async createPost(data: CreatePostData) {
    const response = await apiClient.post('/posts', data);
    return response.data.data;
  }

  async updatePost(postId: string, data: UpdatePostData) {
    const response = await apiClient.put(`/posts/${postId}`, data);
    return response.data.data;
  }

  async deletePost(postId: string) {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  }

  async toggleLike(postId: string) {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data.data;
  }

  async togglePin(postId: string) {
    const response = await apiClient.post(`/posts/${postId}/pin`);
    return response.data.data;
  }

  async getComments(postId: string) {
    const response = await apiClient.get(`/posts/${postId}/comments`);
    return response.data.data;
  }

  async addComment(postId: string, content: string) {
    const response = await apiClient.post(`/posts/${postId}/comments`, { content });
    return response.data.data;
  }

  async updateComment(commentId: string, content: string) {
    const response = await apiClient.put(`/posts/comments/${commentId}`, { content });
    return response.data.data;
  }

  async deleteComment(commentId: string) {
    const response = await apiClient.delete(`/posts/comments/${commentId}`);
    return response.data;
  }

  async toggleCommentLike(commentId: string) {
    const response = await apiClient.post(`/posts/comments/${commentId}/like`);
    return response.data.data;
  }
}

export const postService = new PostService();
