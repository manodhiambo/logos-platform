import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AppError } from '../../../shared/middlewares/error-handler.middleware';

class AuthController {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, tokens } = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: {
          user: user.toSafeObject(),
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { emailOrUsername, password } = req.body;
      const { user, tokens } = await authService.login(emailOrUsername, password);

      res.json({
        success: true,
        message: 'Login successful!',
        data: {
          user: user.toSafeObject(),
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout user (client-side token removal)
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        message: 'Logout successful!',
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify email
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const user = await authService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully! You can now access all features.',
        data: {
          user: user.toSafeObject(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Resend verification email
  async resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.resendVerificationEmail(email);

      res.json({
        success: true,
        message: 'Verification email sent! Please check your inbox.',
      });
    } catch (error) {
      next(error);
    }
  }

  // Forgot password
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);

      res.json({
        success: true,
        message: 'If that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      const user = await authService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Password reset successful! You can now login with your new password.',
        data: {
          user: user.toSafeObject(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully!',
        data: {
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Change password (authenticated user)
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully!',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      res.json({
        success: true,
        data: {
          user: req.user.toSafeObject(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
