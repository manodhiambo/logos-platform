import { Router } from 'express';
import videoCallController from '../controllers/video-call.controller';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  createCallValidator,
  callIdValidator,
  updateParticipantValidator,
} from '../validators/video-call.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/video-calls
 * @desc    Create a new video call
 * @access  Private
 */
router.post('/', createCallValidator, validate, videoCallController.createCall);

/**
 * IMPORTANT: Specific routes MUST come before parameterized routes
 */

/**
 * @route   GET /api/v1/video-calls/active/all
 * @desc    Get all active calls
 * @access  Private
 */
router.get('/active/all', videoCallController.getActiveCalls);

/**
 * @route   GET /api/v1/video-calls/scheduled/all
 * @desc    Get scheduled calls
 * @access  Private
 */
router.get('/scheduled/all', videoCallController.getScheduledCalls);

/**
 * @route   GET /api/v1/video-calls/history/me
 * @desc    Get user's call history
 * @access  Private
 */
router.get('/history/me', videoCallController.getCallHistory);

/**
 * Now the parameterized routes
 */

/**
 * @route   GET /api/v1/video-calls/:callId
 * @desc    Get call details
 * @access  Private
 */
router.get('/:callId', callIdValidator, validate, videoCallController.getCallById);

/**
 * @route   POST /api/v1/video-calls/:callId/join
 * @desc    Join a video call
 * @access  Private
 */
router.post('/:callId/join', callIdValidator, validate, videoCallController.joinCall);

/**
 * @route   POST /api/v1/video-calls/:callId/leave
 * @desc    Leave a video call
 * @access  Private
 */
router.post('/:callId/leave', callIdValidator, validate, videoCallController.leaveCall);

/**
 * @route   POST /api/v1/video-calls/:callId/end
 * @desc    End a video call (host only)
 * @access  Private
 */
router.post('/:callId/end', callIdValidator, validate, videoCallController.endCall);

/**
 * @route   PUT /api/v1/video-calls/:callId/participant
 * @desc    Update participant status (mute/video)
 * @access  Private
 */
router.put(
  '/:callId/participant',
  updateParticipantValidator,
  validate,
  videoCallController.updateParticipantStatus
);

export default router;
