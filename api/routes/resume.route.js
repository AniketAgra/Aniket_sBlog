import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { downloadResume, listDownloads } from '../controllers/resume.controller.js';

const router = express.Router();

// Protected resume download
router.get('/resume/download', authenticate, downloadResume);

// Admin endpoint to list logs
router.get('/admin/resume-downloads', authenticate, requireAdmin, listDownloads);

export default router;
