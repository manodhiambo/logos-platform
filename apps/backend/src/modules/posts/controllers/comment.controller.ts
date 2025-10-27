import { Request, Response, NextFunction } from 'express';
import commentService from '../services/comment.service';
import { successResponse } from '../../../shared/utils/response.util';

class CommentController {
  /**
   * Update comment
   */
  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;
      const { content } = req.body;

      const comment = await commentService.updateComment(commentId, content, userId);

      return successResponse(res, 'Comment updated successfully', { comment });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete comment
   */
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;

      const result = await commentService.deleteComment(commentId, userId);

      return successResponse(res, result.message);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Toggle like on comment
   */
  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;

      const result = await commentService.toggleLike(commentId, userId);

      return successResponse(
        res,
        result.liked ? 'Comment liked successfully' : 'Comment unliked successfully',
        result
      );
    } catch (error: any) {
      next(error);
    }
  }
}

export default new CommentController();
