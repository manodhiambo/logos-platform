import { Request, Response } from 'express';
import PostService from '../services/post.service';
import PostLikeService from '../services/post-like.service';

export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const post = await PostService.createPost(userId, req.body);
    
    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create post',
    });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { communityId, userId, postType, page = 1, limit = 20 } = req.query;
    
    const filters: any = {};
    if (communityId) filters.communityId = communityId;
    if (userId) filters.userId = userId;
    if (postType) filters.postType = postType;
    
    const result = await PostService.getPosts(
      filters,
      Number(page),
      Number(limit)
    );
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch posts',
    });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const post = await PostService.getPostById(postId);
    
    res.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('Get post error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Post not found',
    });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId } = req.params;
    
    const post = await PostService.updatePost(postId, userId, req.body);
    
    res.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update post',
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId } = req.params;
    
    await PostService.deletePost(postId, userId);
    
    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete post',
    });
  }
};

export const likePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId } = req.params;
    
    const result = await PostLikeService.toggleLike(postId, userId);
    
    res.json({
      success: true,
      data: {
        liked: result.liked,
        message: result.liked ? 'Post liked' : 'Post unliked',
      },
    });
  } catch (error: any) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to like/unlike post',
    });
  }
};

export const getPostLikes = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const likes = await PostLikeService.getPostLikes(postId);
    
    res.json({
      success: true,
      data: likes,
    });
  } catch (error: any) {
    console.error('Get post likes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch post likes',
    });
  }
};
