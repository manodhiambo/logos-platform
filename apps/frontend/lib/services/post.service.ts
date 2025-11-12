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
  private unwrap(response: any) {
    return response?.data?.data || response?.data || response;
  }

  async getPosts(params?: {
    page?: number;
    limit?: number;
    communityId?: string;
    authorId?: string;
  }) {
    const response = await apiClient.get('/posts', { params });
    return this.unwrap(response);
  }

  async getCommunityPosts(communityId: string, page: number = 1, limit: number = 20) {
    const response = await apiClient.get('/posts', { 
      params: { communityId, page, limit } 
    });
    return this.unwrap(response);
  }

  async getPost(postId: string) {
    const response = await apiClient.get(`/posts/${postId}`);
    return this.unwrap(response);
  }

  async createPost(data: CreatePostData) {
    const response = await apiClient.post('/posts', data);
    return this.unwrap(response);
  }

  async updatePost(postId: string, data: UpdatePostData) {
    const response = await apiClient.put(`/posts/${postId}`, data);
    return this.unwrap(response);
  }

  async deletePost(postId: string) {
    const response = await apiClient.delete(`/posts/${postId}`);
    return this.unwrap(response);
  }

  async toggleLike(postId: string) {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return this.unwrap(response);
  }

  async getPostLikes(postId: string) {
    const response = await apiClient.get(`/posts/${postId}/likes`);
    return this.unwrap(response);
  }

  async togglePin(postId: string) {
    const response = await apiClient.post(`/posts/${postId}/pin`);
    return this.unwrap(response);
  }

  async getComments(postId: string, page: number = 1, limit: number = 20) {
    const response = await apiClient.get(`/posts/${postId}/comments`, {
      params: { page, limit }
    });
    return this.unwrap(response);
  }

  async addComment(postId: string, content: string, parentCommentId?: string) {
    const response = await apiClient.post(`/posts/${postId}/comments`, { 
      content, 
      parentCommentId 
    });
    return this.unwrap(response);
  }

  async updateComment(commentId: string, content: string) {
    const response = await apiClient.put(`/posts/comments/${commentId}`, { content });
    return this.unwrap(response);
  }

  async deleteComment(commentId: string) {
    const response = await apiClient.delete(`/posts/comments/${commentId}`);
    return this.unwrap(response);
  }

  async toggleCommentLike(commentId: string) {
    const response = await apiClient.post(`/posts/comments/${commentId}/like`);
    return this.unwrap(response);
  }
}

export const postService = new PostService();
