import { Request, Response, NextFunction } from 'express';
import videoCallService from '../services/video-call.service';
import { successResponse } from '../../../shared/utils/response.util';

class VideoCallController {
  /**
   * Create a new video call
   */
  async createCall(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { title, description, type, purpose, scheduledAt, maxParticipants, relatedTo, relatedType } = req.body;

      const call = await videoCallService.createCall(userId, {
        title,
        description,
        type,
        purpose,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        maxParticipants,
        relatedTo,
        relatedType,
      });

      return successResponse(res, 'Video call created successfully', { call }, 201);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Join a video call
   */
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

  /**
   * Leave a video call
   */
  async leaveCall(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { callId } = req.params;

      const participant = await videoCallService.leaveCall(callId, userId);

      return successResponse(res, 'Left call successfully', { participant });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * End a video call
   */
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

  /**
   * Get call details
   */
  async getCallById(req: Request, res: Response, next: NextFunction) {
    try {
      const { callId } = req.params;

      const result = await videoCallService.getCallById(callId);

      return successResponse(res, 'Call details retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get active calls
   */
  async getActiveCalls(req: Request, res: Response, next: NextFunction) {
    try {
      const { purpose, relatedTo, relatedType } = req.query;

      const calls = await videoCallService.getActiveCalls({
        purpose: purpose as any,
        relatedTo: relatedTo as string,
        relatedType: relatedType as string,
      });

      return successResponse(res, 'Active calls retrieved successfully', { calls });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get scheduled calls
   */
  async getScheduledCalls(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      const calls = await videoCallService.getScheduledCalls(userId);

      return successResponse(res, 'Scheduled calls retrieved successfully', { calls });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get user's call history
   */
  async getCallHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20 } = req.query;

      const result = await videoCallService.getUserCallHistory(
        userId,
        Number(page),
        Number(limit)
      );

      return successResponse(res, 'Call history retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update participant status
   */
  async updateParticipantStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { callId } = req.params;
      const { isMuted, isVideoOff } = req.body;

      const participant = await videoCallService.updateParticipantStatus(callId, userId, {
        isMuted,
        isVideoOff,
      });

      return successResponse(res, 'Participant status updated', { participant });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new VideoCallController();
