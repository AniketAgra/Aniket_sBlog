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
// Configure Helmet with CSP tuned for our app
const parseList = (val) => (val ? String(val).split(',').map(s => s.trim()).filter(Boolean) : []);
const extraImgDomains = parseList(process.env.ALLOWED_IMG_DOMAINS);
const extraConnectDomains = parseList(process.env.ALLOWED_CONNECT_DOMAINS);
const extraFrameDomains = parseList(process.env.ALLOWED_FRAME_DOMAINS);
app.use(helmet({
    // Allow OAuth popups/redirects to use window.opener without being blocked
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    // Allow loading cross-origin assets like images
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        useDefaults: true,
    directives: {
            // Default only from self
            defaultSrc: ["'self'"],
            // Allow styles from self and inline styles (used by many UI libs)
            styleSrc: ["'self'", "'unsafe-inline'"],
            // Scripts from self + Google APIs (for OAuth widgets)
            scriptSrc: ["'self'", 'https://apis.google.com', 'https://www.gstatic.com', 'https://accounts.google.com'],
            // Be explicit for element-level script policy too
            scriptSrcElem: ["'self'", 'https://apis.google.com', 'https://www.gstatic.com', 'https://accounts.google.com'],
            // Images from self, data URIs, blobs, and selected trusted hosts
            imgSrc: [
                "'self'",
                'data:',
                'blob:',
                'https://imgs.search.brave.com',
                'https://via.placeholder.com',
                'https://res.cloudinary.com',
                'https://i.pravatar.cc',
                'https://lh3.googleusercontent.com',
                'https://*.googleusercontent.com',
                ...extraImgDomains,
            ],
            // XHR/fetch targets: self, Cloudinary API, and Firebase/Google auth endpoints
            connectSrc: [
                "'self'",
                'https://api.cloudinary.com',
                'https://apis.google.com',
                'https://www.googleapis.com',
                'https://securetoken.googleapis.com',
                'https://identitytoolkit.googleapis.com',
                'https://oauth2.googleapis.com',
                'https://www.gstatic.com',
                ...extraConnectDomains,
            ],
            // Allow Google auth frames/popups
            frameSrc: [
                "'self'",
                'https://accounts.google.com',
                'https://apis.google.com',
                // Firebase Auth helper iframe lives on project .firebaseapp.com
                'https://*.firebaseapp.com',
                'https://*.googleusercontent.com',
                ...extraFrameDomains,
            ],
            // Older browsers still rely on childSrc for frames/workers
            childSrc: [
                "'self'",
                'https://accounts.google.com',
                'https://apis.google.com',
                'https://*.firebaseapp.com',
                'https://*.googleusercontent.com',
                ...extraFrameDomains,
            ],
            // Forms (in case any direct POST to Cloudinary is used)
            formAction: ["'self'", 'https://api.cloudinary.com'],
            // Workers and media if blobs are used
            workerSrc: ["'self'", 'blob:'],
            mediaSrc: ["'self'", 'blob:'],
            // Allow preloading fonts/images
            objectSrc: ["'none'"],
            frameAncestors: ["'self'"],
        },
    },
}));
// CORS
// Allow local dev frontends, optional FRONTEND_URL, and Render external URL in production
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URLS, // optional comma-separated
    process.env.RENDER_EXTERNAL_URL, // e.g., https://your-service.onrender.com
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
]
    .filter(Boolean)
    .flatMap(o => (typeof o === 'string' ? o.split(',').map(s => s.trim()).filter(Boolean) : []));

const corsApiOptions = {
    origin: (origin, callback) => {
        // allow no-origin (curl, same-origin navigations) and explicit allow-list
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

// Apply CORS only to API routes (avoid blocking static assets)
app.use('/api', cors(corsApiOptions));
app.options('/api/*', cors(corsApiOptions));

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
// Allow public assets to be fetched cross-origin (useful if HTML is hosted elsewhere)
app.use('/assets', cors({ origin: true, credentials: false }), express.static(path.join(publicDir, 'assets')));
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
