import { Request, Response, NextFunction } from 'express';
import devotionalService from '../services/devotional.service';
import { successResponse } from '../../../shared/utils/response.util';

class DevotionalController {
  /**
   * Get all devotionals
   */
  async getDevotionals(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 20 } = req.query;

      const result = await devotionalService.getDevotionals(
        Number(page),
        Number(limit),
        userId
      );

      return successResponse(res, 'Devotionals retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get today's devotional
   */
  async getTodaysDevotional(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      const devotional = await devotionalService.getTodaysDevotional(userId);

      return successResponse(res, 'Today\'s devotional retrieved successfully', { devotional });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get devotional by ID
   */
  async getDevotionalById(req: Request, res: Response, next: NextFunction) {
    try {
      const { devotionalId } = req.params;
      const userId = req.user?.id;

      const devotional = await devotionalService.getDevotionalById(devotionalId, userId);

      return successResponse(res, 'Devotional retrieved successfully', { devotional });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Mark devotional as complete
   */
  async markAsComplete(req: Request, res: Response, next: NextFunction) {
    try {
      const { devotionalId } = req.params;
      const userId = req.user!.id;

      const progress = await devotionalService.markAsComplete(devotionalId, userId);

      return successResponse(res, 'Devotional marked as complete', { progress });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Add or update notes
   */
  async addNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { devotionalId } = req.params;
      const userId = req.user!.id;
      const { notes } = req.body;

      const progress = await devotionalService.addNotes(devotionalId, notes, userId);

      return successResponse(res, 'Notes saved successfully', { progress });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get user's devotional progress
   */
  async getUserProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20 } = req.query;

      const result = await devotionalService.getUserProgress(
        userId,
        Number(page),
        Number(limit)
      );

      return successResponse(res, 'Progress retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get user's stats
   */
  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const stats = await devotionalService.getUserStats(userId);

      return successResponse(res, 'Stats retrieved successfully', { stats });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new DevotionalController();
