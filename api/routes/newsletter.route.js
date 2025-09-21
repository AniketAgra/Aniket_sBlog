import express from 'express';
import { subscribe, verifySubscription } from '../controllers/newsletter.controller.js';
import apiRateLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/subscribe', apiRateLimiter, subscribe);
router.get('/subscribe/verify', verifySubscription);

export default router;
