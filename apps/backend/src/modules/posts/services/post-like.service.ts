import PostLike from '../models/PostLike.model';
import Post from '../models/Post.model';
import { sequelize } from '../../../config/database.config';

class PostLikeService {
  async toggleLike(postId: string, userId: string) {
    const transaction = await sequelize.transaction();
    
    try {
      const existingLike = await PostLike.findOne({
        where: { postId, userId }
      });

      if (existingLike) {
        await existingLike.destroy({ transaction });
        await Post.decrement('likeCount', {
          by: 1,
          where: { id: postId },
          transaction
        });

        await transaction.commit();
        return { liked: false, action: 'unliked' };
      } else {
        await PostLike.create({ postId, userId }, { transaction });
        await Post.increment('likeCount', {
          by: 1,
          where: { id: postId },
          transaction
        });

        await transaction.commit();
        return { liked: true, action: 'liked' };
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async hasUserLiked(postId: string, userId: string) {
    const like = await PostLike.findOne({
      where: { postId, userId }
    });
    return !!like;
  }
}

export default new PostLikeService();
