import { Request, Response } from 'express';
import statusService from '../services/status.service';

export const createStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { content, mediaUrl, mediaType, backgroundColor, textColor } = req.body;

    const status = await statusService.createStatus(userId, {
      content,
      mediaUrl,
      mediaType,
      backgroundColor,
      textColor,
    });

    return res.status(201).json({
      success: true,
      message: 'Status created successfully',
      data: status,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: { message: error.message || 'Failed to create status' },
    });
  }
};

export const getFeedStatuses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;

    const result = await statusService.getFeedStatuses(userId, page, limit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch statuses' },
    });
  }
};

export const getStatusesByUser = async (req: Request, res: Response) => {
  try {
    const groups = await statusService.getStatusesByUser();

    return res.status(200).json({
      success: true,
      data: { groups },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch statuses' },
    });
  }
};

export const getMyStatuses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const statuses = await statusService.getUserStatuses(userId);

    return res.status(200).json({
      success: true,
      data: { statuses },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch your statuses' },
    });
  }
};

export const getUserStatuses = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const statuses = await statusService.getUserStatuses(userId);

    return res.status(200).json({
      success: true,
      data: { statuses },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch user statuses' },
    });
  }
};

export const viewStatus = async (req: Request, res: Response) => {
  try {
    const viewerId = (req as any).user.id;
    const { statusId } = req.params;

    const status = await statusService.viewStatus(statusId, viewerId);

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: { message: error.message || 'Status not found' },
    });
  }
};

export const deleteStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { statusId } = req.params;

    await statusService.deleteStatus(statusId, userId);

    return res.status(200).json({
      success: true,
      message: 'Status deleted successfully',
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: { message: error.message || 'Failed to delete status' },
    });
  }
};

export const cleanupStatuses = async (req: Request, res: Response) => {
  try {
    const count = await statusService.cleanupExpiredStatuses();
    return res.status(200).json({
      success: true,
      message: `Cleaned up ${count} expired statuses`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Cleanup failed' },
    });
  }
};
