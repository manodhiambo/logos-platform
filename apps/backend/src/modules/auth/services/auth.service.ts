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
    const existingEmail = await User.findOne({
      where: { email: userData.email },
    });

    if (existingEmail) {
      throw new AppError('Email already registered', 400);
    }

    const existingUsername = await User.findOne({
      where: { username: userData.username },
    });

    if (existingUsername) {
      throw new AppError('Username already taken', 400);
    }

    const verificationToken = jwtUtil.generateEmailVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Create user with explicit type casting
    const user = await User.create({
      email: userData.email,
      username: userData.username,
      passwordHash: userData.password,
      fullName: userData.fullName,
      spiritualJourneyStage: userData.spiritualJourneyStage as any,
      denomination: userData.denomination,
      country: userData.country,
      timezone: userData.timezone,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    } as any);

    await Promise.all([
      emailService.sendWelcomeEmail(user.email, user.username),
      emailService.sendVerificationEmail(user.email, user.username, verificationToken),
    ]);

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const tokens = jwtUtil.generateTokenPair(payload);
    return { user, tokens };
  }

  async login(emailOrUsername: string, password: string): Promise<{ user: User; tokens: TokenPair }> {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.isDeleted) {
      throw new AppError('This account has been deleted', 403);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    if (user.status === UserStatus.BANNED) {
      throw new AppError('Your account has been banned.', 403);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const tokens = jwtUtil.generateTokenPair(payload);
    return { user, tokens };
  }

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

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return;
    }

    const resetToken = jwtUtil.generatePasswordResetToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, user.username, resetToken);
  }

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

    user.passwordHash = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return user;
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwtUtil.verifyRefreshToken(refreshToken);
      const user = await User.findByPk(decoded.userId);

      if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
        throw new AppError('Invalid refresh token', 401);
      }

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

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.passwordHash = newPassword;
    await user.save();
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.emailVerified) {
      throw new AppError('Email already verified', 400);
    }

    const verificationToken = jwtUtil.generateEmailVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    await emailService.sendVerificationEmail(user.email, user.username, verificationToken);
  }
}

export const authService = new AuthService();
