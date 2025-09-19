import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
    const token = req.cookies?.access_token; // Ensure token is fetched correctly

    if (!token) {
        return next(errorHandler(403, "Access denied. No token provided."));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return next(errorHandler(401, "Invalid or expired token."));
        }

        // Normalize user id from various payload shapes
        const normalizedId = payload?._id || payload?.userId || payload?.id;
        if (!normalizedId) {
            return next(errorHandler(401, "Invalid token payload."));
        }

        req.user = { _id: normalizedId, ...payload };
        next();
    });
};
