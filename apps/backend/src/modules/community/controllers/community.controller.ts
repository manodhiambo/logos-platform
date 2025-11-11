import { Request, Response } from 'express';
import CommunityService from '../services/community.service';

export const createCommunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const community = await CommunityService.createCommunity(userId, req.body);
    res.status(201).json({
      message: 'Community created successfully',
      data: community,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getCommunities = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      category: req.query.category,
      privacyLevel: req.query.privacyLevel,
      search: req.query.search,
    };

    const result = await CommunityService.getCommunities(filters, page, limit);
    res.json({
      message: 'Communities retrieved successfully',
      data: result.communities,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getCommunityById = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const userId = req.user?.id;

    const community = await CommunityService.getCommunityById(communityId, userId);
    res.json({
      message: 'Community retrieved successfully',
      data: community,
    });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const joinCommunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { communityId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const member = await CommunityService.joinCommunity(communityId, userId);
    res.status(201).json({
      message: 'Successfully joined community',
      data: member,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const leaveCommunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { communityId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await CommunityService.leaveCommunity(communityId, userId);
    res.json({ message: 'Successfully left community' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getCommunityMembers = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await CommunityService.getCommunityMembers(communityId, page, limit);
    res.json({
      message: 'Members retrieved successfully',
      data: result.members,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCommunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { communityId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const community = await CommunityService.updateCommunity(
      communityId,
      userId,
      req.body
    );
    res.json({
      message: 'Community updated successfully',
      data: community,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCommunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { communityId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await CommunityService.deleteCommunity(communityId, userId);
    res.json({ message: 'Community deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyCommunities = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await CommunityService.getMyCommunities(userId, page, limit);
    res.json({
      message: 'Your communities retrieved successfully',
      data: result.communities,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
