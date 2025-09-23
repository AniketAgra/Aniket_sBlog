import express from 'express';
import { authOptional } from '../middleware/authOptional.js';
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
router.get('/projects/:id/counters', getProjectCounters);
// Alias route to fetch a single project by id or slug
router.post('/projects/:id/like', authOptional, likeProject);
router.post('/projects/:id/comments', authOptional, commentOnProject);
router.get('/projects/:id/comments', authOptional, getProjectComments);

export default router;
