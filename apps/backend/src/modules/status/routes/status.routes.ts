import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import {
  createStatus,
  getFeedStatuses,
  getStatusesByUser,
  getMyStatuses,
  getUserStatuses,
  viewStatus,
  deleteStatus,
  cleanupStatuses,
} from '../controllers/status.controller';

const router = Router();

router.use(authenticate);

router.post('/', createStatus);
router.get('/feed', getFeedStatuses);
router.get('/grouped', getStatusesByUser);
router.get('/my', getMyStatuses);
router.get('/user/:userId', getUserStatuses);
router.post('/:statusId/view', viewStatus);
router.delete('/:statusId', deleteStatus);
router.post('/cleanup', cleanupStatuses);

export default router;
