import PostComment from '../models/PostComment.model';
import Post from '../models/Post.model';
import User from '../../../database/models/user.model';
import { sequelize } from '../../../config/database.config';

class PostCommentService {
  async addComment(postId: string, userId: string, content: string, parentCommentId?: string) {
    const transaction = await sequelize.transaction();
    
    try {
      const comment = await PostComment.create({
        postId,
        userId,
        content,
        parentCommentId,
        likeCount: 0,
        isDeleted: false,
      }, { transaction });

      // ✅ Increment comments count (fixed field name)
      await Post.increment('commentsCount', {
        by: 1,
        where: { id: postId },
        transaction
      });

      await transaction.commit();

      // Fetch comment with user details
      const commentWithUser = await PostComment.findByPk(comment.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        }],
      });

      return commentWithUser;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getPostComments(postId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const { rows: comments, count } = await PostComment.findAndCountAll({
      where: { 
        postId,
        isDeleted: false,
        parentCommentId: undefined // Only top-level comments
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'avatarUrl'],
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalComments: count,
        limit,
      },
    };
  }

  async deleteComment(commentId: string, userId: string) {
    const transaction = await sequelize.transaction();
    
    try {
      const comment = await PostComment.findOne({
        where: { id: commentId, userId }
      });

      if (!comment) {
        throw new Error('Comment not found or unauthorized');
      }

      await comment.update({ isDeleted: true }, { transaction });

      // ✅ Decrement comments count (fixed field name)
      await Post.decrement('commentsCount', {
        by: 1,
        where: { id: comment.postId },
        transaction
      });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new PostCommentService();
