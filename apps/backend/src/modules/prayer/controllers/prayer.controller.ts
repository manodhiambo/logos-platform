import { Request, Response, NextFunction } from 'express';
import prayerService from '../services/prayer.service';
import { successResponse } from '../../../shared/utils/response.util';

class PrayerController {
  /**
   * Create a prayer request
   */
  async createPrayerRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const prayerRequest = await prayerService.createPrayerRequest(req.body, userId);

      return successResponse(res, 'Prayer request created successfully', { prayerRequest }, 201);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get prayer requests
   */
  async getPrayerRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const {
        category,
        status,
        userId: filterUserId,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {
        category,
        status,
        userId: filterUserId,
      };

      const result = await prayerService.getPrayerRequests(
        filters,
        userId,
        Number(page),
        Number(limit)
      );

      return successResponse(res, 'Prayer requests retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get prayer request by ID
   */
  async getPrayerRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const userId = req.user?.id;

      const prayerRequest = await prayerService.getPrayerRequestById(requestId, userId);

      return successResponse(res, 'Prayer request retrieved successfully', { prayerRequest });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update prayer request
   */
  async updatePrayerRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const userId = req.user!.id;

      const prayerRequest = await prayerService.updatePrayerRequest(requestId, req.body, userId);

      return successResponse(res, 'Prayer request updated successfully', { prayerRequest });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete prayer request
   */
  async deletePrayerRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const userId = req.user!.id;

      const result = await prayerService.deletePrayerRequest(requestId, userId);

      return successResponse(res, result.message);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Pray for a request
   */
  async prayForRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const userId = req.user!.id;
      const { message } = req.body;

      const result = await prayerService.prayForRequest(requestId, message, userId);

      return successResponse(res, 'Your prayer has been recorded', result, 201);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get prayers for a request
   */
  async getPrayers(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const result = await prayerService.getPrayers(
        requestId,
        Number(page),
        Number(limit)
      );

      return successResponse(res, 'Prayers retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update prayer request status
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const userId = req.user!.id;
      const { status, testimony } = req.body;

      const prayerRequest = await prayerService.updateStatus(requestId, status, testimony, userId);

      return successResponse(res, 'Prayer request status updated successfully', { prayerRequest });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get user's own prayer requests
   */
  async getMyPrayerRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20 } = req.query;

      const result = await prayerService.getUserPrayerRequests(
        userId,
        Number(page),
        Number(limit)
      );

      return successResponse(res, 'Your prayer requests retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }
}

export default new PrayerController();
