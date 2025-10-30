import Post from '../models/Post.model';
import Comment from '../models/Comment.model';
import PostLike from '../models/PostLike.model';
import CommentLike from '../models/CommentLike.model';
import User from '../../../database/models/user.model';
import Community from '../../community/models/Community.model';
import { Op, Order } from 'sequelize';

class PostService {
  /**
   * Create a new post
   */
  async createPost(data: any, userId: string) {
    const post = await Post.create({
      userId,
      authorId: userId,
      communityId: data.communityId || null,
      content: data.content,
      postType: data.postType || 'discussion',
      attachments: data.attachments || [],
      isPinned: false,
      likeCount: 0,
      commentCount: 0,
      visibility: data.visibility || 'public',
    });

    // Fetch post with author details
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
          attributes: ['id', 'name', 'avatarUrl'],
        },
      ],
    });

    return createdPost;
  }

  /**
   * Get posts feed
   */
  async getPosts(filters: any, userId: string | undefined, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const where: any = { isDeleted: false };

    if (filters.communityId) {
      where.communityId = filters.communityId;
    }

    if (filters.postType) {
      where.postType = filters.postType;
    }

    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    const orderBy: Order = filters.sort === 'popular' 
      ? [['likeCount', 'DESC'], ['createdAt', 'DESC']]
      : [['createdAt', 'DESC']];

    const { rows: posts, count: total } = await Post.findAndCountAll({
      where,
      limit,
      offset,
      order: orderBy,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
        {
          model: Community,
          as: 'community',
          attributes: ['id', 'name', 'avatarUrl'],
        },
      ],
    });

    // Check if user has liked each post
    let postsWithLikeStatus = posts;
    if (userId) {
      const postIds = posts.map(p => p.id);
      const userLikes = await PostLike.findAll({
        where: {
          postId: { [Op.in]: postIds },
          userId,
        },
        attributes: ['postId'],
      });

      const likedPostIds = new Set(userLikes.map(like => like.postId));

      postsWithLikeStatus = posts.map((post: any) => ({
        ...post.toJSON(),
        isLiked: likedPostIds.has(post.id),
      }));
    }

    return {
      posts: postsWithLikeStatus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        limit,
      },
    };
  }

  /**
   * Get post by ID
   */
  async getPostById(postId: string, userId: string | undefined) {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl', 'bio'],
        },
        {
          model: Community,
          as: 'community',
          attributes: ['id', 'name', 'avatarUrl', 'description'],
        },
      ],
    });

    if (!post) {
      throw new Error('Post not found');
    }

    let isLiked = false;
    if (userId) {
      const like = await PostLike.findOne({
        where: { postId, userId },
      });
      isLiked = !!like;
    }

    return {
      ...post.toJSON(),
      isLiked,
    };
  }

  /**
   * Update post
   */
  async updatePost(postId: string, data: any, userId: string) {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== userId) {
      throw new Error('Unauthorized: You can only update your own posts');
    }

    await post.update({
      content: data.content || post.content,
      attachments: data.attachments || post.attachments,
    });

    return post;
  }

  /**
   * Delete post
   */
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

  /**
   * Toggle like on post
   */
  async toggleLike(postId: string, userId: string) {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const existingLike = await PostLike.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await post.decrement('likeCount', { by: 1 });

      return {
        liked: false,
        likeCount: post.likeCount - 1,
      };
    } else {
      // Like
      await PostLike.create({ postId, userId });
      await post.increment('likeCount', { by: 1 });

      return {
        liked: true,
        likeCount: post.likeCount + 1,
      };
    }
  }

  /**
   * Pin/Unpin post (admin/moderator only)
   */
  async togglePin(postId: string, userId: string) {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // TODO: Check if user is admin/moderator of the community

    await post.update({ isPinned: !post.isPinned });

    return post;
  }
}

export default new PostService();
