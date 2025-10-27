import { Request, Response, NextFunction } from 'express';
import postService from '../services/post.service';
import commentService from '../services/comment.service';
import { successResponse } from '../../../shared/utils/response.util';

class PostController {
  /**
   * Create a new post
   */
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const post = await postService.createPost(req.body, userId);

      return successResponse(res, 'Post created successfully', { post }, 201);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get posts feed
   */
  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const {
        communityId,
        postType,
        authorId,
        sort = 'recent',
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {
        communityId,
        postType,
        authorId,
        sort,
      };

      const result = await postService.getPosts(
        filters,
        userId,
        Number(page),
        Number(limit)
      );

      return successResponse(res, 'Posts retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get post by ID
   */
  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      const post = await postService.getPostById(postId, userId);

      return successResponse(res, 'Post retrieved successfully', { post });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update post
   */
  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;

      const post = await postService.updatePost(postId, req.body, userId);

      return successResponse(res, 'Post updated successfully', { post });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete post
   */
  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;

      const result = await postService.deletePost(postId, userId);

      return successResponse(res, result.message);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Toggle like on post
   */
  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;

      const result = await postService.toggleLike(postId, userId);

      return successResponse(
        res,
        result.liked ? 'Post liked successfully' : 'Post unliked successfully',
        result
      );
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get comments for a post
   */
  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;
      const { page = 1, limit = 50 } = req.query;

      const result = await commentService.getComments(
        postId,
        userId,
        Number(page),
        Number(limit)
      );

      return successResponse(res, 'Comments retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Add comment to post
   */
  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;

      const comment = await commentService.addComment(postId, req.body, userId);

      return successResponse(res, 'Comment added successfully', { comment }, 201);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Pin/Unpin post
   */
  async togglePin(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;

      const post = await postService.togglePin(postId, userId);

      return successResponse(
        res,
        post.isPinned ? 'Post pinned successfully' : 'Post unpinned successfully',
        { post }
      );
    } catch (error: any) {
      next(error);
    }
  }
}

export default new PostController();
