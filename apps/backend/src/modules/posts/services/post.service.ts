import { Post, User, Community } from '../../../database/models';
import { Op } from 'sequelize';

class PostService {
  async createPost(userId: string, postData: any) {
    try {
      const post = await Post.create({
        authorId: userId,
        communityId: postData.communityId || null,
        content: postData.content,
        postType: postData.postType || 'discussion',
        attachments: postData.attachments || null,
        isPinned: false,
        likesCount: 0,
        commentsCount: 0,
      });

      return this.getPostById(post.id);
    } catch (error: any) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  async getPosts(filters: any, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters.communityId) where.communityId = filters.communityId;
    if (filters.userId) where.authorId = filters.userId;
    if (filters.postType) where.postType = filters.postType;

    const { rows: posts, count: total } = await Post.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC']
      ],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePictureUrl', 'role'],
        },
        {
          model: Community,
          as: 'community',
          attributes: ['id', 'name', 'avatarUrl'],
          required: false,
        },
      ],
    });

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostById(postId: string) {
    const post = await Post.findOne({
      where: { id: postId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePictureUrl', 'role'],
        },
        {
          model: Community,
          as: 'community',
          attributes: ['id', 'name', 'avatarUrl'],
          required: false,
        },
      ],
    });

    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  }

  async updatePost(postId: string, userId: string, updateData: any) {
    const post = await Post.findOne({
      where: { id: postId, authorId: userId },
    });

    if (!post) {
      throw new Error('Post not found or you do not have permission to update it');
    }

    const allowedUpdates = ['content', 'attachments'];
    const updates: any = {};

    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    await post.update(updates);
    return this.getPostById(postId);
  }

  async deletePost(postId: string, userId: string) {
    const post = await Post.findOne({
      where: { id: postId, authorId: userId },
    });

    if (!post) {
      throw new Error('Post not found or you do not have permission to delete it');
    }

    await post.destroy();
  }

  async incrementLikeCount(postId: string) {
    const post = await Post.findByPk(postId);
    if (post) {
      await post.increment('likesCount');
    }
  }

  async decrementLikeCount(postId: string) {
    const post = await Post.findByPk(postId);
    if (post && post.likesCount > 0) {
      await post.decrement('likesCount');
    }
  }

  async incrementCommentCount(postId: string) {
    const post = await Post.findByPk(postId);
    if (post) {
      await post.increment('commentsCount');
    }
  }

  async decrementCommentCount(postId: string) {
    const post = await Post.findByPk(postId);
    if (post && post.commentsCount > 0) {
      await post.decrement('commentsCount');
    }
  }
}

export default new PostService();
