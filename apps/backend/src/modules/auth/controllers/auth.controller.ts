import { Request, Response } from 'express';
import authService from '../services/auth.service';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await authService.updateProfile(userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to update profile' }
    });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    await authService.updatePassword(userId, currentPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    console.error('Update password error:', error);
    return res.status(400).json({
      success: false,
      error: { message: error.message || 'Failed to update password' }
    });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' }
      });
    }

    // Construct avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const result = await authService.updateAvatar(userId, avatarUrl);

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to upload avatar' }
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await authService.getProfile(userId);

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get profile' }
    });
  }
};
