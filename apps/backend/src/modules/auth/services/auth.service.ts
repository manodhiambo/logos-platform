import User from '../../../database/models/user.model';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { emailService } from '../../../shared/utils/email.util';
import { jwtUtil } from '../../../shared/utils/jwt.util';
import { logger } from '../../../shared/utils/logger.util';

interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName: string;
  spiritualJourneyStage?: string;
  denomination?: string;
  country?: string;
  timezone?: string;
}

interface LoginResult {
  user: any;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private createJWTPayload(user: any) {
    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  async register(data: RegisterData): Promise<{ user: any; needsVerification: boolean }> {
    try {
      const existingUser = await User.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new Error('Email already registered');
      }

      const existingUsername = await User.findOne({ where: { username: data.username } });
      if (existingUsername) {
        throw new Error('Username already taken');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const verificationCode = this.generateVerificationCode();
      const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

      const user = await User.create({
        email: data.email,
        username: data.username,
        passwordHash: hashedPassword,
        fullName: data.fullName,
        spiritualJourneyStage: data.spiritualJourneyStage || 'new_believer',
        denomination: data.denomination,
        country: data.country,
        timezone: data.timezone,
        emailVerified: false,
        emailVerificationToken: verificationCode,
        emailVerificationExpires: verificationExpires,
        role: 'user' as any,
        status: 'active' as any,
      } as any);

      await emailService.sendVerificationEmail(user.email, verificationCode, user.username);

      logger.info(`User registered: ${user.email}, verification code sent`);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
        },
        needsVerification: true,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async verifyEmail(email: string, code: string): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerified) {
        throw new Error('Email already verified');
      }

      if (!user.emailVerificationToken || user.emailVerificationToken !== code) {
        throw new Error('Invalid verification code');
      }

      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        throw new Error('Verification code expired');
      }

      await user.update({
        emailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined,
      });

      await emailService.sendWelcomeEmail(user.email, user.username);

      const jwtPayload = this.createJWTPayload(user);
      const accessToken = jwtUtil.generateAccessToken(jwtPayload);
      const refreshToken = jwtUtil.generateRefreshToken(jwtPayload);

      logger.info(`Email verified for user: ${user.email}`);

      return {
        user: user.toSafeObject(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  async resendVerificationCode(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerified) {
        throw new Error('Email already verified');
      }

      const verificationCode = this.generateVerificationCode();
      const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

      await user.update({
        emailVerificationToken: verificationCode,
        emailVerificationExpires: verificationExpires,
      });

      await emailService.sendVerificationEmail(user.email, verificationCode, user.username);

      logger.info(`Verification code resent to: ${user.email}`);

      return true;
    } catch (error) {
      logger.error('Resend verification error:', error);
      throw error;
    }
  }

  async login(emailOrUsername: string, password: string, rememberMe: boolean = false): Promise<LoginResult> {
    try {
      const user = await User.findOne({
        where: {
          [emailOrUsername.includes('@') ? 'email' : 'username']: emailOrUsername,
        },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (user.status !== 'active') {
        throw new Error(`Account is ${user.status}. Please contact support.`);
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      if (!user.emailVerified) {
        throw new Error('Please verify your email before logging in');
      }

      await user.update({ lastLoginAt: new Date() });

      const jwtPayload = this.createJWTPayload(user);
      const accessToken = jwtUtil.generateAccessToken(jwtPayload);
      const refreshToken = jwtUtil.generateRefreshToken(jwtPayload);

      logger.info(`User logged in: ${user.email}`);

      return {
        user: user.toSafeObject(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwtUtil.verifyRefreshToken(refreshToken);

      const user = await User.findByPk(decoded.userId);

      if (!user || !user.emailVerified || user.status !== 'active') {
        throw new Error('Invalid refresh token');
      }

      const jwtPayload = this.createJWTPayload(user);
      const newAccessToken = jwtUtil.generateAccessToken(jwtPayload);
      const newRefreshToken = jwtUtil.generateRefreshToken(jwtPayload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new Error('Invalid or expired refresh token');
    }
  }

  async forgotPassword(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return true;
      }

      const resetToken = this.generateResetToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

      await user.update({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      });

      await emailService.sendPasswordResetEmail(user.email, resetToken, user.username);

      logger.info(`Password reset email sent to: ${user.email}`);

      return true;
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await User.findOne({
        where: {
          passwordResetToken: token,
        },
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        throw new Error('Reset token has expired');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await user.update({
        passwordHash: hashedPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      });

      logger.info(`Password reset successful for user: ${user.email}`);

      return true;
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updateData: any) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const allowedFields = [
        'fullName',
        'bio',
        'avatarUrl',
        'spiritualJourneyStage',
        'denomination',
        'country',
        'timezone',
        'preferredBibleTranslation',
      ];

      const updateObject: any = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateObject[field] = updateData[field];
        }
      });

      await user.update(updateObject);

      return user.toSafeObject();
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await user.update({ passwordHash: hashedPassword });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      await user.update({ avatarUrl });

      return {
        avatarUrl: user.avatarUrl,
      };
    } catch (error) {
      throw error;
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return user.toSafeObject();
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
