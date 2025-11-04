import { Request, Response, NextFunction } from 'express';
import prayerService from '../services/prayer.service';
import { successResponse } from '../../../shared/utils/response.util';

class PrayerController {
  async createPrayerRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const prayerRequest = await prayerService.createPrayerRequest(userId, req.body);
      return successResponse(res, 'Prayer request created successfully', { prayerRequest }, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getPrayerRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string;
      const status = req.query.status as string;

      const filters: any = {};
      if (category) filters.category = category;
      if (status) filters.status = status;

      const result = await prayerService.getPrayerRequests(filters, page, limit);
      return successResponse(res, 'Prayer requests retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  async getPrayerRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const prayerRequest = await prayerService.getPrayerRequestById(requestId);

      if (!prayerRequest) {
        return res.status(404).json({
          success: false,
          error: { message: 'Prayer request not found' }
        });
      }

      return successResponse(res, 'Prayer request retrieved successfully', { prayerRequest });
    } catch (error: any) {
      next(error);
    }
  }

  async updatePrayerRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { requestId } = req.params;
      const prayerRequest = await prayerService.updatePrayerRequest(requestId, userId, req.body);
      return successResponse(res, 'Prayer request updated successfully', { prayerRequest });
    } catch (error: any) {
      next(error);
    }
  }

  async deletePrayerRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { requestId } = req.params;
      await prayerService.deletePrayerRequest(requestId, userId);
      return successResponse(res, 'Prayer request deleted successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async prayForRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { requestId } = req.params;
      const { message } = req.body;
      const result = await prayerService.prayForRequest(requestId, message, userId);
      return successResponse(res, 'Prayer added successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  async getPrayers(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await prayerService.getPrayers(requestId, page, limit);
      return successResponse(res, 'Prayers retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { requestId } = req.params;
      const { status, testimony } = req.body;
      const prayerRequest = await prayerService.updatePrayerStatus(requestId, userId, status, testimony);
      return successResponse(res, 'Prayer request status updated successfully', { prayerRequest });
    } catch (error: any) {
      next(error);
    }
  }

  async getMyPrayerRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await prayerService.getMyPrayerRequests(userId, page, limit);
      return successResponse(res, 'Your prayer requests retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }
}

export default new PrayerController();
