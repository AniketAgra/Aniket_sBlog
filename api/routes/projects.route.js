import express from 'express';
import { authOptional } from '../middleware/authOptional.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  listProjects,
  getProject,
  likeProject,
  commentOnProject,
  getProjectComments,
  getProjectCounters,
} from '../controllers/post.controller.js';

const router = express.Router();

router.get('/projects', listProjects);
router.get('/projects/:id', authOptional, getProject);
router.get('/projects/:id/counters', authOptional, getProjectCounters);
// Alias route to fetch a single project by id or slug
router.post('/projects/:id/like', authenticate, likeProject);
router.post('/projects/:id/comments', authenticate, commentOnProject);
router.get('/projects/:id/comments', authOptional, getProjectComments);

export default router;
