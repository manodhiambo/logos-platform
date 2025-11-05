import { Like, Post } from '../../../database/models';
import { Op } from 'sequelize';

class PostLikeService {
  async toggleLike(postId: string, userId: string) {
    const existingLike = await Like.findOne({
      where: {
        postId,
        userId,
      },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      
      // Decrement like count
      const post = await Post.findByPk(postId);
      if (post && post.likesCount > 0) {
        await post.decrement('likesCount');
      }
      
      return { liked: false };
    } else {
      // Like
      await Like.create({
        postId,
        userId,
      });
      
      // Increment like count
      const post = await Post.findByPk(postId);
      if (post) {
        await post.increment('likesCount');
      }
      
      return { liked: true };
    }
  }

  async getLikeCount(postId: string) {
    return await Like.count({
      where: { postId },
    });
  }

  async hasUserLiked(postId: string, userId: string) {
    const like = await Like.findOne({
      where: { postId, userId },
    });
    return !!like;
  }

  async getPostLikes(postId: string) {
    return await Like.findAll({
      where: { postId },
      include: [
        {
          association: 'user',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
      ],
    });
  }
}

export default new PostLikeService();
