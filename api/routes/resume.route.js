import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authOptional } from '../middleware/authOptional.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { downloadResume, listDownloads, getResumeStats } from '../controllers/resume.controller.js';

const router = express.Router();

// Resume download: authentication REQUIRED; user info taken from user model
router.post('/resume/download', authenticate, downloadResume);
// Backward compatible GET (now also requires auth)
router.get('/resume/download', authenticate, downloadResume);

// Admin endpoint to list logs
router.get('/admin/resume-downloads', authenticate, requireAdmin, listDownloads);
router.get('/admin/resume-downloads/stats', authenticate, requireAdmin, getResumeStats);

export default router;
