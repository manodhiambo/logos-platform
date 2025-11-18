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
      postType: data.postType || 'regular',
      mediaUrls: data.mediaUrls || [],
      isPinned: false,
      likesCount: 0,
      commentsCount: 0,
      shareCount: 0,
      visibility: data.visibility || 'public',
      isDeleted: false,
    });

    return this.getPostById(post.id, userId);
  }

  async getPostById(postId: string, userId?: string) {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
        {
          model: Community,
          as: 'community',
          attributes: ['id', 'name'],
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
      likeCount: post.likesCount,
      commentCount: post.commentsCount,
      isLiked,
    };
  }

  async getPosts(filters: any, page: number = 1, limit: number = 20, userId?: string) {
    const offset = (page - 1) * limit;
    const where: any = { isDeleted: false };

    if (filters.communityId) {
      where.communityId = filters.communityId;
    }

    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    const { rows: posts, count: total } = await Post.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
        {
          model: Community,
          as: 'community',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Check if user liked each post
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        let isLiked = false;
        if (userId) {
          const like = await PostLike.findOne({
            where: { postId: post.id, userId },
          });
          isLiked = !!like;
        }

        return {
          ...post.toJSON(),
          likeCount: post.likesCount,
          commentCount: post.commentsCount,
          isLiked,
        };
      })
    );

    return {
      posts: postsWithLikes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updatePost(postId: string, userId: string, data: any) {
    const post = await Post.findOne({
      where: { id: postId, authorId: userId, isDeleted: false },
    });

    if (!post) {
      throw new Error('Post not found or unauthorized');
    }

    await post.update({
      content: data.content || post.content,
      mediaUrls: data.mediaUrls || post.mediaUrls,
    });

    return this.getPostById(postId, userId);
  }

  async deletePost(postId: string, userId: string) {
    const post = await Post.findOne({
      where: { id: postId, authorId: userId },
    });

    if (!post) {
      throw new Error('Post not found or unauthorized');
    }

    await post.update({ isDeleted: true });
  }
}

export default new PostService();
