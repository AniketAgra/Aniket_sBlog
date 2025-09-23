import express from 'express';
import { authOptional } from '../middleware/authOptional.js';
import {
  listPosts,
  getPost,
  likePost,
  commentOnPost,
  getPostComments,
  getPostCounters,
  getRelatedPosts,
} from '../controllers/post.controller.js';

const router = express.Router();

router.get('/posts', listPosts);
router.get('/posts/:id', authOptional, getPost); // id or slug
router.get('/posts/:id/counters', getPostCounters);
router.get('/posts/:id/related', getRelatedPosts);
// Alias route to fetch a single blog post by id or slug
router.post('/posts/:id/like', authOptional, likePost);
router.post('/posts/:id/comments', authOptional, commentOnPost);
router.get('/posts/:id/comments', authOptional, getPostComments);

export default router;
