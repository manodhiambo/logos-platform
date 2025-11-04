import { Request, Response } from 'express';
import User from '../../../database/models/user.model';
import bcrypt from 'bcryptjs';
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

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const allowedFields = [
      'fullName',
      'bio',
      'spiritualJourneyStage',
      'denomination',
      'country',
      'timezone',
      'preferredBibleTranslation',
    ];

    const updateData: any = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    await user.update(updateData);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          role: user.role,
          spiritualJourneyStage: user.spiritualJourneyStage,
          denomination: user.denomination,
          country: user.country,
          timezone: user.timezone,
          preferredBibleTranslation: user.preferredBibleTranslation,
        }
      }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to update profile' }
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

    const avatarUrl = `${process.env.API_URL || 'http://localhost:3000'}/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    await user.update({ avatarUrl });

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to upload avatar' }
    });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Current password and new password are required' }
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: { message: 'Current password is incorrect' }
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({ passwordHash: hashedPassword });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    console.error('Update password error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to update password' }
    });
  }
};
