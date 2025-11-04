import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { validateRequest } from '../../../shared/middlewares/joi-validation.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), authController.register);

router.post('/verify-email', validateRequest(verifyEmailSchema), authController.verifyEmail);

router.post('/resend-verification', validateRequest(resendVerificationSchema), authController.resendVerification);

router.post('/login', validateRequest(loginSchema), authController.login);

router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);

router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);

router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.me);

router.put('/me', authenticate, authController.updateProfile);

router.post('/me/avatar', authenticate, authController.uploadAvatar);

router.put('/me/password', authenticate, authController.updatePassword);

export default router;
