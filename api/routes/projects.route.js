import express from 'express';
import { authOptional } from '../middleware/authOptional.js';
import {
  listProjects,
  getProject,
  likeProject,
  commentOnProject,
} from '../controllers/post.controller.js';

const router = express.Router();

router.get('/projects', listProjects);
router.get('/projects/:id', getProject);
// Alias route to fetch a single project by id or slug
router.post('/projects/:id/like', authOptional, likeProject);
router.post('/projects/:id/comments', authOptional, commentOnProject);

export default router;
