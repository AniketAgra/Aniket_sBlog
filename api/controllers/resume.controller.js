import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ResumeDownload from '../models/resumeDownload.model.js';
import { errorHandler } from '../utils/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve resume path: prefer api/static/resume.pdf, fallback to client/public/resume.pdf
const getResumePath = () => {
  const apiPath = path.resolve(__dirname, '../static/resume.pdf');
  if (fs.existsSync(apiPath)) return apiPath;
  const projectRoot = path.resolve(__dirname, '../../');
  const clientPublic = path.resolve(projectRoot, 'client/public/resume.pdf');
  if (fs.existsSync(clientPublic)) return clientPublic;
  return null;
};

export const downloadResume = async (req, res, next) => {
  try {
    if (!req.user) return next(errorHandler(401, 'Authentication required'));
    const resumePath = getResumePath();
    if (!resumePath) return next(errorHandler(404, 'Resume not found'));

    // Log download (non-blocking)
    const { id: userId, email, username, name } = req.user || {};
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip;
    const userAgent = req.headers['user-agent'];
    ResumeDownload.create({ userId, email, username, name, ip, userAgent }).catch(() => {});

    // Stream file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    const stream = fs.createReadStream(resumePath);
    stream.on('error', (err) => next(err));
    stream.pipe(res);
  } catch (e) {
    next(e);
  }
};

export const listDownloads = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      ResumeDownload.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ResumeDownload.countDocuments({}),
    ]);
    res.json({ items, page, total });
  } catch (e) {
    next(e);
  }
};
