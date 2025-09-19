import express from 'express';
import { authOptional } from '../middleware/authOptional.js';
import {
  getProject,
  likeProject,
  commentOnProject,
} from '../controllers/postController.js';

const router = express.Router();

router.get('/projects/:id', getProject);
router.post('/projects/:id/like', authOptional, likeProject);
router.post('/projects/:id/comments', authOptional, commentOnProject);

export default router;
