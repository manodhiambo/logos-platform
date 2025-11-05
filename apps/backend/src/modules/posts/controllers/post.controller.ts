import { Request, Response } from 'express';
import postService from '../services/post.service';
import postLikeService from '../services/post-like.service';
import postCommentService from '../services/post-comment.service';

export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const post = await postService.createPost(userId, req.body);
    
    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error: any) {
    console.error('Create post error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to create post' }
    });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filters: any = {};
    if (req.query.communityId) filters.communityId = req.query.communityId;
    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.postType) filters.postType = req.query.postType;
    
    const result = await postService.getPosts(filters, page, limit);
    
    if (userId) {
      for (const post of result.posts) {
        (post as any).isLiked = await postLikeService.hasUserLiked(post.id, userId);
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Posts retrieved successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Get posts error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get posts' }
    });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const post = await postService.getPostById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: { message: 'Post not found' }
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Post retrieved successfully',
      data: { post }
    });
  } catch (error: any) {
    console.error('Get post error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get post' }
    });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId } = req.params;
    
    const post = await postService.updatePost(postId, userId, req.body);
    
    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (error: any) {
    console.error('Update post error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to update post' }
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId } = req.params;
    
    await postService.deletePost(postId, userId);
    
    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete post error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to delete post' }
    });
  }
};

export const likePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId } = req.params;
    
    const result = await postLikeService.toggleLike(postId, userId);
    
    const post = await postService.getPostById(postId);
    
    return res.status(200).json({
      success: true,
      message: `Post ${result.action} successfully`,
      data: { 
        ...result,
        likeCount: post?.likesCount || 0
      }
    });
  } catch (error: any) {
    console.error('Like post error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to like post' }
    });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Comment content is required' }
      });
    }
    
    const comment = await postCommentService.addComment(postId, userId, content, parentCommentId);
    
    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment }
    });
  } catch (error: any) {
    console.error('Add comment error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to add comment' }
    });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await postCommentService.getPostComments(postId, page, limit);
    
    return res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get comments' }
    });
  }
};
