import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  getPostLikes,
} from '../controllers/post.controller';
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller';
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
router.get('/:postId/likes', getPostLikes);

// Post comments
router.post('/:postId/comments', addComment);
router.get('/:postId/comments', getComments);

// Comment operations (optional, if you want direct comment access)
router.put('/comments/:commentId', updateComment);
router.delete('/comments/:commentId', deleteComment);

export default router;
