import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  createPrayerRequestValidation,
  updatePrayerStatusValidation,
} from '../validators/prayer.validator';
import {
  createPrayerRequest,
  getPrayerRequests,
  getPrayerRequestById,
  updatePrayerStatus,
  deletePrayerRequest,
  prayForRequest,
  getUserPrayers,
} from '../controllers/prayer.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Prayer request routes
router.post('/requests', createPrayerRequestValidation, validate, createPrayerRequest);
router.get('/requests', getPrayerRequests);
router.get('/requests/:requestId', getPrayerRequestById);
router.put('/requests/:requestId/status', updatePrayerStatusValidation, validate, updatePrayerStatus);
router.delete('/requests/:requestId', deletePrayerRequest);

// Prayer actions
router.post('/requests/:requestId/pray', prayForRequest);

// User's prayers
router.get('/my-prayers', getUserPrayers);

export default router;
