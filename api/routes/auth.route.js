import express from "express";
import { signin,signup, google, signout, forgotPassword, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

// Legacy endpoints
router.post('/signup', signup);
router.post('/signin', signin);
// New contract aliases
router.post('/register', signup);
router.post('/login', signin);
router.post('/google', google)
router.post('/signout', signout)
// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;