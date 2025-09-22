import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  createPost, updatePost, deletePost,
  createProject, updateProject, deleteProject,
  getAnalytics,
} from '../controllers/post.controller.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.post('/posts', createPost);
router.patch('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);

router.post('/projects', createProject);
router.patch('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

router.get('/analytics', getAnalytics);

export default router;
