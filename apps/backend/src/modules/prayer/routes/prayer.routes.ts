import { Router } from 'express';
import prayerController from '../controllers/prayer.controller';
import { authenticate, optionalAuth } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  createPrayerRequestValidator,
  updatePrayerRequestValidator,
  requestIdValidator,
  getPrayerRequestsValidator,
  prayForRequestValidator,
  updateStatusValidator,
} from '../validators/prayer.validator';

const router = Router();

/**
 * @route   POST /api/v1/prayers/requests
 * @desc    Create a prayer request
 * @access  Private
 */
router.post(
  '/requests',
  authenticate,
  createPrayerRequestValidator,
  validate,
  prayerController.createPrayerRequest
);

/**
 * @route   GET /api/v1/prayers/requests
 * @desc    Get prayer requests
 * @access  Public (but filtered by privacy)
 */
router.get(
  '/requests',
  optionalAuth,
  getPrayerRequestsValidator,
  validate,
  prayerController.getPrayerRequests
);

/**
 * @route   GET /api/v1/prayers/my-requests
 * @desc    Get user's own prayer requests
 * @access  Private
 */
router.get(
  '/my-requests',
  authenticate,
  prayerController.getMyPrayerRequests
);

/**
 * @route   GET /api/v1/prayers/requests/:requestId
 * @desc    Get prayer request by ID
 * @access  Public (but filtered by privacy)
 */
router.get(
  '/requests/:requestId',
  optionalAuth,
  requestIdValidator,
  validate,
  prayerController.getPrayerRequestById
);

/**
 * @route   PUT /api/v1/prayers/requests/:requestId
 * @desc    Update prayer request
 * @access  Private (owner only)
 */
router.put(
  '/requests/:requestId',
  authenticate,
  updatePrayerRequestValidator,
  validate,
  prayerController.updatePrayerRequest
);

/**
 * @route   DELETE /api/v1/prayers/requests/:requestId
 * @desc    Delete prayer request
 * @access  Private (owner only)
 */
router.delete(
  '/requests/:requestId',
  authenticate,
  requestIdValidator,
  validate,
  prayerController.deletePrayerRequest
);

/**
 * @route   POST /api/v1/prayers/requests/:requestId/pray
 * @desc    Pray for a request
 * @access  Private
 */
router.post(
  '/requests/:requestId/pray',
  authenticate,
  prayForRequestValidator,
  validate,
  prayerController.prayForRequest
);

/**
 * @route   GET /api/v1/prayers/requests/:requestId/prayers
 * @desc    Get prayers for a request
 * @access  Public
 */
router.get(
  '/requests/:requestId/prayers',
  requestIdValidator,
  validate,
  prayerController.getPrayers
);

/**
 * @route   PUT /api/v1/prayers/requests/:requestId/status
 * @desc    Update prayer request status
 * @access  Private (owner only)
 */
router.put(
  '/requests/:requestId/status',
  authenticate,
  updateStatusValidator,
  validate,
  prayerController.updateStatus
);

export default router;
