import { Request, Response, NextFunction } from 'express';
import videoCallService from '../services/video-call.service';
import { successResponse } from '../../../shared/utils/response.util';

class VideoCallController {
  async createCall(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const call = await videoCallService.createCall(userId, req.body);
      return successResponse(res, 'Video call created successfully', { call }, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async joinCall(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { callId } = req.params;
      const result = await videoCallService.joinCall(callId, userId);
      return successResponse(res, 'Joined call successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  async leaveCall(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { callId } = req.params;
      await videoCallService.leaveCall(callId, userId);
      return successResponse(res, 'Left call successfully');
    } catch (error: any) {
      next(error);
    }
  }

  async endCall(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { callId } = req.params;
      const call = await videoCallService.endCall(callId, userId);
      return successResponse(res, 'Call ended successfully', { call });
    } catch (error: any) {
      next(error);
    }
  }

  async getCallById(req: Request, res: Response, next: NextFunction) {
    try {
      const { callId } = req.params;
      const result = await videoCallService.getCallById(callId);
      return successResponse(res, 'Call retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  async getActiveCalls(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const calls = await videoCallService.getActiveCalls(page, limit);
      return successResponse(res, 'Active calls retrieved successfully', calls);
    } catch (error: any) {
      next(error);
    }
  }

  async getScheduledCalls(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const calls = await videoCallService.getScheduledCalls(page, limit);
      return successResponse(res, 'Scheduled calls retrieved successfully', calls);
    } catch (error: any) {
      next(error);
    }
  }

  async getCallHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await videoCallService.getCallHistory(userId, page, limit);
      return successResponse(res, 'Call history retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  async updateParticipantStatus(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(res, 'Participant status updated (not implemented)');
    } catch (error: any) {
      next(error);
    }
  }
}

export default new VideoCallController();
