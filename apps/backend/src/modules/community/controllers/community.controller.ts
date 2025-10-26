import { Request, Response, NextFunction } from 'express';
import communityService from '../services/community.service';
import { successResponse, errorResponse } from '../../../shared/utils/response.util';

class CommunityController {
  /**
   * Create a new community
   */
  async createCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const community = await communityService.createCommunity(req.body, userId);

      return successResponse(res, 'Community created successfully', community, 201);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get all communities
   */
  async getCommunities(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search, page = 1, limit = 20, mycommunities } = req.query;
      
      if (mycommunities === 'true') {
        const userId = req.user?.id;
        if (!userId) {
          return errorResponse(res, 'Authentication required', 401);
        }
        const result = await communityService.getUserCommunities(
          userId,
          Number(page),
          Number(limit)
        );
        return successResponse(res, 'User communities retrieved successfully', result);
      }

      const filters = { category, search };
      const result = await communityService.getCommunities(
        filters,
        Number(page),
        Number(limit)
      );

      return successResponse(res, 'Communities retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get community by ID
   */
  async getCommunityById(req: Request, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user?.id;

      const result = await communityService.getCommunityById(communityId, userId);

      return successResponse(res, 'Community retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update community
   */
  async updateCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;

      const community = await communityService.updateCommunity(
        communityId,
        req.body,
        userId
      );

      return successResponse(res, 'Community updated successfully', community);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete community
   */
  async deleteCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;

      const result = await communityService.deleteCommunity(communityId, userId);

      return successResponse(res, result.message);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Join community
   */
  async joinCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;

      const membership = await communityService.joinCommunity(communityId, userId);

      return successResponse(res, 'Successfully joined the community', membership);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Leave community
   */
  async leaveCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;

      const result = await communityService.leaveCommunity(communityId, userId);

      return successResponse(res, result.message);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get community members
   */
  async getCommunityMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const result = await communityService.getCommunityMembers(
        communityId,
        Number(page),
        Number(limit)
      );

      return successResponse(res, 'Community members retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { communityId, memberId } = req.params;
      const { role } = req.body;
      const requesterId = req.user!.id;

      const membership = await communityService.updateMemberRole(
        communityId,
        memberId,
        role,
        requesterId
      );

      return successResponse(res, 'Member role updated successfully', membership);
    } catch (error: any) {
      next(error);
    }
  }
}

export default new CommunityController();
