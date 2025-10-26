import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config/env.config';
import { UserRole } from '../../database/models/user.model';

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class JWTUtil {
  generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);
  }

  generateTokenPair(payload: JWTPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

export const jwtUtil = new JWTUtil();
