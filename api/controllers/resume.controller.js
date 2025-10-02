import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ResumeDownload from '../models/resumeDownload.model.js';
import User from '../models/user.model.js';
import { resumeDownloadInfoSchema } from '../utils/validation.js';
import { errorHandler } from '../utils/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve resume path in a few common locations (first hit wins)
// 1) api/static/resume.pdf (preferred, protected assets)
// 2) api/public/resume.pdf (legacy)
// 3) client/public/resume.pdf (legacy/dev fallback)
const getResumePath = () => {
  const locations = [
    path.resolve(__dirname, '../static/resume.pdf'),
    path.resolve(__dirname, '../public/resume.pdf'),
    path.resolve(__dirname, '../../client/public/resume.pdf'),
  ];
  for (const p of locations) {
    try {
      if (fs.existsSync(p)) return p;
    } catch (_) {
      // ignore
    }
  }
  return null;
};

export const downloadResume = async (req, res, next) => {
  try {
    const resumePath = getResumePath();
    if (!resumePath) {
      // Provide a helpful hint for setup
      return next(errorHandler(404, 'Resume not found. Place your PDF at api/static/resume.pdf'));
    }

    // Authentication is required by route middleware. Derive user info from DB to ensure correctness.
    const userId = req.user?.id;
    if (!userId) return next(errorHandler(401, 'Authentication required'));

    // Load fresh user data (username, name, email)
    let username, name, email;
    try {
      const user = await User.findById(userId).select('username name email').lean();
      if (!user) return next(errorHandler(401, 'User not found'));
      username = user.username;
      name = user.name || user.username;
      email = user.email;
    } catch (e) {
      return next(e);
    }
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip;
  const userAgent = req.headers['user-agent'] || '';
  // Simple device detection
  const ua = userAgent.toLowerCase();
  let device = 'desktop';
  if (/mobile|iphone|ipod|android(?!.*tablet)/.test(ua)) device = 'mobile';
  else if (/ipad|tablet/.test(ua)) device = 'tablet';
  else if (/windows/.test(ua)) device = 'desktop-windows';
  else if (/mac os x|macintosh/.test(ua)) device = 'desktop-mac';
  else if (/linux/.test(ua)) device = 'desktop-linux';
  else if (/bot|crawler|spider/.test(ua)) device = 'bot';

  ResumeDownload.create({ userId, email, username, name, ip, userAgent, device }).catch(() => {});

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
    const { q = '', dateFrom, dateTo } = req.query;
    const filter = {};
    if (q) {
      const rx = new RegExp(q.toString().trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { username: rx },
        { name: rx },
        { email: rx },
        { ip: rx },
      ];
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    const [itemsRaw, total] = await Promise.all([
      ResumeDownload.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ResumeDownload.countDocuments(filter),
    ]);

    // Fill missing usernames by looking up associated users in bulk
    let items = itemsRaw;
    try {
      const missing = itemsRaw.filter((it) => !it.username && it.userId).map((it) => it.userId);
      if (missing.length) {
        const users = await User.find({ _id: { $in: missing } }).select('_id username').lean();
        const map = new Map(users.map((u) => [String(u._id), u.username]));
        items = itemsRaw.map((it) => {
          if (!it.username && it.userId) {
            const u = map.get(String(it.userId));
            if (u) return { ...it, username: u };
          }
          return it;
        });
      }
    } catch (_) {
      // graceful fallback without enrichment
    }
    res.json({ items, page, total, pageSize: limit });
  } catch (e) {
    next(e);
  }
};

// Stats for admin dashboard cards and charts
export const getResumeStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, monthCount, uniqueVisitors, topUsers] = await Promise.all([
      ResumeDownload.estimatedDocumentCount(),
      ResumeDownload.countDocuments({ createdAt: { $gte: startOfMonth } }),
      ResumeDownload.distinct('userId').then((arr) => arr.filter(Boolean).length),
      ResumeDownload.aggregate([
        // Prefer stored username; fallback to name; otherwise 'anonymous'
        {
          $group: {
            _id: {
              $cond: [
                { $ifNull: ['$username', false] },
                '$username',
                {
                  $cond: [
                    { $ifNull: ['$name', false] },
                    '$name',
                    'anonymous',
                  ],
                },
              ],
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.json({
      total,
      monthCount,
      uniqueVisitors,
      topUsers: topUsers.map((x) => ({ username: x._id || 'anonymous', count: x.count })),
    });
  } catch (e) {
    next(e);
  }
};
