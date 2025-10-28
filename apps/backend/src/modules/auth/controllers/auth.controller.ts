import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { successResponse } from '../../../shared/utils/response.util';

class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      return successResponse(
        res,
        'Registration successful. Your account is ready to use!',
        result,
        201
      );
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      return successResponse(res, 'Login successful', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real application, you might want to invalidate the refresh token here
      return successResponse(res, 'Logout successful');
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      return successResponse(res, 'Token refreshed successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get current user
   */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await authService.getUserById(userId);

      return successResponse(res, 'User retrieved successfully', { user });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);

      return successResponse(
        res,
        'If an account exists with this email, a password reset link has been sent.'
      );
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);

      return successResponse(res, 'Password has been reset successfully');
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      await authService.verifyEmail(token);

      return successResponse(res, 'Email verified successfully');
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.resendVerification(email);

      return successResponse(res, 'Verification email sent');
    } catch (error: any) {
      next(error);
    }
  }
}

export default new AuthController();
