import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  addComment,
  getComments,
} from '../controllers/post.controller';
import { authenticate } from '../../../shared/middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Post CRUD
router.post('/', createPost);
router.get('/', getPosts);
router.get('/:postId', getPostById);
router.put('/:postId', updatePost);
router.delete('/:postId', deletePost);

// Post interactions
router.post('/:postId/like', likePost);
router.post('/:postId/comments', addComment);
router.get('/:postId/comments', getComments);

export default router;
