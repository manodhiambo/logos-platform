import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { uploadAvatar } from '../../../shared/config/upload.config';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Profile routes (require authentication)
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/password', authenticate, authController.updatePassword);
router.post('/avatar', authenticate, uploadAvatar.single('avatar'), authController.uploadAvatar);

export default router;
