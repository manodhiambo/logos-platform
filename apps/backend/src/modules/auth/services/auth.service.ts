import User, { UserStatus } from '../../../database/models/user.model';
import { jwtUtil, JWTPayload, TokenPair } from '../../../shared/utils/jwt.util';
import { emailService } from '../../../shared/utils/email.util';
import { AppError } from '../../../shared/middlewares/error-handler.middleware';
import { Op } from 'sequelize';

class AuthService {
  // Register new user
  async register(userData: {
    email: string;
    username: string;
    password: string;
    fullName: string;
    spiritualJourneyStage: string;
    denomination?: string;
    country?: string;
    timezone?: string;
  }): Promise<{ user: User; tokens: TokenPair }> {
    // Check if email already exists
    const existingEmail = await User.findOne({
      where: { email: userData.email },
    });

    if (existingEmail) {
      throw new AppError('Email already registered', 400);
    }

    // Check if username already exists
    const existingUsername = await User.findOne({
      where: { username: userData.username },
    });

    if (existingUsername) {
      throw new AppError('Username already taken', 400);
    }

    // Generate email verification token
    const verificationToken = jwtUtil.generateEmailVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

    // Create user (password will be hashed by model hook)
    const user = await User.create({
      ...userData,
      passwordHash: userData.password,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send welcome and verification emails
    await Promise.all([
      emailService.sendWelcomeEmail(user.email, user.username),
      emailService.sendVerificationEmail(user.email, user.username, verificationToken),
    ]);

    // Generate tokens
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const tokens = jwtUtil.generateTokenPair(payload);

    return { user, tokens };
  }

  // Login user
  async login(emailOrUsername: string, password: string): Promise<{ user: User; tokens: TokenPair }> {
    // Find user by email or username
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is deleted
    if (user.isDeleted) {
      throw new AppError('This account has been deleted', 403);
    }

    // Check if user is suspended or banned
    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    if (user.status === UserStatus.BANNED) {
      throw new AppError('Your account has been banned.', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const tokens = jwtUtil.generateTokenPair(payload);

    return { user, tokens };
  }

  // Verify email
  async verifyEmail(token: string): Promise<User> {
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    // Update user
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return user;
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token
    const resetToken = jwtUtil.generatePasswordResetToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

    // Save token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, user.username, resetToken);
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Update password (will be hashed by model hook)
    user.passwordHash = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return user;
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const decoded = jwtUtil.verifyRefreshToken(refreshToken);

      // Get user
      const user = await User.findByPk(decoded.userId);

      if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new tokens
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      };

      return jwtUtil.generateTokenPair(payload);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  // Change password (authenticated user)
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.emailVerified) {
      throw new AppError('Email already verified', 400);
    }

    // Generate new token
    const verificationToken = jwtUtil.generateEmailVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.username, verificationToken);
  }
}

export const authService = new AuthService();
