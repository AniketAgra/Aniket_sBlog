import express from 'express';
import { authOptional } from '../middleware/authOptional.js';
import authenticate from '../middleware/authenticate.js';
import { toggleLikeOnComment, createReply, getReplies, updateComment, deleteComment } from '../controllers/comment.controller.js';

const router = express.Router();

// Toggle like on a comment (auth required)
router.post('/comments/:id/like', authenticate, toggleLikeOnComment);

// Create a reply under a comment (auth required)
router.post('/comments/:id/replies', authenticate, createReply);

// List replies for a comment
router.get('/comments/:id/replies', getReplies);

// Edit comment (owner or admin)
router.put('/comments/:id', authenticate, updateComment);

// Delete comment (owner or admin)
router.delete('/comments/:id', authenticate, deleteComment);

// Fallback aliases for hosts/proxies that block PUT/DELETE
// These mirror the handlers above but use POST verb so clients can opt-in when needed
router.post('/comments/:id/update', authenticate, updateComment);
router.post('/comments/:id/delete', authenticate, deleteComment);

export default router;
