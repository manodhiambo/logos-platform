import Joi from 'joi';
import { UserRole, UserStatus } from '../../../database/models/user.model';

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

// Delete user validation - FIXED: Made fields optional
export const deleteUserSchema = Joi.object({
  params: Joi.object({
    userId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    deleteType: Joi.string().valid('soft', 'hard').optional().default('soft').messages({
      'any.only': 'Delete type must be either "soft" or "hard"',
    }),
    reason: Joi.string().max(500).optional().messages({
      'string.max': 'Reason must not exceed 500 characters',
    }),
  }),
});

// Get users list validation
export const getUsersListSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(20),
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .optional(),
    status: Joi.string()
      .valid(...Object.values(UserStatus))
      .optional(),
    search: Joi.string().max(255).optional(),
    sortBy: Joi.string().valid('createdAt', 'fullName', 'email', 'role').optional().default('createdAt'),
    sortOrder: Joi.string().valid('ASC', 'DESC').optional().default('DESC'),
  }),
});

// Create announcement validation
export const createAnnouncementSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().max(255).required().messages({
      'any.required': 'Title is required',
      'string.max': 'Title must not exceed 255 characters',
    }),
    content: Joi.string().required().messages({
      'any.required': 'Content is required',
    }),
    type: Joi.string().valid('info', 'warning', 'urgent', 'maintenance').optional().default('info'),
    priority: Joi.string().valid('low', 'medium', 'high').optional().default('medium'),
    status: Joi.string().valid('draft', 'published', 'archived').optional().default('draft'),
    isGlobal: Joi.boolean().optional().default(true),
    expiresAt: Joi.date().iso().optional().allow(null),
  }),
});

// Update announcement validation
export const updateAnnouncementSchema = Joi.object({
  params: Joi.object({
    announcementId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().max(255).optional(),
    content: Joi.string().optional(),
    type: Joi.string().valid('info', 'warning', 'urgent', 'maintenance').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
    isGlobal: Joi.boolean().optional(),
    expiresAt: Joi.date().iso().optional().allow(null),
  }),
});

// Create user validation
export const createUserSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
      'any.required': 'Username is required',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must not exceed 30 characters',
    }),
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required',
      'string.email': 'Invalid email format',
    }),
    password: Joi.string().min(8).required().messages({
      'any.required': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
    }),
    fullName: Joi.string().max(100).required().messages({
      'any.required': 'Full name is required',
    }),
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .optional()
      .default(UserRole.USER),
    status: Joi.string()
      .valid(...Object.values(UserStatus))
      .optional()
      .default(UserStatus.ACTIVE),
  }),
});

// Get system stats validation
export const getSystemStatsSchema = Joi.object({
  query: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
  }),
});
