import Post from '../models/Post.model';
import User from '../../../database/models/user.model';
import Community from '../../community/models/Community.model';
import { Op } from 'sequelize';

class PostService {
  async createPost(userId: string, postData: any) {
    try {
      const post = await Post.create({
        userId: userId,
        authorId: userId,
        communityId: postData.communityId || null,
        content: postData.content,
        mediaUrls: postData.mediaUrls || [],
        postType: postData.postType || 'regular',
        visibility: postData.visibility || 'public',
        isPinned: false,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        isDeleted: false,
      });

      // Fetch the post with author details
      const createdPost = await Post.findByPk(post.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatarUrl'],
          },
          {
            model: Community,
            as: 'community',
            attributes: ['id', 'name'],
          },
        ],
      });

      return createdPost;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  }

  async getPosts(filters: any = {}, page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const whereClause: any = {
        isDeleted: false,
      };

      if (filters.communityId) {
        whereClause.communityId = filters.communityId;
      }

      if (filters.userId) {
        whereClause.userId = filters.userId;
      }

      if (filters.postType) {
        whereClause.postType = filters.postType;
      }

      const { rows: posts, count } = await Post.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatarUrl'],
          },
          {
            model: Community,
            as: 'community',
            attributes: ['id', 'name'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalPosts: count,
          limit,
        },
      };
    } catch (error) {
      console.error('Get posts error:', error);
      throw error;
    }
  }

  async getPostById(postId: string) {
    try {
      const post = await Post.findOne({
        where: { id: postId, isDeleted: false },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatarUrl'],
          },
          {
            model: Community,
            as: 'community',
            attributes: ['id', 'name'],
          },
        ],
      });

      return post;
    } catch (error) {
      console.error('Get post by ID error:', error);
      throw error;
    }
  }

  async updatePost(postId: string, userId: string, updateData: any) {
    try {
      const post = await Post.findOne({
        where: { id: postId, userId: userId, isDeleted: false },
      });

      if (!post) {
        throw new Error('Post not found or unauthorized');
      }

      await post.update({
        content: updateData.content || post.content,
        mediaUrls: updateData.mediaUrls || post.mediaUrls,
      });

      return post;
    } catch (error) {
      console.error('Update post error:', error);
      throw error;
    }
  }

  async deletePost(postId: string, userId: string) {
    try {
      const post = await Post.findOne({
        where: { id: postId, userId: userId },
      });

      if (!post) {
        throw new Error('Post not found or unauthorized');
      }

      await post.update({ isDeleted: true });
      return true;
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  }
}

export default new PostService();
