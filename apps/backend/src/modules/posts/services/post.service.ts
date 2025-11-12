import Post from '../models/Post.model';
import User from '../../../database/models/user.model';
import Community from '../../../database/models/community.model';
import PostLike from '../models/PostLike.model';
import { Op } from 'sequelize';

class PostService {
  async createPost(userId: string, data: any) {
    const post = await Post.create({
      authorId: userId,
      communityId: data.communityId || null,
      content: data.content,
      postType: data.postType || 'text',
      mediaUrls: data.mediaUrls || [],
      isPinned: false,
      likesCount: 0,
      commentsCount: 0,
      shareCount: 0,
    });

    return await this.getPostById(post.id);
  }

  async getPosts(filters: any, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const where: any = { isDeleted: false };
    if (filters.communityId) where.communityId = filters.communityId;
    if (filters.userId) where.authorId = filters.userId;
    if (filters.postType) where.postType = filters.postType;

    const { rows: posts, count: total } = await Post.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
        {
          model: Community,
          as: 'community',
          attributes: ['id', 'name', 'slug'],
          required: false,
        },
      ],
    });

    // Transform posts to use likeCount instead of likesCount
    const transformedPosts = posts.map(post => {
      const postJson = post.toJSON();
      return {
        ...postJson,
        likeCount: postJson.likesCount || 0,
        commentCount: postJson.commentsCount || 0,
      };
    });

    return {
      posts: transformedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        limit,
      },
    };
  }

  async getPostById(postId: string) {
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
          attributes: ['id', 'name', 'slug'],
          required: false,
        },
      ],
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const postJson = post.toJSON();
    return {
      ...postJson,
      likeCount: postJson.likesCount || 0,
      commentCount: postJson.commentsCount || 0,
    };
  }

  async updatePost(postId: string, userId: string, data: any) {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== userId) {
      throw new Error('Unauthorized: You can only update your own posts');
    }

    await post.update(data);
    return await this.getPostById(postId);
  }

  async deletePost(postId: string, userId: string) {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== userId) {
      throw new Error('Unauthorized: You can only delete your own posts');
    }

    await post.update({ isDeleted: true });
    return { message: 'Post deleted successfully' };
  }
}

export default new PostService();
