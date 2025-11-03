import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  createPrayerRequestValidation,
  updatePrayerStatusValidation,
} from '../validators/prayer.validator';
import prayerController from '../controllers/prayer.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Prayer request routes
router.post('/requests', createPrayerRequestValidation, validate, prayerController.createPrayerRequest);
router.get('/requests', prayerController.getPrayerRequests);
router.get('/requests/me', prayerController.getMyPrayerRequests);
router.get('/requests/:requestId', prayerController.getPrayerRequestById);
router.put('/requests/:requestId', prayerController.updatePrayerRequest);
router.put('/requests/:requestId/status', updatePrayerStatusValidation, validate, prayerController.updateStatus);
router.delete('/requests/:requestId', prayerController.deletePrayerRequest);

// Prayer actions
router.post('/requests/:requestId/pray', prayerController.prayForRequest);

// User's prayers (prayers they've prayed for others)
router.get('/my-prayers', prayerController.getPrayers);

export default router;
