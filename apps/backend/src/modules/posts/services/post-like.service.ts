import PostLike from '../models/PostLike.model';
import Post from '../models/Post.model';
import { Op } from 'sequelize';

class PostLikeService {
  async toggleLike(postId: string, userId: string) {
    const existingLike = await PostLike.findOne({
      where: {
        postId,
        userId,
      },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();

      // Decrement likes count
      const post = await Post.findByPk(postId);
      if (post && post.likesCount && post.likesCount > 0) {
        await post.decrement('likesCount');
      }

      return { liked: false };
    } else {
      // Like
      await PostLike.create({
        postId,
        userId,
      });

      // Increment likes count
      const post = await Post.findByPk(postId);
      if (post) {
        await post.increment('likesCount');
      }

      return { liked: true };
    }
  }

  async getLikeCount(postId: string) {
    return await PostLike.count({
      where: { postId },
    });
  }

  async hasUserLiked(postId: string, userId: string) {
    const like = await PostLike.findOne({
      where: { postId, userId },
    });
    return !!like;
  }

  async getPostLikes(postId: string) {
    return await PostLike.findAll({
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
