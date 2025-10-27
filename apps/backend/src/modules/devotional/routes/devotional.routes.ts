import { Router } from 'express';
import devotionalController from '../controllers/devotional.controller';
import { authenticate, optionalAuth } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  devotionalIdValidator,
  addNotesValidator,
  getDevotionalsValidator,
} from '../validators/devotional.validator';

const router = Router();

/**
 * @route   GET /api/v1/devotionals
 * @desc    Get all devotionals
 * @access  Public (but progress shown if authenticated)
 */
router.get(
  '/',
  optionalAuth,
  getDevotionalsValidator,
  validate,
  devotionalController.getDevotionals
);

/**
 * @route   GET /api/v1/devotionals/today
 * @desc    Get today's devotional
 * @access  Public (but progress shown if authenticated)
 */
router.get(
  '/today',
  optionalAuth,
  devotionalController.getTodaysDevotional
);

/**
 * @route   GET /api/v1/devotionals/my-progress
 * @desc    Get user's devotional progress
 * @access  Private
 */
router.get(
  '/my-progress',
  authenticate,
  devotionalController.getUserProgress
);

/**
 * @route   GET /api/v1/devotionals/my-stats
 * @desc    Get user's devotional stats
 * @access  Private
 */
router.get(
  '/my-stats',
  authenticate,
  devotionalController.getUserStats
);

/**
 * @route   GET /api/v1/devotionals/:devotionalId
 * @desc    Get devotional by ID
 * @access  Public (but progress shown if authenticated)
 */
router.get(
  '/:devotionalId',
  optionalAuth,
  devotionalIdValidator,
  validate,
  devotionalController.getDevotionalById
);

/**
 * @route   POST /api/v1/devotionals/:devotionalId/complete
 * @desc    Mark devotional as complete
 * @access  Private
 */
router.post(
  '/:devotionalId/complete',
  authenticate,
  devotionalIdValidator,
  validate,
  devotionalController.markAsComplete
);

/**
 * @route   POST /api/v1/devotionals/:devotionalId/notes
 * @desc    Add or update notes for a devotional
 * @access  Private
 */
router.post(
  '/:devotionalId/notes',
  authenticate,
  addNotesValidator,
  validate,
  devotionalController.addNotes
);

export default router;
