import { Request, Response } from 'express';
import FriendshipService from '../services/friendship.service';

export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const requesterId = req.user?.id;
    const { addresseeId } = req.body;

    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const friendship = await FriendshipService.sendFriendRequest(
      requesterId,
      addresseeId
    );

    res.status(201).json({
      message: 'Friend request sent successfully',
      data: friendship,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { friendshipId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const friendship = await FriendshipService.acceptFriendRequest(
      friendshipId,
      userId
    );

    res.json({
      message: 'Friend request accepted',
      data: friendship,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { friendshipId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const friendship = await FriendshipService.rejectFriendRequest(
      friendshipId,
      userId
    );

    res.json({
      message: 'Friend request rejected',
      data: friendship,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const removeFriend = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { friendshipId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await FriendshipService.removeFriend(friendshipId, userId);

    res.json({ message: 'Friend removed successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await FriendshipService.getFriends(userId, page, limit);

    res.json({
      message: 'Friends retrieved successfully',
      data: result.friends,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await FriendshipService.getPendingRequests(userId, page, limit);

    res.json({
      message: 'Pending requests retrieved successfully',
      data: result.requests,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getSentRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await FriendshipService.getSentRequests(userId, page, limit);

    res.json({
      message: 'Sent requests retrieved successfully',
      data: result.requests,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const checkFriendshipStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { otherUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const status = await FriendshipService.checkFriendshipStatus(
      userId,
      otherUserId
    );

    res.json({
      message: 'Friendship status retrieved',
      data: status,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const followUser = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const { userId } = req.body;

    if (!followerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const follow = await FriendshipService.followUser(followerId, userId);

    res.status(201).json({
      message: 'User followed successfully',
      data: follow,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const { userId } = req.params;

    if (!followerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await FriendshipService.unfollowUser(followerId, userId);

    res.json({ message: 'User unfollowed successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await FriendshipService.getFollowers(userId, page, limit);

    res.json({
      message: 'Followers retrieved successfully',
      data: result.followers,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await FriendshipService.getFollowing(userId, page, limit);

    res.json({
      message: 'Following retrieved successfully',
      data: result.following,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const isFollowing = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const { userId } = req.params;

    if (!followerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const isFollowing = await FriendshipService.isFollowing(followerId, userId);

    res.json({
      message: 'Follow status retrieved',
      data: { isFollowing },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { query } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const result = await FriendshipService.searchUsers(query, userId, page, limit);

    res.json({
      message: 'Users retrieved successfully',
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
