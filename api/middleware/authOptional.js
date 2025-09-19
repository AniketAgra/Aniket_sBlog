import jwt from 'jsonwebtoken';

const getToken = (req) => {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.split(' ')[1];
  return req.cookies?.access_token;
};

export const authOptional = (req, res, next) => {
  const token = getToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = payload?.id || payload?._id || payload?.userId;
    if (id) req.user = { id, role: payload?.role || 'user', ...payload };
  } catch (e) {
    // ignore invalid token in optional auth
  }
  return next();
};

export default authOptional;
