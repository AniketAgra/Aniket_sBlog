import { errorHandler } from '../utils/error.js';

export const requireAdmin = (req, res, next) => {
  if (!req.user) return next(errorHandler(401, 'Authentication required'));
  if (req.user.role !== 'admin') return next(errorHandler(403, 'Admin access required'));
  return next();
};

export default requireAdmin;
