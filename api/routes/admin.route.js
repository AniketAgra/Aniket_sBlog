import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { createPost, updatePost, deletePost, analytics } from '../controllers/admin.controller.js';

const router = express.Router();

router.post('/posts', authenticate, requireAdmin, createPost);
router.patch('/posts/:id', authenticate, requireAdmin, updatePost);
router.delete('/posts/:id', authenticate, requireAdmin, deletePost);
router.get('/analytics', authenticate, requireAdmin, analytics);

export default router;
