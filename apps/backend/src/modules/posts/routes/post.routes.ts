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
import commentController from '../controllers/comment.controller';
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
router.post('/:postId/comments', commentController.addComment.bind(commentController));
router.get('/:postId/comments', commentController.getComments.bind(commentController));

// Comment operations
router.put('/comments/:commentId', commentController.updateComment.bind(commentController));
router.delete('/comments/:commentId', commentController.deleteComment.bind(commentController));
router.post('/comments/:commentId/like', commentController.toggleLike.bind(commentController));

export default router;
