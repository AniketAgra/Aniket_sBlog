import express from 'express';
import { listPosts, getPostBySlug, likePost, commentOnPost } from '../controllers/post.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.get('/posts', listPosts);
router.get('/posts/:slug', getPostBySlug);
router.post('/posts/:id/like', authenticate, likePost);
router.post('/posts/:id/comment', authenticate, commentOnPost);

export default router;
