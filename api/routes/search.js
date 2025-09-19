import express from 'express';
import { searchAll } from '../controllers/postController.js';

const router = express.Router();

router.get('/search', searchAll);

export default router;
