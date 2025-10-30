import Comment from '../models/Comment.model';
import CommentLike from '../models/CommentLike.model';
import Post from '../models/Post.model';
import User from '../../../database/models/user.model';
import { Op, literal } from 'sequelize';

class CommentService {
  /**
   * Add comment to post
   */
  async addComment(postId: string, data: any, userId: string) {
    // Check if post exists
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Create comment
    const comment = await Comment.create({
      postId,
      authorId: userId,
      parentCommentId: data.parentCommentId || null,
      content: data.content,
      likesCount: 0,
    });

    // Increment post comments count
    await post.increment('commentCount', { by: 1 });

    // Fetch comment with author details
    const createdComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
    });

    return createdComment;
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: string, userId: string | undefined, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const { rows: comments, count: total } = await Comment.findAndCountAll({
      where: {
        postId,
        parentCommentId: null as any, // Cast to any to bypass TypeScript
        isDeleted: false,
      },
      limit,
      offset,
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
    });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment: any) => {
        const replies = await Comment.findAll({
          where: {
            parentCommentId: comment.id,
            isDeleted: false,
          },
          order: [['createdAt', 'ASC']],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'fullName', 'avatarUrl'],
            },
          ],
        });

        let isLiked = false;
        if (userId) {
          const like = await CommentLike.findOne({
            where: { commentId: comment.id, userId },
          });
          isLiked = !!like;
        }

        return {
          ...comment.toJSON(),
          isLiked,
          replies: replies.map((r: any) => r.toJSON()),
          repliesCount: replies.length,
        };
      })
    );

    return {
      comments: commentsWithReplies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        limit,
      },
    };
  }

  /**
   * Update comment
   */
  async updateComment(commentId: string, content: string, userId: string) {
    const comment = await Comment.findOne({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new Error('Unauthorized: You can only update your own comments');
    }

    await comment.update({ content });

    return comment;
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: string, userId: string) {
    const comment = await Comment.findOne({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new Error('Unauthorized: You can only delete your own comments');
    }

    await comment.update({ isDeleted: true });

    // Decrement post comments count
    const post = await Post.findByPk(comment.postId);
    if (post) {
      await post.decrement('commentCount', { by: 1 });
    }

    return { message: 'Comment deleted successfully' };
  }

  /**
   * Toggle like on comment
   */
  async toggleLike(commentId: string, userId: string) {
    const comment = await Comment.findOne({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    const existingLike = await CommentLike.findOne({
      where: { commentId, userId },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await comment.decrement('likesCount', { by: 1 });

      return {
        liked: false,
        likesCount: comment.likesCount - 1,
      };
    } else {
      // Like
      await CommentLike.create({ commentId, userId });
      await comment.increment('likesCount', { by: 1 });

      return {
        liked: true,
        likesCount: comment.likesCount + 1,
      };
    }
  }
}

export default new CommentService();
