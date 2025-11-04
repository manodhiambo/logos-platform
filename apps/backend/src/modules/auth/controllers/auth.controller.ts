import { Request, Response, NextFunction } from 'express';
import User from '../../../database/models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { successResponse } from '../../../shared/utils/response.util';
import { logger } from '../../../shared/utils/logger.util';

// Multer configuration for avatar upload
const uploadDir = path.join(__dirname, '../../../uploads/avatars');
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, username, password, fullName } = req.body;
      
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: { message: 'Email already registered' }
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        email,
        username,
        passwordHash: hashedPassword,
        fullName,
        role: 'user' as any,
        emailVerified: false,
      } as any);

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      return successResponse(res, 'Registration successful', {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
        },
        token,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid credentials' }
        });
      }
      
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid credentials' }
        });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      await user.update({ lastLoginAt: new Date() });

      return successResponse(res, 'Login successful', {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      return successResponse(res, 'User retrieved successfully', {
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
          emailVerified: user.emailVerified,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
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

      return successResponse(res, 'Profile updated successfully', {
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
      });
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
        
        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: { message: 'User not found' }
          });
        }

        await user.update({ avatarUrl });

        return successResponse(res, 'Avatar uploaded successfully', {
          avatarUrl: user.avatarUrl
        });
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

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: { message: 'Current password is incorrect' }
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await user.update({ passwordHash: hashedPassword });

      return successResponse(res, 'Password updated successfully');
    } catch (error) {
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
      return successResponse(res, 'Token refresh not implemented yet');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(res, 'Password reset email sent (not implemented)');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(res, 'Password reset successful (not implemented)');
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(res, 'Email verified (not implemented)');
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      return successResponse(res, 'Verification email sent (not implemented)');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
