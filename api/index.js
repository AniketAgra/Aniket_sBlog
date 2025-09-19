import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import userRoutes from '../api/routes/user.route.js';
import authRoutes from '../api/routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

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

// Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: {
            statusCode,
            message: err.message || 'Internal Server Error',
            stack: process.env.NODE_ENV === 'development' ? err.stack : null, // Show stack in dev only
        }
    });
});

// Start Server AFTER middlewares and routes
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
