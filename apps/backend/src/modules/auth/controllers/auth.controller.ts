import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { successResponse } from '../../../shared/utils/response.util';
import { logger } from '../../../shared/utils/logger.util';
import { uploadAvatar } from '../../../shared/middlewares/upload.middleware';

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, 'Registration successful', result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { emailOrUsername, password, rememberMe } = req.body;
      const result = await authService.login(emailOrUsername, password, rememberMe);
      return successResponse(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await authService.logout(userId);
      return successResponse(res, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      return successResponse(res, 'Token refreshed', result);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;
      await authService.verifyEmail(token as string);
      return successResponse(res, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.resendVerificationEmail(email);
      return successResponse(res, 'Verification email sent');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      return successResponse(res, 'Password reset email sent');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      return successResponse(res, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await authService.getUserProfile(userId);
      return successResponse(res, 'Profile retrieved', { user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await authService.updateProfile(userId, req.body);
      return successResponse(res, 'Profile updated', { user });
    } catch (error) {
      next(error);
    }
  }

  uploadAvatar(req: Request, res: Response, next: NextFunction) {
    uploadAvatar.single('avatar')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: { message: err.message || 'File upload failed' }
        });
      }

      try {
        const userId = (req as any).user.id;
        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: { message: 'No file uploaded' }
          });
        }

        // Cloudinary returns the secure URL in req.file.path
        const avatarUrl = (req.file as any).path;

        const result = await authService.updateAvatar(userId, avatarUrl);
        return successResponse(res, 'Avatar uploaded successfully', result);
      } catch (error) {
        next(error);
      }
    });
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: { message: 'Current password and new password are required' }
        });
      }

      await authService.updatePassword(userId, currentPassword, newPassword);
      return successResponse(res, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: { message: 'Password is required to delete account' }
        });
      }

      await authService.deleteAccount(userId, password);
      return successResponse(res, 'Account deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
