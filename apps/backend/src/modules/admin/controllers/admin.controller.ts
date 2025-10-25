import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { AppError } from '../../../shared/middlewares/error-handler.middleware';

class AdminController {
  // Get all users
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        role: req.query.role as any,
        status: req.query.status as any,
        search: req.query.search as string,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as string) || 'desc',
        includeDeleted: req.query.includeDeleted === 'true',
      };

      const result = await adminService.getAllUsers(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const user = await adminService.getUserById(userId);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user role
  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { userId } = req.params;
      const { role } = req.body;

      const user = await adminService.updateUserRole(req.user.id, userId, role);

      res.json({
        success: true,
        message: `User role updated to ${role}`,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user status
  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { status, reason } = req.body;

      const user = await adminService.updateUserStatus(userId, status, reason);

      res.json({
        success: true,
        message: `User status updated to ${status}`,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { userId } = req.params;
      const { deleteType, reason } = req.body;

      const result = await adminService.deleteUser(req.user.id, userId, deleteType, reason);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create user manually
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminService.createUser(req.body);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user: user.toSafeObject() },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get system statistics
  async getSystemStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { period } = req.query;
      const stats = await adminService.getSystemStats(period as string);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create announcement
  async createAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const announcement = await adminService.createAnnouncement(req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: { announcement },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update announcement
  async updateAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const { announcementId } = req.params;
      const announcement = await adminService.updateAnnouncement(announcementId, req.body);

      res.json({
        success: true,
        message: 'Announcement updated successfully',
        data: { announcement },
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete announcement
  async deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const { announcementId } = req.params;
      const result = await adminService.deleteAnnouncement(announcementId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all announcements
  async getAllAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await adminService.getAllAnnouncements(page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
