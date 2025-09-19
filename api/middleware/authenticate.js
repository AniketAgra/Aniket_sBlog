import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';

// Extract token from Authorization: Bearer <token> or cookie 'access_token'
const getToken = (req) => {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.split(' ')[1];
  return req.cookies?.access_token;
};

export const authenticate = (req, res, next) => {
  const token = getToken(req);
  if (!token) return next(errorHandler(401, 'Authentication required'));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = payload?.id || payload?._id || payload?.userId;
    if (!id) return next(errorHandler(401, 'Invalid token payload'));
    req.user = { id, role: payload?.role || 'user', ...payload };
    return next();
  } catch (err) {
    return next(errorHandler(401, 'Invalid or expired token'));
  }
};

export default authenticate;
