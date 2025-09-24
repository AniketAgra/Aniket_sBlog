import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import userRoutes from '../api/routes/user.route.js';
import authRoutes from '../api/routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import adminRoutes from '../api/routes/admin.js';
import publicPostsRoutes from './routes/posts.routes.js';
import publicProjectsRoutes from './routes/projects.route.js';
import uploadRoutes from '../api/routes/upload.route.js';
import resumeRoutes from '../api/routes/resume.route.js';
import newsletterRoutes from '../api/routes/newsletter.route.js';
import commentsRoutes from '../api/routes/comments.route.js';
// Fallback direct bindings in case router import fails silently in some environments
import { subscribe as subscribeController, verifySubscription as verifySubscriptionController } from '../api/controllers/newsletter.controller.js';
import apiRateLimiter from '../api/middleware/rateLimiter.js';

// Load env from api/.env, and if not found, try project root ../.env
dotenv.config();
if (!process.env.MONGO_URL) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootEnvPath = path.resolve(__dirname, '../.env');
    dotenv.config({ path: rootEnvPath });
}

if (!process.env.MONGO_URL) {
    console.error('Missing MONGO_URL in environment. Create an .env file in api/ or project root with MONGO_URL and JWT_SECRET.');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB successfully"))
.catch(err => console.error("MongoDB Connection Error:", err));

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
// CORS for dev frontends (5173/5175) and optional FRONTEND_URL env
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // allow no-origin (like curl or same-origin proxy) and allowed list
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Static file serving for uploads
import { fileURLToPath as __f } from 'url';
const __filename2 = __f(import.meta.url);
const __dirname2 = path.dirname(__filename2);
app.use('/uploads', express.static(path.resolve(__dirname2, './uploads')));
// Optional api/static for serving generic assets (not used for resume since it's protected)
app.use('/static', express.static(path.resolve(__dirname2, './static')));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicPostsRoutes);
app.use('/api', publicProjectsRoutes);
app.use('/api', uploadRoutes);
app.use('/api', resumeRoutes);
app.use('/api', newsletterRoutes);
app.use('/api', commentsRoutes);

// Serve built frontend from api/public and SPA fallback for non-API routes
const publicDir = path.resolve(__dirname2, './public');
app.use(express.static(publicDir));
app.get('*', (req, res, next) => {
    // Don't hijack API routes
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(publicDir, 'index.html'));
});

// Explicit endpoints to ensure availability (keeps same paths)
app.post('/api/subscribe', apiRateLimiter, subscribeController);
app.get('/api/subscribe/verify', verifySubscriptionController);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    // Log full error server-side for debugging
    console.error('[API Error]', {
        path: req.method + ' ' + req.originalUrl,
        statusCode,
        message: err?.message,
        stack: err?.stack,
    });
    res.status(statusCode).json({
        success: false,
        error: {
            statusCode,
            message: err.message || 'Internal Server Error',
            stack: process.env.NODE_ENV === 'development' ? err.stack : null,
        }
    });
});

// Start Server AFTER middlewares and routes
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
