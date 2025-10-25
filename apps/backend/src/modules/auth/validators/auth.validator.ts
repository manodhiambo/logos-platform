import Joi from 'joi';
import { SpiritualJourneyStage } from '../../../database/models/user.model';

// Register validation schema
export const registerSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    username: Joi.string()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required()
      .messages({
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username must not exceed 30 characters',
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
        'any.required': 'Username is required',
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
        'any.required': 'Password is required',
      }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password',
    }),
    fullName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Full name must be at least 2 characters',
      'any.required': 'Full name is required',
    }),
    spiritualJourneyStage: Joi.string()
      .valid(...Object.values(SpiritualJourneyStage))
      .required()
      .messages({
        'any.only': 'Please select a valid spiritual journey stage',
        'any.required': 'Spiritual journey stage is required',
      }),
    denomination: Joi.string().max(100).optional().allow(''),
    country: Joi.string().max(100).optional().allow(''),
    timezone: Joi.string().max(100).optional().allow(''),
  }),
});

// Login validation schema
export const loginSchema = Joi.object({
  body: Joi.object({
    emailOrUsername: Joi.string().required().messages({
      'any.required': 'Email or username is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
});

// Forgot password validation schema
export const forgotPasswordSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),
});

// Reset password validation schema
export const resetPasswordSchema = Joi.object({
  body: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required',
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
        'any.required': 'Password is required',
      }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password',
    }),
  }),
});

// Verify email validation schema
export const verifyEmailSchema = Joi.object({
  body: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Verification token is required',
    }),
  }),
});

// Refresh token validation schema
export const refreshTokenSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required',
    }),
  }),
});

// Change password validation schema
export const changePasswordSchema = Joi.object({
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters',
        'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
        'any.required': 'New password is required',
      }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your new password',
    }),
  }),
});

// Update profile validation schema
export const updateProfileSchema = Joi.object({
  body: Joi.object({
    fullName: Joi.string().min(2).max(100).optional(),
    bio: Joi.string().max(500).optional().allow(''),
    denomination: Joi.string().max(100).optional().allow(''),
    country: Joi.string().max(100).optional().allow(''),
    timezone: Joi.string().max(100).optional().allow(''),
    spiritualJourneyStage: Joi.string()
      .valid(...Object.values(SpiritualJourneyStage))
      .optional(),
    preferredBibleTranslation: Joi.string()
      .valid('NKJV', 'NIV', 'KJV', 'ESV')
      .optional(),
    notificationSettings: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      prayer: Joi.boolean().optional(),
      devotional: Joi.boolean().optional(),
      announcements: Joi.boolean().optional(),
    }).optional(),
  }),
});
