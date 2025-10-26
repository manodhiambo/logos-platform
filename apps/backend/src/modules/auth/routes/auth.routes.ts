import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateWithJoi } from '../../../shared/middlewares/validation.middleware';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/register', validateWithJoi(registerSchema), authController.register);
router.post('/login', validateWithJoi(loginSchema), authController.login);
router.post('/verify-email', validateWithJoi(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);
router.post('/forgot-password', validateWithJoi(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateWithJoi(resetPasswordSchema), authController.resetPassword);
router.post('/refresh-token', validateWithJoi(refreshTokenSchema), authController.refreshToken);

// Protected routes (require authentication)
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validateWithJoi(changePasswordSchema), authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

export default router;
