import { Request, Response, NextFunction } from 'express';
import { jwtUtil } from '../utils/jwt.util';
import User, { UserRole, UserStatus } from '../../database/models/user.model';
import { AppError } from './error-handler.middleware';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided. Please login.', 401);
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwtUtil.verifyAccessToken(token);

    // Get user from database
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw new AppError('User not found. Please login again.', 401);
    }

    // Check if user is deleted
    if (user.isDeleted) {
      throw new AppError('This account has been deleted.', 403);
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(`Account is ${user.status}. Please contact support.`, 403);
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new AppError('Please verify your email before accessing this resource.', 403);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token. Please login again.', 401));
    }
  }
};

// Optional authentication (doesn't throw error if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwtUtil.verifyAccessToken(token);
      const user = await User.findByPk(decoded.userId);

      if (user && !user.isDeleted && user.status === UserStatus.ACTIVE) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Require specific role
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

// Require admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  if (!req.user.isAdmin()) {
    return next(new AppError('Admin access required.', 403));
  }

  next();
};

// Require super admin role
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  if (!req.user.isSuperAdmin()) {
    return next(new AppError('Super admin access required.', 403));
  }

  next();
};

// Require moderator or above
export const requireModerator = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  if (!req.user.isModerator()) {
    return next(new AppError('Moderator access required.', 403));
  }

  next();
};

// Require specific permission
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!req.user.canPerform(permission)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

// --- Added export to fix route imports ---
export const authMiddleware = authenticate;
