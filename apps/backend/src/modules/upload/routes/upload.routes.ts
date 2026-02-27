import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import {
  uploadPostImages,
  uploadPostVideo,
  uploadStatusMedia,
} from '../controllers/upload.controller';
import {
  uploadPostImages as uploadPostImagesMiddleware,
  uploadPostVideo as uploadPostVideoMiddleware,
  uploadStatusMedia as uploadStatusMediaMiddleware,
} from '../../../shared/middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

// Upload images for posts (up to 4 images)
router.post('/post-images', uploadPostImagesMiddleware.array('images', 4), uploadPostImages);

// Upload a video for posts
router.post('/post-video', uploadPostVideoMiddleware.single('video'), uploadPostVideo);

// Upload media (image or video) for status
router.post('/status-media', uploadStatusMediaMiddleware.single('media'), uploadStatusMedia);

export default router;
