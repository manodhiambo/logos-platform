import bcrypt from 'bcryptjs';
import User, { UserStatus } from '../../../database/models/user.model';
import { Op } from 'sequelize';
import { logger } from '../../../shared/utils/logger.util';
import { jwtUtil } from '../../../shared/utils/jwt.util';

class AuthService {
  /**
   * Register a new user
   */
  async register(data: any) {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Check username
    const existingUsername = await User.findOne({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user with email auto-verified for testing
    const user = await User.create({
      email: data.email,
      username: data.username,
      passwordHash: hashedPassword,
      fullName: data.fullName,
      spiritualJourneyStage: data.spiritualJourneyStage || 'new_believer',
      emailVerified: true, // AUTO-VERIFY FOR TESTING
      status: UserStatus.ACTIVE,
      role: 'user',
      preferredBibleTranslation: 'NKJV',
      notificationSettings: {
        email: true,
        push: true,
        prayer: true,
        devotional: true,
        announcements: true,
      },
      isDeleted: false,
    } as any);

    // Generate tokens
    const tokens = jwtUtil.generateTokenPair({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    logger.info(`New user registered: ${user.email} (Auto-verified for testing)`);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
      },
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string) {
    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('Account is deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate tokens
    const tokens = jwtUtil.generateTokenPair({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwtUtil.verifyRefreshToken(refreshToken);
      const user = await User.findByPk(decoded.userId);

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new Error('Invalid refresh token');
      }

      const tokens = jwtUtil.generateTokenPair({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });

      return {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Forgot password - Generate reset token
   */
  async forgotPassword(email: string) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return; // Don't reveal if email exists
    }

    // Generate reset token
    const resetToken = jwtUtil.generatePasswordResetToken();
    const hashedToken = jwtUtil.hashToken(resetToken);

    // Save hashed token to user (expires in 1 hour)
    await user.update({
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 3600000),
    });

    logger.info(`Password reset requested for: ${email}`);
    logger.info(`Reset token (for testing): ${resetToken}`);

    return resetToken;
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string) {
    const hashedToken = jwtUtil.hashToken(token);

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await user.update({
      passwordHash: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    logger.info(`Password reset successful for: ${user.email}`);
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    const hashedToken = jwtUtil.hashToken(token);

    const user = await User.findOne({
      where: { emailVerificationToken: hashedToken },
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    await user.update({
      emailVerified: true,
      emailVerificationToken: undefined,
    });

    logger.info(`Email verified for: ${user.email}`);
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return; // Don't reveal if email exists
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    logger.info(`Verification email resent to: ${email}`);
  }
}

export default new AuthService();
