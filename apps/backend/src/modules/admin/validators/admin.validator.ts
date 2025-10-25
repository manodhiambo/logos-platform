import Joi from 'joi';
import { UserRole, UserStatus, SpiritualJourneyStage } from '../../../database/models/user.model';

// Update user role validation
export const updateUserRoleSchema = Joi.object({
  params: Joi.object({
    userId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .required()
      .messages({
        'any.only': 'Invalid role specified',
        'any.required': 'Role is required',
      }),
  }),
});

// Update user status validation
export const updateUserStatusSchema = Joi.object({
  params: Joi.object({
    userId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    status: Joi.string()
      .valid(...Object.values(UserStatus))
      .required()
      .messages({
        'any.only': 'Invalid status specified',
        'any.required': 'Status is required',
      }),
    reason: Joi.string().max(500).optional(),
  }),
});

// Delete user validation
export const deleteUserSchema = Joi.object({
  params: Joi.object({
    userId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    deleteType: Joi.string().valid('soft', 'hard').required().messages({
      'any.only': 'Delete type must be either "soft" or "hard"',
      'any.required': 'Delete type is required',
    }),
    reason: Joi.string().max(500).required().messages({
      'any.required': 'Reason for deletion is required',
    }),
  }),
});

// Get users list validation
export const getUsersListSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    role: Joi.string().valid(...Object.values(UserRole)).optional(),
    status: Joi.string().valid(...Object.values(UserStatus)).optional(),
    search: Joi.string().max(100).optional(),
    sortBy: Joi.string().valid('createdAt', 'lastLoginAt', 'fullName', 'email').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    includeDeleted: Joi.boolean().default(false),
  }),
});

// Create announcement validation
export const createAnnouncementSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(5).max(200).required().messages({
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title must not exceed 200 characters',
      'any.required': 'Title is required',
    }),
    content: Joi.string().min(10).required().messages({
      'string.min': 'Content must be at least 10 characters',
      'any.required': 'Content is required',
    }),
    type: Joi.string().valid('general', 'maintenance', 'feature', 'event', 'urgent').required(),
    priority: Joi.number().integer().min(1).max(5).default(3),
    isGlobal: Joi.boolean().default(true),
    targetCommunityId: Joi.string().uuid().optional().allow(null),
    expiresAt: Joi.date().greater('now').optional().allow(null),
  }),
});

// Update announcement validation
export const updateAnnouncementSchema = Joi.object({
  params: Joi.object({
    announcementId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    content: Joi.string().min(10).optional(),
    type: Joi.string().valid('general', 'maintenance', 'feature', 'event', 'urgent').optional(),
    priority: Joi.number().integer().min(1).max(5).optional(),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
    expiresAt: Joi.date().greater('now').optional().allow(null),
  }),
});

// Delete content validation
export const deleteContentSchema = Joi.object({
  params: Joi.object({
    contentId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    contentType: Joi.string().valid('post', 'comment', 'prayer').required(),
    deleteType: Joi.string().valid('soft', 'hard').required(),
    reason: Joi.string().max(500).required(),
  }),
});

// Create user manually (admin)
export const createUserSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).required(),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid(...Object.values(UserRole)).default('user'),
    spiritualJourneyStage: Joi.string()
      .valid(...Object.values(SpiritualJourneyStage))
      .required(),
    emailVerified: Joi.boolean().default(false),
    status: Joi.string().valid(...Object.values(UserStatus)).default('active'),
  }),
});

// Get system stats validation
export const getSystemStatsSchema = Joi.object({
  query: Joi.object({
    period: Joi.string().valid('day', 'week', 'month', 'year', 'all').default('month'),
  }),
});
