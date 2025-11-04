import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { successResponse } from '../../../shared/utils/response.util';
import { logger } from '../../../shared/utils/logger.util';

const uploadDir = path.join(__dirname, '../../../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, username, password, fullName, spiritualJourneyStage, denomination, country, timezone } = req.body;
      
      const result = await authService.register({
        email,
        username,
        password,
        fullName,
        spiritualJourneyStage,
        denomination,
        country,
        timezone,
      });

      return successResponse(
        res,
        'Registration successful! Please check your email for verification code.',
        result,
        201
      );
    } catch (error: any) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code } = req.body;

      const result = await authService.verifyEmail(email, code);

      return successResponse(res, 'Email verified successfully! Welcome to LOGOS Platform.', result);
    } catch (error: any) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      await authService.resendVerificationCode(email);

      return successResponse(res, 'Verification code sent! Please check your email.');
    } catch (error: any) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { emailOrUsername, password, rememberMe } = req.body;

      const result = await authService.login(emailOrUsername, password, rememberMe || false);

      return successResponse(res, 'Login successful!', result);
    } catch (error: any) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(res, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshAccessToken(refreshToken);

      return successResponse(res, 'Token refreshed successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      await authService.forgotPassword(email);

      return successResponse(
        res,
        'If an account exists with this email, you will receive a password reset link shortly.'
      );
    } catch (error: any) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      await authService.resetPassword(token, password);

      return successResponse(res, 'Password reset successful! You can now login with your new password.');
    } catch (error: any) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await authService.getProfile(userId);

      return successResponse(res, 'User retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await authService.updateProfile(userId, req.body);

      return successResponse(res, 'Profile updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  uploadAvatar(req: Request, res: Response, next: NextFunction) {
    upload.single('avatar')(req, res, async (err) => {
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

        const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
        const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
        
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
}

export default new AuthController();
