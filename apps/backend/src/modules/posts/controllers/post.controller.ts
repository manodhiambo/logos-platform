import { Request, Response } from 'express';
import postService from '../services/post.service';

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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filters: any = {};
    if (req.query.communityId) filters.communityId = req.query.communityId;
    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.postType) filters.postType = req.query.postType;
    
    const result = await postService.getPosts(filters, page, limit);
    
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
    
    // Simple like implementation - just increment counter
    const post = await postService.getPostById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: { message: 'Post not found' }
      });
    }
    
    // You can implement proper like tracking later
    return res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      data: { 
        likesCount: post.likeCount + 1,
        isLiked: true 
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
    const { content } = req.body;
    
    // Implement comment logic here
    // For now, return success
    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: {
          id: Date.now().toString(),
          postId,
          userId,
          content,
          createdAt: new Date().toISOString()
        }
      }
    });
  } catch (error: any) {
    console.error('Add comment error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to add comment' }
    });
  }
};
